const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const Job = require('../../models/job.model');
const logger = require('../logger');

class LinkedinScraper {
  constructor() {
    this.baseUrl = 'https://www.linkedin.com/jobs/search';
    this.apiUrl = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    
    // Categories to scrape for women in professional roles
    this.targetCategories = [
      'Software Engineering',
      'Data Science',
      'Product Management',
      'UX Design',
      'Marketing',
      'Finance',
      'Human Resources',
      'Leadership',
      'Engineering',
      'Healthcare'
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
      logger.info('Starting LinkedIn job scraping');
      
      // Launch browser for dynamic content scraping
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      // Scrape each category
      for (const category of this.targetCategories) {
        try {
          logger.info(`Scraping LinkedIn jobs for category: ${category}`);
          const categoryResults = await this.scrapeCategoryJobs(browser, category);
          
          results.total += categoryResults.total;
          results.new += categoryResults.new;
          results.updated += categoryResults.updated;
          results.errors += categoryResults.errors;
        } catch (error) {
          logger.error(`Error scraping LinkedIn jobs for category ${category}: ${error.message}`);
          results.errors++;
        }
      }
      
      await browser.close();
      logger.info(`LinkedIn job scraping completed. Total: ${results.total}, New: ${results.new}, Updated: ${results.updated}`);
      
      return results;
    } catch (error) {
      logger.error(`Error during LinkedIn job scraping: ${error.message}`);
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
      
      // Set a reasonable viewport
      await page.setViewport({ width: 1366, height: 768 });
      
      // Prepare URL with the category
      const searchUrl = `${this.baseUrl}?keywords=${encodeURIComponent(category)}&sortBy=R`;
      
      // Navigate to the search page
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      // Wait for job listings to load
      await page.waitForSelector('.jobs-search__results-list');
      
      // Scroll to load more jobs (LinkedIn loads jobs as you scroll)
      await this.scrollToLoadMore(page);
      
      // Extract job listings
      const jobListings = await page.evaluate(() => {
        const listings = [];
        const elements = document.querySelectorAll('.jobs-search__results-list li');
        
        elements.forEach(element => {
          try {
            const jobCard = element.querySelector('.job-search-card');
            if (!jobCard) return;
            
            const titleElement = element.querySelector('.base-search-card__title');
            const companyElement = element.querySelector('.base-search-card__subtitle');
            const locationElement = element.querySelector('.job-search-card__location');
            const linkElement = element.querySelector('a.base-card__full-link');
            
            if (titleElement && companyElement && locationElement && linkElement) {
              listings.push({
                title: titleElement.innerText.trim(),
                company: companyElement.innerText.trim(),
                location: locationElement.innerText.trim(),
                link: linkElement.href,
                jobId: linkElement.href.match(/\/view\/([0-9]+)/)?.[1] || null
              });
            }
          } catch (error) {
            console.error('Error parsing job listing:', error);
          }
        });
        
        return listings;
      });
      
      logger.info(`Found ${jobListings.length} LinkedIn jobs for category: ${category}`);
      results.total = jobListings.length;
      
      // Process each job
      for (const jobListing of jobListings) {
        try {
          if (!jobListing.jobId) {
            logger.warn(`Skipping LinkedIn job with missing ID: ${jobListing.title}`);
            continue;
          }
          
          // Check if job already exists
          const existingJob = await Job.findOne({ 
            jobSource: 'linkedin',
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
              jobSource: 'linkedin',
              sourceUrl: jobListing.link,
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
          logger.error(`Error processing LinkedIn job ${jobListing.title}: ${error.message}`);
          results.errors++;
        }
      }
      
      await page.close();
      return results;
    } catch (error) {
      logger.error(`Error scraping LinkedIn category ${category}: ${error.message}`);
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
        
        // Wait for network to be idle after scrolling
        await page.waitForTimeout(1000);
      }
    } catch (error) {
      logger.error(`Error scrolling LinkedIn page: ${error.message}`);
    }
  }

  // Scrape detailed job information
  async scrapeJobDetails(page, jobUrl) {
    try {
      // Navigate to the job page
      await page.goto(jobUrl, { waitUntil: 'networkidle2' });
      
      // Wait for job details to load
      await page.waitForSelector('.job-view-layout');
      
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
        const descriptionElement = document.querySelector('.description__text');
        if (descriptionElement) {
          details.description = descriptionElement.innerText.trim();
        }
        
        // Try to extract employment type
        const jobInfoElements = document.querySelectorAll('.job-criteria__item');
        jobInfoElements.forEach(element => {
          const labelElement = element.querySelector('.job-criteria__subheader');
          const valueElement = element.querySelector('.job-criteria__text');
          
          if (labelElement && valueElement) {
            const label = labelElement.innerText.trim().toLowerCase();
            const value = valueElement.innerText.trim();
            
            if (label.includes('employment type')) {
              details.employmentType = value;
            }
          }
        });
        
        // Try to parse requirements and responsibilities from description
        if (details.description) {
          // Look for requirements section
          const reqMatch = details.description.match(/requirements:?(.*?)(?:responsibilities:|qualifications:|about the role:|$)/is);
          if (reqMatch && reqMatch[1]) {
            details.requirements = reqMatch[1]
              .split(/\n|•|\\n/)
              .map(item => item.trim())
              .filter(item => item.length > 10);
          }
          
          // Look for responsibilities section
          const respMatch = details.description.match(/responsibilities:?(.*?)(?:requirements:|qualifications:|about you:|$)/is);
          if (respMatch && respMatch[1]) {
            details.responsibilities = respMatch[1]
              .split(/\n|•|\\n/)
              .map(item => item.trim())
              .filter(item => item.length > 10);
          }
        }
        
        // Get application URL
        const applyButton = document.querySelector('.apply-button');
        if (applyButton && applyButton.tagName === 'A') {
          details.applicationUrl = applyButton.href;
        }
        
        return details;
      });
      
      return jobDetails;
    } catch (error) {
      logger.error(`Error scraping LinkedIn job details from ${jobUrl}: ${error.message}`);
      return {
        description: 'Failed to load job description',
        requirements: [],
        responsibilities: [],
        employmentType: 'Full-time',
        applicationUrl: jobUrl
      };
    }
  }
}

module.exports = new LinkedinScraper(); 