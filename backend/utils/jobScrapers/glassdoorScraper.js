const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const Job = require('../../models/job.model');
const logger = require('../logger');

class GlassdoorScraper {
  constructor() {
    this.baseUrl = 'https://www.glassdoor.com/Job/jobs.htm';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    
    // Categories targeting women in professional roles
    this.targetCategories = [
      'Software Engineer',
      'Product Manager',
      'Data Scientist',
      'UX Designer',
      'Project Manager',
      'Marketing Manager',
      'Financial Analyst',
      'HR Manager',
      'Operations Manager',
      'Business Analyst'
    ];
  }

  // Main scraping method
  async scrapeJobs() {
    const results = {
      total: 0,
      new: 0,
      updated: 0,
      errors: 0
    };
    
    try {
      logger.info('Starting Glassdoor job scraping');
      
      // Launch browser for dynamic content scraping
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      // Scrape each category
      for (const category of this.targetCategories) {
        try {
          logger.info(`Scraping Glassdoor jobs for category: ${category}`);
          const categoryResults = await this.scrapeCategoryJobs(browser, category);
          
          results.total += categoryResults.total;
          results.new += categoryResults.new;
          results.updated += categoryResults.updated;
          results.errors += categoryResults.errors;
        } catch (error) {
          logger.error(`Error scraping Glassdoor jobs for category ${category}: ${error.message}`);
          results.errors++;
        }
      }
      
      await browser.close();
      logger.info(`Glassdoor job scraping completed. Total: ${results.total}, New: ${results.new}, Updated: ${results.updated}`);
      
      return results;
    } catch (error) {
      logger.error(`Error during Glassdoor job scraping: ${error.message}`);
      throw error;
    }
  }

  // Scrape jobs for a specific category
  async scrapeCategoryJobs(browser, category) {
    const results = {
      total: 0,
      new: 0,
      updated: 0,
      errors: 0
    };
    
    try {
      const page = await browser.newPage();
      await page.setUserAgent(this.userAgent);
      
      // Set viewport
      await page.setViewport({ width: 1366, height: 768 });
      
      // Navigate to search page with category
      const searchUrl = `${this.baseUrl}?sc.keyword=${encodeURIComponent(category)}&sortBy=date_desc`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      // Handle potential cookie consent/modal popups
      await this.handlePopups(page);
      
      // Wait for job cards to load
      await page.waitForSelector('[data-test="jobListing"]', { timeout: 10000 }).catch(() => {
        logger.warn('Could not find job listings selector, trying alternative approach');
      });
      
      // Scroll to load more jobs
      await this.scrollToLoadMore(page);
      
      // Extract job listings
      const jobListings = await page.evaluate(() => {
        const listings = [];
        const jobCards = document.querySelectorAll('[data-test="jobListing"]');
        
        jobCards.forEach(card => {
          try {
            const titleElement = card.querySelector('[data-test="job-link"]');
            const companyElement = card.querySelector('[data-test="employer-name"]');
            const locationElement = card.querySelector('[data-test="location"]');
            
            if (titleElement && companyElement) {
              const jobLink = titleElement.href;
              const jobId = jobLink.match(/\/job-listing\/([^\/]+)/)?.[1] || 
                            jobLink.match(/jobListingId=([^&]+)/)?.[1];
              
              listings.push({
                title: titleElement.innerText.trim(),
                company: companyElement.innerText.trim(),
                location: locationElement ? locationElement.innerText.trim() : 'Remote/Multiple Locations',
                link: jobLink,
                jobId: jobId
              });
            }
          } catch (error) {
            console.error('Error parsing Glassdoor job listing:', error);
          }
        });
        
        return listings;
      });
      
      logger.info(`Found ${jobListings.length} Glassdoor jobs for category: ${category}`);
      results.total = jobListings.length;
      
      // Process each job
      for (const jobListing of jobListings) {
        try {
          if (!jobListing.jobId) {
            logger.warn(`Skipping Glassdoor job with missing ID: ${jobListing.title}`);
            continue;
          }
          
          // Check if job already exists
          const existingJob = await Job.findOne({ 
            jobSource: 'glassdoor',
            externalId: jobListing.jobId
          });
          
          if (existingJob) {
            // Update existing job
            existingJob.title = jobListing.title;
            existingJob.company = jobListing.company;
            existingJob.location = jobListing.location;
            existingJob.sourceUrl = jobListing.link;
            existingJob.updatedAt = new Date();
            
            await existingJob.save();
            results.updated++;
          } else {
            // Get detailed job info
            const jobDetails = await this.scrapeJobDetails(page, jobListing.link);
            
            // Create new job
            const newJob = new Job({
              title: jobListing.title,
              company: jobListing.company,
              location: jobListing.location,
              description: jobDetails.description,
              requirements: jobDetails.requirements,
              responsibilities: jobDetails.responsibilities,
              salary: {
                min: jobDetails.salaryMin,
                max: jobDetails.salaryMax,
                currency: 'USD',
                isDisplayed: !!(jobDetails.salaryMin || jobDetails.salaryMax)
              },
              jobSource: 'glassdoor',
              sourceUrl: jobListing.link,
              externalId: jobListing.jobId,
              applicationUrl: jobDetails.applicationUrl,
              employmentType: jobDetails.employmentType || 'Full-time',
              logoUrl: jobDetails.logoUrl,
              category: category,
              datePosted: jobDetails.datePosted || new Date()
            });
            
            await newJob.save();
            results.new++;
          }
        } catch (error) {
          logger.error(`Error processing Glassdoor job ${jobListing.title}: ${error.message}`);
          results.errors++;
        }
      }
      
      await page.close();
      return results;
    } catch (error) {
      logger.error(`Error scraping Glassdoor category ${category}: ${error.message}`);
      throw error;
    }
  }

  // Handle popups and consent dialogs
  async handlePopups(page) {
    try {
      // Try to close cookie consent
      const cookieButton = await page.$('[data-test="cookie-consent-button"]');
      if (cookieButton) {
        await cookieButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Try to close other potential popups
      const closeButtons = await page.$$('button[aria-label="Close"]');
      for (const button of closeButtons) {
        await button.click().catch(() => {});
        await page.waitForTimeout(500);
      }
    } catch (error) {
      logger.warn(`Error handling Glassdoor popups: ${error.message}`);
    }
  }

  // Scroll to load more job listings
  async scrollToLoadMore(page) {
    try {
      // Scroll down a few times to load more jobs
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => {
          window.scrollBy(0, 1000);
        });
        
        // Wait for content to load
        await page.waitForTimeout(1000);
      }
    } catch (error) {
      logger.error(`Error scrolling Glassdoor page: ${error.message}`);
    }
  }

  // Scrape detailed job information
  async scrapeJobDetails(page, jobUrl) {
    try {
      // Navigate to the job page
      await page.goto(jobUrl, { waitUntil: 'networkidle2' });
      
      // Handle potential popups again
      await this.handlePopups(page);
      
      // Wait for job details to load
      await page.waitForSelector('[data-test="jobDesc"]', { timeout: 10000 }).catch(() => {
        logger.warn('Could not find job description selector, trying alternative approach');
      });
      
      // Extract job details
      const jobDetails = await page.evaluate(() => {
        const details = {
          description: '',
          requirements: [],
          responsibilities: [],
          employmentType: '',
          datePosted: '',
          applicationUrl: '',
          logoUrl: '',
          salaryMin: null,
          salaryMax: null
        };
        
        // Get job description
        const descriptionElement = document.querySelector('[data-test="jobDesc"]');
        if (descriptionElement) {
          details.description = descriptionElement.innerText.trim();
          
          // Try to extract requirements and responsibilities from description
          const paragraphs = descriptionElement.querySelectorAll('p, ul, div');
          let currentSection = '';
          
          paragraphs.forEach(element => {
            const text = element.innerText.trim();
            
            if (text.toLowerCase().includes('requirement') || 
                text.toLowerCase().includes('qualification')) {
              currentSection = 'requirements';
            } else if (text.toLowerCase().includes('responsibilit') || 
                       text.toLowerCase().includes('what you\'ll do') ||
                       text.toLowerCase().includes('job duties')) {
              currentSection = 'responsibilities';
            } else if (currentSection === 'requirements' && text.length > 10) {
              if (element.tagName === 'UL') {
                const listItems = element.querySelectorAll('li');
                listItems.forEach(item => {
                  details.requirements.push(item.innerText.trim());
                });
              } else if (text.length < 200) {
                details.requirements.push(text);
              }
            } else if (currentSection === 'responsibilities' && text.length > 10) {
              if (element.tagName === 'UL') {
                const listItems = element.querySelectorAll('li');
                listItems.forEach(item => {
                  details.responsibilities.push(item.innerText.trim());
                });
              } else if (text.length < 200) {
                details.responsibilities.push(text);
              }
            }
          });
        }
        
        // Try to get job metadata
        const jobInfoItems = document.querySelectorAll('[data-test="jobInfoItem"]');
        jobInfoItems.forEach(item => {
          const label = item.querySelector('[data-test="jobInfoItem-label"]');
          const value = item.querySelector('[data-test="jobInfoItem-value"]');
          
          if (label && value) {
            const labelText = label.innerText.trim().toLowerCase();
            const valueText = value.innerText.trim();
            
            if (labelText.includes('job type') || labelText.includes('employment type')) {
              details.employmentType = valueText;
            }
          }
        });
        
        // Try to get company logo
        const logoElement = document.querySelector('[data-test="employerLogo"]');
        if (logoElement && logoElement.src) {
          details.logoUrl = logoElement.src;
        }
        
        // Try to get salary info
        const salaryElement = document.querySelector('[data-test="detailSalary"]');
        if (salaryElement) {
          const salaryText = salaryElement.innerText.trim();
          const salaryMatch = salaryText.match(/\$([0-9,]+)\s*-\s*\$([0-9,]+)/);
          
          if (salaryMatch) {
            details.salaryMin = parseInt(salaryMatch[1].replace(/,/g, ''));
            details.salaryMax = parseInt(salaryMatch[2].replace(/,/g, ''));
          }
        }
        
        // Try to get application URL
        const applyButton = document.querySelector('[data-test="applyButton"]');
        if (applyButton && applyButton.href) {
          details.applicationUrl = applyButton.href;
        }
        
        return details;
      });
      
      return jobDetails;
    } catch (error) {
      logger.error(`Error scraping Glassdoor job details: ${error.message}`);
      return {
        description: '',
        requirements: [],
        responsibilities: [],
        employmentType: 'Full-time'
      };
    }
  }
}

module.exports = new GlassdoorScraper(); 