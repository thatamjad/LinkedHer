import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import WelcomeStep from './steps/WelcomeStep';
import ProfileSetupStep from './steps/ProfileSetupStep';
import InterestsStep from './steps/InterestsStep';
import ConnectionsStep from './steps/ConnectionsStep';
import AnonymousModeStep from './steps/AnonymousModeStep';
import PrivacyStep from './steps/PrivacyStep';
import CompletionStep from './steps/CompletionStep';
import OnboardingProgress from './OnboardingProgress';
import OnboardingBackground from './OnboardingBackground';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/userService';

const OnboardingContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  background-color: var(--soft-pink);
`;

const OnboardingCard = styled(motion.div)`
  width: 100%;
  max-width: 650px;
  min-height: 500px;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(139, 95, 191, 0.15);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &.back {
    background-color: transparent;
    border: 2px solid var(--professional-navy);
    color: var(--professional-navy);
    
    &:hover {
      background-color: #f0f0f0;
    }
  }
  
  &.next {
    background-color: var(--primary-purple);
    border: none;
    color: white;
    
    &:hover {
      background-color: #7d51af;
      transform: translateY(-2px);
    }
    
    &:disabled {
      background-color: #c4b7d9;
      cursor: not-allowed;
      transform: none;
    }
  }
`;

const cardVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const OnboardingFlow = ({ onComplete }) => {
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [userData, setUserData] = useState({
    name: user?.name || '',
    headline: '',
    bio: '',
    skills: [],
    interests: [],
    privacy: {
      profileVisibility: 'verified',
      messagePreferences: 'verified',
      activityVisibility: 'followers'
    },
    anonymousMode: {
      enabled: true,
      persona: ''
    }
  });
  const [isValid, setIsValid] = useState(false);

  // Array of steps with validation rules
  const steps = [
    { 
      component: WelcomeStep,
      validate: () => true
    },
    { 
      component: ProfileSetupStep,
      validate: () => userData.name && userData.headline
    },
    { 
      component: InterestsStep,
      validate: () => userData.interests && userData.interests.length >= 3
    },
    { 
      component: ConnectionsStep,
      validate: () => true
    },
    { 
      component: AnonymousModeStep,
      validate: () => (!userData.anonymousMode.enabled || userData.anonymousMode.persona)
    },
    { 
      component: PrivacyStep,
      validate: () => true
    },
    { 
      component: CompletionStep,
      validate: () => true
    }
  ];

  useEffect(() => {
    // Validate current step
    setIsValid(steps[currentStep].validate());
  }, [currentStep, userData]);

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // Save all user data and complete onboarding
      try {
        const updatedUser = await updateUserProfile(user._id, {
          ...userData,
          onboardingCompleted: true
        });
        updateUser(updatedUser);
        onComplete();
      } catch (error) {
        console.error('Error saving onboarding data:', error);
      }
      return;
    }
    
    setDirection(1);
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep === 0) return;
    
    setDirection(-1);
    setCurrentStep(prev => prev - 1);
  };

  const updateUserData = (data) => {
    setUserData(prev => ({ ...prev, ...data }));
  };

  // Current component to render
  const StepComponent = steps[currentStep].component;
  
  // Compute total progress percentage
  const progress = ((currentStep) / (steps.length - 1)) * 100;

  return (
    <OnboardingContainer>
      <OnboardingBackground step={currentStep} />
      
      <OnboardingProgress progress={progress} currentStep={currentStep} totalSteps={steps.length} />
      
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <OnboardingCard
          key={currentStep}
          custom={direction}
          variants={cardVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "tween", duration: 0.5 }}
        >
          <StepComponent 
            userData={userData} 
            updateUserData={updateUserData} 
            setValid={setIsValid}
          />
          
          <ButtonContainer>
            {currentStep > 0 && (
              <Button className="back" onClick={handleBack}>
                Back
              </Button>
            )}
            {currentStep === 0 && <div></div>}
            
            <Button 
              className="next" 
              onClick={handleNext} 
              disabled={!isValid}
            >
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            </Button>
          </ButtonContainer>
        </OnboardingCard>
      </AnimatePresence>
    </OnboardingContainer>
  );
};

export default OnboardingFlow; 