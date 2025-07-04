const ABTest = require('../models/abTest.model');
const BetaTester = require('../models/betaTester.model');
const AnalyticsEvent = require('../models/analyticsEvent.model');

// Create a new A/B test
exports.createABTest = async (req, res) => {
  try {
    const {
      title,
      description,
      featureArea,
      variants,
      participantDistribution,
      weightDistribution,
      metrics,
      startDate,
      endDate,
      targetAudience,
      minimumSampleSize,
      notes
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !featureArea || !variants || variants.length < 2 || !metrics || metrics.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Ensure at least one variant is marked as control
    const hasControl = variants.some(variant => variant.isControl);
    if (!hasControl) {
      return res.status(400).json({
        success: false,
        message: 'At least one variant must be marked as control'
      });
    }
    
    // Validate weight distribution if weighted distribution is selected
    if (participantDistribution === 'weighted') {
      if (!weightDistribution || weightDistribution.length !== variants.length) {
        return res.status(400).json({
          success: false,
          message: 'Weight distribution must be provided for all variants when using weighted distribution'
        });
      }
      
      // Check if weights sum to 100%
      const weightSum = weightDistribution.reduce((sum, item) => sum + item.percentage, 0);
      if (Math.abs(weightSum - 100) > 0.1) { // Allow small rounding errors
        return res.status(400).json({
          success: false,
          message: 'Weight distribution must sum to 100%'
        });
      }
    }
    
    // Create new A/B test
    const abTest = new ABTest({
      title,
      description,
      featureArea,
      variants,
      participantDistribution: participantDistribution || 'equal',
      weightDistribution: weightDistribution || [],
      metrics,
      startDate: startDate || new Date(),
      endDate,
      status: 'draft',
      targetAudience: targetAudience || 'beta_testers',
      minimumSampleSize: minimumSampleSize || 100,
      notes,
      createdBy: req.user._id
    });
    
    await abTest.save();
    
    res.status(201).json({
      success: true,
      message: 'A/B test created successfully',
      data: abTest
    });
  } catch (error) {
    console.error('Error creating A/B test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create A/B test',
      error: error.message
    });
  }
};

// Get all A/B tests with optional filtering
exports.getAllABTests = async (req, res) => {
  try {
    const { status, featureArea, sort } = req.query;
    const query = {};
    
    // Apply filters if provided
    if (status) query.status = status;
    if (featureArea) query.featureArea = featureArea;
    
    // Determine sort order
    let sortOption = { createdAt: -1 }; // Default sort by creation date (newest first)
    if (sort === 'startDate') {
      sortOption = { startDate: -1 };
    } else if (sort === 'endDate') {
      sortOption = { endDate: 1 };
    }
    
    const abTests = await ABTest.find(query)
      .sort(sortOption)
      .populate('createdBy', 'name email')
      .exec();
    
    res.status(200).json({
      success: true,
      count: abTests.length,
      data: abTests
    });
  } catch (error) {
    console.error('Error getting A/B tests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get A/B tests',
      error: error.message
    });
  }
};

// Get a single A/B test by ID
exports.getABTestById = async (req, res) => {
  try {
    const testId = req.params.id;
    
    const abTest = await ABTest.findById(testId)
      .populate('createdBy', 'name email')
      .exec();
    
    if (!abTest) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found'
      });
    }
    
    // Get participation stats
    const participationStats = await AnalyticsEvent.aggregate([
      {
        $match: {
          'abTestInfo.testId': abTest._id
        }
      },
      {
        $group: {
          _id: '$abTestInfo.variantName',
          userCount: { $addToSet: '$user' },
          eventCount: { $sum: 1 }
        }
      },
      {
        $project: {
          variantName: '$_id',
          userCount: { $size: '$userCount' },
          eventCount: 1,
          _id: 0
        }
      }
    ]);
    
    // Calculate conversion rates for each metric and variant
    const metricResults = [];
    
    for (const metric of abTest.metrics) {
      const metricEvents = await AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: metric.dataSource,
            'abTestInfo.testId': abTest._id
          }
        },
        {
          $group: {
            _id: '$abTestInfo.variantName',
            count: { $sum: 1 },
            userCount: { $addToSet: '$user' }
          }
        },
        {
          $project: {
            variantName: '$_id',
            count: 1,
            userCount: { $size: '$userCount' },
            _id: 0
          }
        }
      ]);
      
      metricResults.push({
        metricName: metric.name,
        variantResults: metricEvents
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        abTest,
        participationStats,
        metricResults
      }
    });
  } catch (error) {
    console.error('Error getting A/B test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get A/B test',
      error: error.message
    });
  }
};

// Update an A/B test
exports.updateABTest = async (req, res) => {
  try {
    const testId = req.params.id;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateData.createdBy;
    delete updateData.createdAt;
    delete updateData.results;
    
    // Check if test exists
    const existingTest = await ABTest.findById(testId);
    if (!existingTest) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found'
      });
    }
    
    // Prevent modification of running tests
    if (existingTest.status === 'running' && (updateData.variants || updateData.metrics)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify variants or metrics of a running test'
      });
    }
    
    const updatedTest = await ABTest.findByIdAndUpdate(
      testId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'A/B test updated successfully',
      data: updatedTest
    });
  } catch (error) {
    console.error('Error updating A/B test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update A/B test',
      error: error.message
    });
  }
};

// Start an A/B test
exports.startABTest = async (req, res) => {
  try {
    const testId = req.params.id;
    
    // Check if test exists
    const abTest = await ABTest.findById(testId);
    if (!abTest) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found'
      });
    }
    
    // Check if test is in draft status
    if (abTest.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot start test with status ${abTest.status}`
      });
    }
    
    // Update test status to running
    abTest.status = 'running';
    abTest.startDate = new Date();
    await abTest.save();
    
    // If targeting beta testers, assign them to variants
    if (abTest.targetAudience === 'beta_testers') {
      await assignBetaTestersToVariants(abTest);
    }
    
    res.status(200).json({
      success: true,
      message: 'A/B test started successfully',
      data: abTest
    });
  } catch (error) {
    console.error('Error starting A/B test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start A/B test',
      error: error.message
    });
  }
};

// Pause an A/B test
exports.pauseABTest = async (req, res) => {
  try {
    const testId = req.params.id;
    
    // Check if test exists
    const abTest = await ABTest.findById(testId);
    if (!abTest) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found'
      });
    }
    
    // Check if test is running
    if (abTest.status !== 'running') {
      return res.status(400).json({
        success: false,
        message: `Cannot pause test with status ${abTest.status}`
      });
    }
    
    // Update test status to paused
    abTest.status = 'paused';
    await abTest.save();
    
    res.status(200).json({
      success: true,
      message: 'A/B test paused successfully',
      data: abTest
    });
  } catch (error) {
    console.error('Error pausing A/B test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pause A/B test',
      error: error.message
    });
  }
};

// Complete an A/B test
exports.completeABTest = async (req, res) => {
  try {
    const testId = req.params.id;
    
    // Check if test exists
    const abTest = await ABTest.findById(testId);
    if (!abTest) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found'
      });
    }
    
    // Check if test is running or paused
    if (abTest.status !== 'running' && abTest.status !== 'paused') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete test with status ${abTest.status}`
      });
    }
    
    // Update test status to completed
    abTest.status = 'completed';
    abTest.endDate = new Date();
    await abTest.save();
    
    res.status(200).json({
      success: true,
      message: 'A/B test completed successfully',
      data: abTest
    });
  } catch (error) {
    console.error('Error completing A/B test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete A/B test',
      error: error.message
    });
  }
};

// Analyze A/B test results
exports.analyzeABTestResults = async (req, res) => {
  try {
    const testId = req.params.id;
    
    // Check if test exists
    const abTest = await ABTest.findById(testId);
    if (!abTest) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found'
      });
    }
    
    // Check if test is completed
    if (abTest.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only analyze completed tests'
      });
    }
    
    // Get participation data
    const participationData = await AnalyticsEvent.aggregate([
      {
        $match: {
          'abTestInfo.testId': abTest._id
        }
      },
      {
        $group: {
          _id: '$abTestInfo.variantName',
          userCount: { $addToSet: '$user' }
        }
      },
      {
        $project: {
          variantName: '$_id',
          sampleSize: { $size: '$userCount' },
          _id: 0
        }
      }
    ]);
    
    // Calculate results for each metric
    const results = [];
    let winningVariant = null;
    let highestImprovement = 0;
    
    for (const metric of abTest.metrics) {
      // Get events for this metric
      const metricData = await AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: metric.dataSource,
            'abTestInfo.testId': abTest._id
          }
        },
        {
          $group: {
            _id: '$abTestInfo.variantName',
            count: { $sum: 1 },
            userCount: { $addToSet: '$user' }
          }
        }
      ]);
      
      // Find control variant data
      const controlVariant = abTest.variants.find(v => v.isControl);
      const controlData = metricData.find(d => d._id === controlVariant.name);
      
      if (!controlData) {
        continue; // Skip if no control data
      }
      
      // Calculate conversion rate for control
      const controlParticipation = participationData.find(p => p.variantName === controlVariant.name);
      const controlConversion = controlData.count / controlParticipation.sampleSize;
      
      // Calculate results for each variant
      for (const variant of metricData) {
        if (variant._id === controlVariant.name) continue;
        
        const variantParticipation = participationData.find(p => p.variantName === variant._id);
        const variantConversion = variant.count / variantParticipation.sampleSize;
        
        // Calculate improvement
        const improvement = (variantConversion - controlConversion) / controlConversion;
        
        // Calculate confidence interval and p-value using z-test
        const { confidenceInterval, pValue } = calculateStatistics(
          controlConversion,
          variantConversion,
          controlParticipation.sampleSize,
          variantParticipation.sampleSize
        );
        
        // Determine if this variant is significant
        const isSignificant = pValue < metric.significanceThreshold;
        
        // Determine if this variant is the winner for this metric
        const isWinner = isSignificant && 
          ((metric.goal === 'increase' && improvement > 0) || 
           (metric.goal === 'decrease' && improvement < 0));
        
        // Track overall winning variant
        if (isWinner && Math.abs(improvement) > highestImprovement) {
          highestImprovement = Math.abs(improvement);
          winningVariant = variant._id;
        }
        
        // Store result
        results.push({
          variantName: variant._id,
          metricName: metric.name,
          value: variantConversion,
          improvement: improvement * 100, // Convert to percentage
          sampleSize: variantParticipation.sampleSize,
          confidenceInterval: {
            lower: confidenceInterval[0] * 100,
            upper: confidenceInterval[1] * 100
          },
          pValue,
          isWinner
        });
      }
    }
    
    // Update test with results
    abTest.results = results;
    abTest.status = 'analyzed';
    
    if (winningVariant) {
      abTest.conclusion = {
        winningVariant,
        summary: `The ${winningVariant} variant performed significantly better than the control.`,
        nextSteps: 'Consider implementing this variant permanently.'
      };
    } else {
      abTest.conclusion = {
        summary: 'No variant performed significantly better than the control.',
        nextSteps: 'Consider redesigning the test or continuing with the control.'
      };
    }
    
    await abTest.save();
    
    res.status(200).json({
      success: true,
      message: 'A/B test analyzed successfully',
      data: {
        abTest,
        participationData,
        results
      }
    });
  } catch (error) {
    console.error('Error analyzing A/B test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze A/B test',
      error: error.message
    });
  }
};

// Track event for A/B test
exports.trackEvent = async (req, res) => {
  try {
    const { testId, variantName, eventType, userId, data } = req.body;
    
    if (!testId || !variantName || !eventType || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Check if test exists and is running
    const abTest = await ABTest.findById(testId);
    if (!abTest) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found'
      });
    }
    
    if (abTest.status !== 'running') {
      return res.status(400).json({
        success: false,
        message: 'Can only track events for running tests'
      });
    }
    
    // Check if variant exists in test
    const variantExists = abTest.variants.some(v => v.name === variantName);
    if (!variantExists) {
      return res.status(400).json({
        success: false,
        message: 'Variant not found in test'
      });
    }
    
    // Create analytics event
    const analyticsEvent = new AnalyticsEvent({
      eventType,
      user: userId,
      featureArea: abTest.featureArea,
      abTestInfo: {
        testId,
        variantName
      },
      data: data || {}
    });
    
    await analyticsEvent.save();
    
    res.status(201).json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track event',
      error: error.message
    });
  }
};

// Helper function to assign beta testers to variants
async function assignBetaTestersToVariants(abTest) {
  try {
    // Get all active beta testers
    const betaTesters = await BetaTester.find({ status: 'active' });
    
    // Extract variant names
    const variantNames = abTest.variants.map(v => v.name);
    
    // Assign testers based on distribution type
    if (abTest.participantDistribution === 'equal') {
      // Equal distribution - assign testers randomly and evenly
      for (let i = 0; i < betaTesters.length; i++) {
        const variantIndex = i % variantNames.length;
        const variantName = variantNames[variantIndex];
        
        await BetaTester.findByIdAndUpdate(betaTesters[i]._id, {
          abTestGroup: variantName
        });
      }
    } else {
      // Weighted distribution
      const weights = abTest.weightDistribution.map(w => w.percentage / 100);
      
      // Create weighted assignment function
      const getWeightedVariant = () => {
        const random = Math.random();
        let sum = 0;
        
        for (let i = 0; i < weights.length; i++) {
          sum += weights[i];
          if (random <= sum) {
            return variantNames[i];
          }
        }
        
        return variantNames[0]; // Fallback to first variant
      };
      
      // Assign testers based on weights
      for (const tester of betaTesters) {
        const variantName = getWeightedVariant();
        
        await BetaTester.findByIdAndUpdate(tester._id, {
          abTestGroup: variantName
        });
      }
    }
  } catch (error) {
    console.error('Error assigning beta testers to variants:', error);
    throw error;
  }
}

// Helper function to calculate confidence interval and p-value for conversion rates
function calculateStatistics(controlRate, variantRate, controlSize, variantSize) {
  // Calculate standard errors
  const controlSE = Math.sqrt(controlRate * (1 - controlRate) / controlSize);
  const variantSE = Math.sqrt(variantRate * (1 - variantRate) / variantSize);
  
  // Calculate combined standard error
  const combinedSE = Math.sqrt(controlSE * controlSE + variantSE * variantSE);
  
  // Calculate z-score
  const zScore = (variantRate - controlRate) / combinedSE;
  
  // Calculate p-value (two-tailed)
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
  
  // Calculate 95% confidence interval
  const confidenceInterval = [
    variantRate - 1.96 * variantSE,
    variantRate + 1.96 * variantSE
  ];
  
  return { confidenceInterval, pValue };
}

// Standard normal cumulative distribution function
function normalCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - probability : probability;
} 