const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const Job = require('../../models/job.model');
const linkedinScraper = require('./linkedinScraper');
const indeedScraper = require('./indeedScraper');
const glassdoorScraper = require('./glassdoorScraper');
const womenJobBoardScraper = require('./womenJobBoardScraper');
const logger = require('../logger');
const womenFriendlyScorer = require('../womenFriendlyScorer');

class JobScraperManager {
  constructor() {
    this.scrapers = {
      linkedin: linkedinScraper,
      indeed: indeedScraper,
      glassdoor: glassdoorScraper,
      womenJobBoard: womenJobBoardScraper
    };
    
    this.scrapingInProgress = false;
    this.scheduledJobs = {};
  }

  // Initialize all scrapers and schedule their runs
  async initialize() {
    try {
      logger.info('Initializing job scraper manager');
      
      // Schedule regular scraping - every 6 hours for main sources
      this.scheduledJobs.mainSources = cron.schedule('0 */6 * * *', async () => {
        await this.scrapeAllSources(['linkedin', 'indeed', 'glassdoor']);
      });
      
      // Women-specific job boards daily
      this.scheduledJobs.womenSources = cron.schedule('0 2 * * *', async () => {
        await this.scrapeAllSources(['womenJobBoard']);
      });
      
      // Schedule job cleanup - remove expired jobs weekly
      this.scheduledJobs.cleanup = cron.schedule('0 1 * * 0', async () => {
        await this.cleanupExpiredJobs();
      });
      
      logger.info('Job scraper manager initialized successfully');
    } catch (error) {
      logger.error(`Error initializing job scraper manager: ${error.message}`);
      throw error;
    }
  }

  // Scrape jobs from all specified sources
  async scrapeAllSources(sources = Object.keys(this.scrapers)) {
    if (this.scrapingInProgress) {
      logger.warn('Scraping already in progress, skipping this run');
      return;
    }
    
    try {
      this.scrapingInProgress = true;
      logger.info(`Starting job scraping from sources: ${sources.join(', ')}`);
      
      const results = {
        total: 0,
        new: 0,
        updated: 0,
        errors: 0,
        bySource: {}
      };
      
      for (const source of sources) {
        if (!this.scrapers[source]) {
          logger.warn(`Scraper for ${source} not found, skipping`);
          continue;
        }
        
        try {
          logger.info(`Starting scraping from ${source}`);
          const sourceResult = await this.scrapers[source].scrapeJobs();
          
          results.total += sourceResult.total;
          results.new += sourceResult.new;
          results.updated += sourceResult.updated;
          results.bySource[source] = sourceResult;
          
          logger.info(`Completed scraping from ${source}: ${sourceResult.new} new jobs, ${sourceResult.updated} updated`);
        } catch (error) {
          logger.error(`Error scraping from ${source}: ${error.message}`);
          results.errors++;
          results.bySource[source] = { error: error.message };
        }
      }
      
      // Process and score the newly scraped jobs
      await this.processScrapedJobs();
      
      logger.info(`Job scraping completed. Total: ${results.total}, New: ${results.new}, Updated: ${results.updated}, Errors: ${results.errors}`);
      return results;
    } catch (error) {
      logger.error(`Error during job scraping: ${error.message}`);
      throw error;
    } finally {
      this.scrapingInProgress = false;
    }
  }

  // Process newly scraped jobs - score them and apply filters
  async processScrapedJobs() {
    try {
      // Get jobs that need processing (newly added or updated)
      const jobsToProcess = await Job.find({ 
        $or: [
          { womenFriendlyScore: { $exists: false } },
          { womenFriendlyScore: 50 } // Default score, needs calculation
        ]
      }).limit(500);
      
      logger.info(`Processing ${jobsToProcess.length} jobs for women-friendly scoring`);
      
      for (const job of jobsToProcess) {
        try {
          // Calculate women-friendly score
          const score = await womenFriendlyScorer.scoreJob(job);
          
          // Update the job with the score
          job.womenFriendlyScore = score.totalScore;
          job.womenFriendlyFactors = score.factors;
          await job.save();
        } catch (error) {
          logger.error(`Error processing job ${job._id}: ${error.message}`);
        }
      }
      
      logger.info('Job processing completed');
    } catch (error) {
      logger.error(`Error during job processing: ${error.message}`);
      throw error;
    }
  }

  // Remove expired job listings
  async cleanupExpiredJobs() {
    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      // Archive jobs that are 3+ months old
      const result = await Job.updateMany(
        { 
          createdAt: { $lt: threeMonthsAgo },
          isActive: true
        },
        { 
          $set: { isActive: false }
        }
      );
      
      logger.info(`Archived ${result.nModified} expired jobs`);
    } catch (error) {
      logger.error(`Error during job cleanup: ${error.message}`);
      throw error;
    }
  }

  // Stop all scheduled jobs
  stopAll() {
    Object.values(this.scheduledJobs).forEach(job => job.stop());
    logger.info('All job scraper schedules stopped');
  }
}

module.exports = new JobScraperManager(); 