const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const Job = require('../../models/job.model');
const logger = require('../logger');

class WomenJobBoardScraper {
  constructor() {
    // Array of women-focused job boards to scrape
    this.jobBoards = [
      {
        name: 'womenWhoCode',
        baseUrl: 'https://www.womenwhocode.com/jobs',
        selectors: {
          jobContainer: '.job-item',
          title: '.job-title',
          company: '.company-name',
          location: '.job-location',
          link: '.job-link'
        }
      },
      {
        name: 'powerToFly',
        baseUrl: 'https://powertofly.com/jobs/',
        selectors: {
          jobContainer: '.job-card',
          title: '.job-title',
          company: '.company-name',
          location: '.job-location',
          link: 'a.job-link'
        }
      },
      {
        name: 'womenInTech',
        baseUrl: 'https://womenintechnology.org/job-board',
        selectors: {
          jobContainer: '.job-listing',
          title: '.job-title a',
          company: '.company-name',
          location: '.job-location',
          link: '.job-title a'
        }
      }
    ];
  }

  // Main scraping method
  async scrapeJobs() {
    const results = {
      total: 0,
      new: 0,
      updated: 0,
      errors: 0,
      bySource: {}
    };
    
    try {
      logger.info('Starting women-focused job board scraping');
      
      // Launch browser for dynamic content scraping
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      // Scrape each job board
      for (const jobBoard of this.jobBoards) {
        try {
          logger.info(`Scraping jobs from ${jobBoard.name}`);
          const boardResults = await this.scrapeJobBoard(browser, jobBoard);
          
          results.total += boardResults.total;
          results.new += boardResults.new;
          results.updated += boardResults.updated;
          results.errors += boardResults.errors;
          results.bySource[jobBoard.name] = boardResults;
          
          logger.info(`Completed scraping from ${jobBoard.name}: ${boardResults.new} new jobs`);
        } catch (error) {
          logger.error(`Error scraping from ${jobBoard.name}: ${error.message}`);
          results.errors++;
          results.bySource[jobBoard.name] = { error: error.message };
        }
      }
      
      await browser.close();
      logger.info(`Women job board scraping completed. Total: ${results.total}, New: ${results.new}, Updated: ${results.updated}`);
      
      return results;
    } catch (error) {
      logger.error(`Error during women job board scraping: ${error.message}`);
      throw error;
    }
  }

  // Scrape a specific job board
  async scrapeJobBoard(browser, jobBoard) {
    const results = {
      total: 0,
      new: 0,
      updated: 0,
      errors: 0
    };
    
    try {
      const page = await browser.newPage();
      
      // Set user agent to avoid being blocked
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Set viewport
      await page.setViewport({ width: 1366, height: 768 });
      
      // Navigate to job board
      await page.goto(jobBoard.baseUrl, { waitUntil: 'networkidle2' });
      
      // Handle cookie consent if needed
      await this.handleCookieConsent(page);
      
      // Scroll to load more jobs
      await this.scrollToLoadMore(page);
      
      // Extract job listings
      const jobListings = await page.evaluate((selectors) => {
        const listings = [];
        const jobElements = document.querySelectorAll(selectors.jobContainer);
        
        jobElements.forEach(element => {
          try {
            const titleElement = element.querySelector(selectors.title);
            const companyElement = element.querySelector(selectors.company);
            const locationElement = element.querySelector(selectors.location);
            const linkElement = element.querySelector(selectors.link);
            
            if (titleElement && linkElement) {
              // Generate a unique job ID based on title and company
              const title = titleElement.innerText.trim();
              const company = companyElement ? companyElement.innerText.trim() : 'Unknown';
              const location = locationElement ? locationElement.innerText.trim() : 'Remote/Various';
              const link = linkElement.href;
              
              // Create a unique ID to avoid duplicates
              const jobId = `${title.replace(/\s+/g, '-').toLowerCase()}-${company.replace(/\s+/g, '-').toLowerCase()}`;
              
              listings.push({
                title,
                company,
                location,
                link,
                jobId
              });
            }
          } catch (error) {
            console.error('Error parsing job listing:', error);
          }
        });
        
        return listings;
      }, jobBoard.selectors);
      
      logger.info(`Found ${jobListings.length} jobs from ${jobBoard.name}`);
      results.total = jobListings.length;
      
      // Process each job
      for (const jobListing of jobListings) {
        try {
          // Check if job already exists
          const existingJob = await Job.findOne({ 
            jobSource: jobBoard.name,
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
            const jobDetails = await this.scrapeJobDetails(page, jobListing.link, jobBoard);
            
            // Set higher women-friendly score for these job boards as they're women-focused
            const womenFriendlyScore = 85; // Higher baseline score for women-focused job boards
            
            // Create new job
            const newJob = new Job({
              title: jobListing.title,
              company: jobListing.company,
              location: jobListing.location,
              description: jobDetails.description,
              requirements: jobDetails.requirements,
              responsibilities: jobDetails.responsibilities,
              jobSource: jobBoard.name,
              sourceUrl: jobListing.link,
              externalId: jobListing.jobId,
              applicationUrl: jobDetails.applicationUrl || jobListing.link,
              employmentType: jobDetails.employmentType || 'Full-time',
              category: this.detectJobCategory(jobListing.title),
              datePosted: new Date(),
              womenFriendlyScore: womenFriendlyScore,
              womenFriendlyFactors: {
                parentalLeave: true,
                flexibleHours: true,
                remoteWork: jobListing.location.toLowerCase().includes('remote'),
                equalPayPledge: true,
                diversityInitiatives: true,
                femaleLeadership: true,
                inclusiveLanguage: true
              }
            });
            
            await newJob.save();
            results.new++;
          }
        } catch (error) {
          logger.error(`Error processing job ${jobListing.title}: ${error.message}`);
          results.errors++;
        }
      }
      
      await page.close();
      return results;
    } catch (error) {
      logger.error(`Error scraping from ${jobBoard.name}: ${error.message}`);
      throw error;
    }
  }

  // Handle cookie consent dialogs
  async handleCookieConsent(page) {
    try {
      // Common cookie consent button selectors
      const cookieSelectors = [
        'button[aria-label="Accept cookies"]',
        'button[aria-label="Accept all cookies"]',
        'button.cookie-consent-accept',
        '#accept-cookies',
        '.accept-cookies-button'
      ];
      
      for (const selector of cookieSelectors) {
        const button = await page.$(selector);
        if (button) {
          await button.click();
          await page.waitForTimeout(1000);
          break;
        }
      }
    } catch (error) {
      logger.warn(`Error handling cookie consent: ${error.message}`);
    }
  }

  // Scroll to load more job listings
  async scrollToLoadMore(page) {
    try {
      // Scroll down a few times to load more jobs
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => {
          window.scrollBy(0, 800);
        });
        
        // Wait for content to load
        await page.waitForTimeout(1000);
      }
    } catch (error) {
      logger.error(`Error scrolling page: ${error.message}`);
    }
  }

  // Scrape detailed job information
  async scrapeJobDetails(page, jobUrl, jobBoard) {
    try {
      // Navigate to the job page
      await page.goto(jobUrl, { waitUntil: 'networkidle2' });
      
      // Extract job details based on job board
      const jobDetails = await page.evaluate(() => {
        const details = {
          description: '',
          requirements: [],
          responsibilities: [],
          employmentType: '',
          applicationUrl: ''
        };
        
        // Get job description - look for common selectors
        const descriptionSelectors = [
          '.job-description',
          '.description',
          '.job-details',
          '.details',
          '[itemprop="description"]',
          '#job-description'
        ];
        
        for (const selector of descriptionSelectors) {
          const descriptionElement = document.querySelector(selector);
          if (descriptionElement) {
            details.description = descriptionElement.innerText.trim();
            break;
          }
        }
        
        // If no description found, use entire page content
        if (!details.description) {
          details.description = document.body.innerText.substring(0, 5000);
        }
        
        // Look for requirements
        const reqKeywords = ['requirements', 'qualifications', 'what you\'ll need', 'skills', 'what you need'];
        const respKeywords = ['responsibilities', 'what you\'ll do', 'job duties', 'role', 'what you will do'];
        
        const paragraphs = document.querySelectorAll('p, li, h3, h4, h5');
        let currentSection = '';
        
        paragraphs.forEach(element => {
          const text = element.innerText.trim();
          
          // Determine if this element is a section header
          const textLower = text.toLowerCase();
          
          if (reqKeywords.some(keyword => textLower.includes(keyword))) {
            currentSection = 'requirements';
          } else if (respKeywords.some(keyword => textLower.includes(keyword))) {
            currentSection = 'responsibilities';
          } else if (currentSection === 'requirements' && text.length > 10 && element.tagName === 'LI') {
            details.requirements.push(text);
          } else if (currentSection === 'responsibilities' && text.length > 10 && element.tagName === 'LI') {
            details.responsibilities.push(text);
          }
        });
        
        // Look for employment type
        const employmentTypes = ['full-time', 'part-time', 'contract', 'freelance', 'remote'];
        const bodyText = document.body.innerText.toLowerCase();
        
        for (const type of employmentTypes) {
          if (bodyText.includes(type)) {
            details.employmentType = type.charAt(0).toUpperCase() + type.slice(1);
            break;
          }
        }
        
        // Get application URL
        const applyButtons = document.querySelectorAll('a[href*="apply"], button:contains("Apply"), a:contains("Apply")');
        if (applyButtons.length > 0 && applyButtons[0].href) {
          details.applicationUrl = applyButtons[0].href;
        }
        
        return details;
      });
      
      return jobDetails;
    } catch (error) {
      logger.error(`Error scraping job details: ${error.message}`);
      return {
        description: '',
        requirements: [],
        responsibilities: [],
        employmentType: 'Full-time'
      };
    }
  }

  // Detect job category based on job title
  detectJobCategory(title) {
    const titleLower = title.toLowerCase();
    
    // Define category keywords
    const categories = {
      'Software Engineering': ['software engineer', 'developer', 'coder', 'programmer', 'full stack', 'frontend', 'backend'],
      'Data Science': ['data scientist', 'data analyst', 'data engineer', 'machine learning', 'ai engineer'],
      'Product Management': ['product manager', 'product owner', 'program manager'],
      'UX Design': ['ux designer', 'ui designer', 'product designer', 'interaction designer'],
      'Marketing': ['marketing', 'growth', 'seo', 'content strategist'],
      'Finance': ['finance', 'financial', 'accountant', 'accounting'],
      'Human Resources': ['hr ', 'human resources', 'recruiter', 'talent'],
      'Leadership': ['director', 'head of', 'lead', 'chief', 'vp', 'manager'],
      'Engineering': ['engineer', 'engineering', 'architect'],
      'Healthcare': ['health', 'medical', 'nurse', 'doctor', 'clinical']
    };
    
    // Find matching category
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => titleLower.includes(keyword))) {
        return category;
      }
    }
    
    // Default category
    return 'Other';
  }
}

module.exports = new WomenJobBoardScraper(); 