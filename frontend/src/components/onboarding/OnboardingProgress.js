import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ProgressContainer = styled.div`
  width: 100%;
  max-width: 650px;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  margin-bottom: 1rem;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background-color: white;
  border-radius: 4px;
  position: absolute;
  top: 0;
  left: 0;
`;

const StepIndicators = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 10px;
`;

const StepDot = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  background-color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.5)'};
  color: ${props => props.active ? 'var(--primary-purple)' : 'rgba(0, 0, 0, 0.5)'};
  border: ${props => props.completed ? '2px solid white' : 'none'};
  position: relative;
  z-index: 2;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 100%;
    height: 2px;
    background-color: rgba(255, 255, 255, 0.5);
    width: calc(100% - 20px);
    transform: translateY(-50%);
    z-index: 1;
  }
  
  &:last-child::after {
    display: none;
  }
`;

const StepLabel = styled.div`
  color: white;
  font-size: 0.75rem;
  font-weight: ${props => props.active ? '600' : '400'};
  text-align: center;
  margin-top: 0.5rem;
  position: absolute;
  top: 100%;
  width: 80px;
  left: 50%;
  transform: translateX(-50%);
`;

const OnboardingProgress = ({ progress, currentStep, totalSteps }) => {
  const stepLabels = [
    'Welcome', 
    'Profile', 
    'Interests', 
    'Connect', 
    'Anonymous', 
    'Privacy', 
    'Complete'
  ];

  return (
    <ProgressContainer>
      <ProgressBar>
        <ProgressFill
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </ProgressBar>
      
      <StepIndicators>
        {Array.from({ length: totalSteps }, (_, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div key={index} style={{ position: 'relative' }}>
              <StepDot 
                active={isActive || isCompleted} 
                completed={isCompleted}
              >
                {isCompleted ? (
                  <span role="img" aria-label="completed">✓</span>
                ) : (
                  index + 1
                )}
              </StepDot>
              {stepLabels[index] && (
                <StepLabel active={isActive}>
                  {stepLabels[index]}
                </StepLabel>
              )}
            </div>
          );
        })}
      </StepIndicators>
    </ProgressContainer>
  );
};

export default OnboardingProgress; 