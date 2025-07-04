const axios = require('axios');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const logger = require('./logger');

/**
 * Utility for scoring jobs based on women-friendly factors
 */
class WomenFriendlyScorer {
  constructor() {
    // Keywords that indicate women-friendly workplace factors
    this.keywords = {
      parentalLeave: [
        'maternity leave', 'parental leave', 'paternity leave', 'family leave', 
        'child care', 'childcare', 'family friendly', 'family benefits',
        'paid leave', 'maternal', 'baby', 'nursing'
      ],
      flexibleHours: [
        'flexible hours', 'flexible schedule', 'flexible working', 'work-life balance',
        'work life balance', 'flex time', 'flextime', 'remote work', 'work from home',
        'hybrid', 'flexible arrangements', 'flexibility'
      ],
      remoteWork: [
        'remote', 'work from home', 'wfh', 'telecommute', 'virtual position',
        'home office', 'distributed team', 'anywhere', 'remote-first', 'remote friendly'
      ],
      equalPayPledge: [
        'equal pay', 'pay equity', 'salary equity', 'fair compensation',
        'gender pay gap', 'equitable pay', 'equal compensation', 'pay parity'
      ],
      diversityInitiatives: [
        'diversity', 'inclusion', 'dei', 'diverse', 'inclusive', 'belonging',
        'women in tech', 'minority', 'underrepresented', 'equal opportunity',
        'erg', 'employee resource group', 'affinity group'
      ],
      femaleLeadership: [
        'women leader', 'female leader', 'women in leadership', 'female executive',
        'woman founder', 'female founder', 'women-led', 'women owned', 'female ceo'
      ],
      inclusiveLanguage: [
        'they/them', 'she/her', 'pronouns', 'all genders', 'gender neutral',
        'non-binary', 'gender inclusive', 'women and', 'individuals of all',
        'everyone is welcome', 'regardless of gender'
      ]
    };
    
    // Weight factors for scoring
    this.weights = {
      parentalLeave: 15,
      flexibleHours: 15,
      remoteWork: 15,
      equalPayPledge: 15,
      diversityInitiatives: 15,
      femaleLeadership: 15,
      inclusiveLanguage: 10
    };
    
    // Company diversity data cache to reduce API calls
    this.companyCache = new Map();
  }

  /**
   * Score a job based on women-friendly factors
   * @param {Object} job - The job object to score
   * @returns {Object} The score result with total score and factor breakdown
   */
  async scoreJob(job) {
    try {
      // Get job description text
      const text = [
        job.title,
        job.description,
        ...(job.requirements || []),
        ...(job.responsibilities || [])
      ].join(' ').toLowerCase();
      
      // Initialize score factors
      const factors = {
        parentalLeave: false,
        flexibleHours: false,
        remoteWork: false,
        equalPayPledge: false,
        diversityInitiatives: false,
        femaleLeadership: false,
        inclusiveLanguage: false
      };
      
      // Check for each factor
      Object.keys(this.keywords).forEach(factor => {
        const keywords = this.keywords[factor];
        factors[factor] = keywords.some(keyword => text.includes(keyword));
      });
      
      // Remote work check from location field
      if (job.location && typeof job.location === 'string') {
        const locationLower = job.location.toLowerCase();
        if (locationLower.includes('remote') || 
            locationLower.includes('work from home') || 
            locationLower.includes('virtual')) {
          factors.remoteWork = true;
        }
      }
      
      // Calculate total score based on weights
      let totalScore = 0;
      Object.keys(factors).forEach(factor => {
        if (factors[factor]) {
          totalScore += this.weights[factor];
        }
      });
      
      // Check for women-focused job boards which get a bonus
      const womenFocusedJobSources = ['womenWhoCode', 'powerToFly', 'womenInTech'];
      if (job.jobSource && womenFocusedJobSources.includes(job.jobSource)) {
        totalScore += 10; // Bonus for women-focused job boards
      }
      
      // Apply industry-specific adjustments
      totalScore = this.applyIndustryAdjustments(job, totalScore);
      
      // Cap score at 100
      totalScore = Math.min(100, totalScore);
      
      return {
        totalScore,
        factors
      };
    } catch (error) {
      logger.error(`Error scoring job ${job._id}: ${error.message}`);
      // Return default score if error
      return {
        totalScore: 50,
        factors: {
          parentalLeave: false,
          flexibleHours: false,
          remoteWork: false,
          equalPayPledge: false,
          diversityInitiatives: false,
          femaleLeadership: false,
          inclusiveLanguage: false
        }
      };
    }
  }
  
  /**
   * Apply industry-specific adjustments to the score
   * @param {Object} job - The job object
   * @param {Number} score - The current score
   * @returns {Number} The adjusted score
   */
  applyIndustryAdjustments(job, score) {
    const title = job.title ? job.title.toLowerCase() : '';
    const category = job.category ? job.category.toLowerCase() : '';
    
    // Industries with historically better representation for women
    const womenRepresentedCategories = [
      'human resources', 'hr', 'marketing', 'healthcare',
      'education', 'nonprofit', 'teaching', 'nursing'
    ];
    
    // Industries with historically lower representation for women
    const womenUnderrepresentedCategories = [
      'software engineering', 'engineering', 'data science',
      'devops', 'blockchain', 'cryptocurrency', 'security'
    ];
    
    // Check title and category for adjustments
    const checkTerms = `${title} ${category}`;
    
    if (womenRepresentedCategories.some(term => checkTerms.includes(term))) {
      // Slight bonus for industries with better representation
      return score + 5;
    } else if (womenUnderrepresentedCategories.some(term => checkTerms.includes(term))) {
      // No adjustment for underrepresented industries
      // The base score from positive factors is sufficient
      return score;
    }
    
    return score;
  }

  // Analyze company data for women-friendliness
  async analyzeCompanyData(companyName, factors) {
    try {
      // Check cache first
      if (this.companyCache.has(companyName)) {
        const cachedData = this.companyCache.get(companyName);
        
        // Update factors based on cached company data
        if (cachedData.hasParentalLeave) factors.parentalLeave = true;
        if (cachedData.hasEqualPay) factors.equalPayPledge = true;
        if (cachedData.hasFemaleLeadership) factors.femaleLeadership = true;
        if (cachedData.hasDiversityInitiatives) factors.diversityInitiatives = true;
        
        return cachedData.score;
      }
      
      // In a real implementation, we would call APIs to get company diversity data
      // For now, implement a simplified version using mock data for demonstration
      const score = this.getMockCompanyScore(companyName, factors);
      
      // Cache the result
      this.companyCache.set(companyName, {
        score,
        hasParentalLeave: factors.parentalLeave,
        hasEqualPay: factors.equalPayPledge,
        hasFemaleLeadership: factors.femaleLeadership,
        hasDiversityInitiatives: factors.diversityInitiatives,
        timestamp: Date.now()
      });
      
      return score;
    } catch (error) {
      logger.error(`Error analyzing company data for ${companyName}: ${error.message}`);
      return 50; // Default score on error
    }
  }

  // Mock function to simulate company data lookup
  // In a real implementation, this would call external APIs
  getMockCompanyScore(companyName, factors) {
    // Generate deterministic score based on company name
    const hash = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseScore = (hash % 50) + 25; // Base score between 25-75
    
    // Simulate finding company policies
    const hasParentalLeave = hash % 3 === 0;
    const hasEqualPay = hash % 5 === 0;
    const hasFemaleLeadership = hash % 7 === 0;
    const hasDiversityInitiatives = hash % 2 === 0;
    
    // Update factors based on "discovered" company policies
    if (hasParentalLeave) factors.parentalLeave = true;
    if (hasEqualPay) factors.equalPayPledge = true;
    if (hasFemaleLeadership) factors.femaleLeadership = true;
    if (hasDiversityInitiatives) factors.diversityInitiatives = true;
    
    // Calculate additional score based on found policies
    const policiesBonus = 
      (hasParentalLeave ? 7 : 0) +
      (hasEqualPay ? 8 : 0) +
      (hasFemaleLeadership ? 10 : 0) +
      (hasDiversityInitiatives ? 5 : 0);
    
    return baseScore + policiesBonus;
  }

  // Clear company data cache entries older than one week
  clearExpiredCache() {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    for (const [company, data] of this.companyCache.entries()) {
      if (data.timestamp < oneWeekAgo) {
        this.companyCache.delete(company);
      }
    }
  }
}

module.exports = new WomenFriendlyScorer(); 