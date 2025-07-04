const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const Job = require('../../models/job.model');
const logger = require('../logger');

class IndeedScraper {
  constructor() {
    this.baseUrl = 'https://www.indeed.com/jobs';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    
    // Categories to focus on for women in tech and professional roles
    this.targetCategories = [
      'Software Engineer',
      'Data Scientist',
      'Product Manager',
      'UX Designer',
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'Project Manager',
      'Marketing Manager',
      'HR Manager'
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
      logger.info('Starting Indeed job scraping');
      
      // Launch browser for dynamic content scraping
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      // Scrape each category
      for (const category of this.targetCategories) {
        try {
          logger.info(`Scraping Indeed jobs for category: ${category}`);
          const categoryResults = await this.scrapeCategoryJobs(browser, category);
          
          results.total += categoryResults.total;
          results.new += categoryResults.new;
          results.updated += categoryResults.updated;
          results.errors += categoryResults.errors;
        } catch (error) {
          logger.error(`Error scraping Indeed jobs for category ${category}: ${error.message}`);
          results.errors++;
        }
      }
      
      await browser.close();
      logger.info(`Indeed job scraping completed. Total: ${results.total}, New: ${results.new}, Updated: ${results.updated}`);
      
      return results;
    } catch (error) {
      logger.error(`Error during Indeed job scraping: ${error.message}`);
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
      const searchUrl = `${this.baseUrl}?q=${encodeURIComponent(category)}&sort=date`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      // Wait for job cards to load
      await page.waitForSelector('.jobsearch-ResultsList');
      
      // Scroll to load more jobs
      await this.scrollToLoadMore(page);
      
      // Extract job listings
      const jobListings = await page.evaluate(() => {
        const listings = [];
        const jobCards = document.querySelectorAll('.job_seen_beacon');
        
        jobCards.forEach(card => {
          try {
            const titleElement = card.querySelector('.jobTitle a');
            const companyElement = card.querySelector('.companyName');
            const locationElement = card.querySelector('.companyLocation');
            
            if (titleElement && companyElement && locationElement) {
              const jobId = card.dataset.jk || titleElement.href.match(/jk=([^&]+)/)?.[1];
              
              listings.push({
                title: titleElement.innerText.trim(),
                company: companyElement.innerText.trim(),
                location: locationElement.innerText.trim(),
                link: titleElement.href,
                jobId: jobId
              });
            }
          } catch (error) {
            console.error('Error parsing Indeed job listing:', error);
          }
        });
        
        return listings;
      });
      
      logger.info(`Found ${jobListings.length} Indeed jobs for category: ${category}`);
      results.total = jobListings.length;
      
      // Process each job
      for (const jobListing of jobListings) {
        try {
          if (!jobListing.jobId) {
            logger.warn(`Skipping Indeed job with missing ID: ${jobListing.title}`);
            continue;
          }
          
          // Check if job already exists
          const existingJob = await Job.findOne({ 
            jobSource: 'indeed',
            externalId: jobListing.jobId
          });
          
          if (existingJob) {
            // Update existing job
            existingJob.title = jobListing.title;
            existingJob.company = jobListing.company;
            existingJob.location = jobListing.location;
            existingJob.sourceUrl = `https://www.indeed.com/viewjob?jk=${jobListing.jobId}`;
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
              jobSource: 'indeed',
              sourceUrl: `https://www.indeed.com/viewjob?jk=${jobListing.jobId}`,
              externalId: jobListing.jobId,
              applicationUrl: jobDetails.applicationUrl,
              employmentType: jobDetails.employmentType || 'Full-time',
              category: category,
              datePosted: jobDetails.datePosted || new Date()
            });
            
            await newJob.save();
            results.new++;
          }
        } catch (error) {
          logger.error(`Error processing Indeed job ${jobListing.title}: ${error.message}`);
          results.errors++;
        }
      }
      
      await page.close();
      return results;
    } catch (error) {
      logger.error(`Error scraping Indeed category ${category}: ${error.message}`);
      throw error;
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
      logger.error(`Error scrolling Indeed page: ${error.message}`);
    }
  }

  // Scrape detailed job information
  async scrapeJobDetails(page, jobUrl) {
    try {
      // Navigate to the job page
      await page.goto(jobUrl, { waitUntil: 'networkidle2' });
      
      // Wait for job details to load
      await page.waitForSelector('.jobsearch-JobComponent');
      
      // Extract job details
      const jobDetails = await page.evaluate(() => {
        const details = {
          description: '',
          requirements: [],
          responsibilities: [],
          employmentType: '',
          datePosted: '',
          applicationUrl: ''
        };
        
        // Get job description
        const descriptionElement = document.querySelector('#jobDescriptionText');
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
                      text.toLowerCase().includes('what you\'ll do')) {
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
        
        // Try to get employment type
        const jobInfoLabels = document.querySelectorAll('.jobsearch-JobDescriptionSection-sectionItem .jobsearch-JobDescriptionSection-sectionItemKey');
        jobInfoLabels.forEach(label => {
          const text = label.innerText.trim();
          if (text.toLowerCase().includes('job type')) {
            const value = label.nextElementSibling?.innerText.trim();
            if (value) {
              details.employmentType = value;
            }
          }
        });
        
        // Try to get date posted
        const datePostedElement = document.querySelector('.jobsearch-JobMetadataFooter');
        if (datePostedElement) {
          const text = datePostedElement.innerText;
          const match = text.match(/Posted (\d+) days? ago/);
          if (match) {
            const daysAgo = parseInt(match[1]);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            details.datePosted = date;
          }
        }
        
        // Try to get application URL
        const applyButton = document.querySelector('a.jobsearch-ApplyButton-buttonWrapper');
        if (applyButton) {
          details.applicationUrl = applyButton.href;
        }
        
        return details;
      });
      
      return jobDetails;
    } catch (error) {
      logger.error(`Error scraping Indeed job details: ${error.message}`);
      return {
        description: '',
        requirements: [],
        responsibilities: [],
        employmentType: 'Full-time'
      };
    }
  }
}

module.exports = new IndeedScraper(); 