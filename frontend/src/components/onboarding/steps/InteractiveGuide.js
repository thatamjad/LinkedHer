import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLightbulb, FaGraduationCap, FaArrowRight, FaArrowLeft, FaRegCheckCircle } from 'react-icons/fa';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 450px;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: var(--professional-navy);
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #667788;
`;

const StepsContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f8f9fa;
`;

const StepTab = styled.div`
  flex: 1;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  color: ${props => props.active ? 'white' : 'var(--professional-navy)'};
  background-color: ${props => props.active ? 'var(--primary-purple)' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-purple)' : '#f0f0f5'};
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background-color: ${props => props.completed ? 'var(--success-green)' : 'transparent'};
  }
`;

const StepContent = styled(motion.div)`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const TutorialCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
  flex-grow: 1;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f3e8fc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-purple);
`;

const StepTitle = styled.h3`
  font-size: 1.2rem;
  color: var(--professional-navy);
`;

const CardContent = styled.div`
  color: #4a5568;
  line-height: 1.6;
`;

const ContentHighlight = styled.div`
  background-color: #f8f0ff;
  border-left: 3px solid var(--primary-purple);
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 0 8px 8px 0;
`;

const TutorialImage = styled.img`
  width: 100%;
  border-radius: 8px;
  margin: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TutorialGif = styled.img`
  width: 100%;
  border-radius: 8px;
  margin: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
`;

const NavButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  
  &.prev {
    background-color: #f0f0f5;
    color: var(--professional-navy);
    
    &:hover {
      background-color: #e8e8f0;
    }
  }
  
  &.next {
    background-color: var(--primary-purple);
    color: white;
    
    &:hover {
      background-color: #7d51af;
    }
  }
  
  &.complete {
    background-color: var(--success-green);
    color: white;
    
    &:hover {
      background-color: #219653;
    }
  }
`;

const ProgressDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.active ? 'var(--primary-purple)' : '#dde1e7'};
  transition: background-color 0.2s ease;
`;

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 500 : -500,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    x: direction < 0 ? 500 : -500,
    opacity: 0
  })
};

// Define tutorial steps content
const tutorialSteps = [
  {
    title: "Professional Mode",
    icon: <FaGraduationCap />,
    content: (
      <>
        <p>Professional mode is your verified identity on Linker. Here's what you can do:</p>
        <ContentHighlight>
          <ul>
            <li>Share your professional achievements and experiences</li>
            <li>Network with verified women professionals</li>
            <li>Explore job opportunities tailored to your skills</li>
            <li>Join mentorship programs and industry groups</li>
          </ul>
        </ContentHighlight>
        <p>Your professional profile is visible to all verified members of our community.</p>
        <TutorialImage src="/images/onboarding/professional-mode-demo.png" alt="Professional Mode Interface" />
      </>
    )
  },
  {
    title: "Anonymous Mode",
    icon: <FaLightbulb />,
    content: (
      <>
        <p>Anonymous mode allows you to participate without revealing your identity:</p>
        <ContentHighlight>
          <ul>
            <li>Discuss sensitive workplace issues freely</li>
            <li>Seek advice on salary negotiations or workplace challenges</li>
            <li>Share experiences without fear of retribution</li>
            <li>Connect with others facing similar situations</li>
          </ul>
        </ContentHighlight>
        <p>Your anonymous persona is cryptographically separated from your professional identity.</p>
        <TutorialGif src="/images/onboarding/anonymous-mode-demo.gif" alt="Anonymous Mode Demonstration" />
      </>
    )
  },
  {
    title: "Switching Between Modes",
    icon: <FaLightbulb />,
    content: (
      <>
        <p>You can easily switch between Professional and Anonymous modes:</p>
        <TutorialGif src="/images/onboarding/mode-switching-demo.gif" alt="Mode Switching Animation" />
        <ContentHighlight>
          <p><strong>Important:</strong> When you switch modes, you get a completely different experience:</p>
          <ul>
            <li>Different feed content based on your mode</li>
            <li>Different UI appearance to help you remember which mode you're in</li>
            <li>Different privacy controls and visibility settings</li>
          </ul>
        </ContentHighlight>
        <p>Use the mode toggle in the top navigation bar to switch at any time.</p>
      </>
    )
  }
];

const InteractiveGuide = ({ setCompletedTutorial }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [completed, setCompleted] = useState([false, false, false]);
  
  useEffect(() => {
    // Mark current step as completed when viewed
    const newCompleted = [...completed];
    newCompleted[activeTabIndex] = true;
    setCompleted(newCompleted);
  }, [activeTabIndex]);
  
  const handleNext = () => {
    if (activeTabIndex < tutorialSteps.length - 1) {
      setDirection(1);
      setActiveTabIndex(prev => prev + 1);
    } else {
      // All steps completed
      setCompletedTutorial(true);
    }
  };
  
  const handlePrev = () => {
    if (activeTabIndex > 0) {
      setDirection(-1);
      setActiveTabIndex(prev => prev - 1);
    }
  };
  
  const handleTabClick = (index) => {
    setDirection(index > activeTabIndex ? 1 : -1);
    setActiveTabIndex(index);
  };
  
  const allCompleted = completed.every(step => step);
  
  return (
    <Container>
      <Header>
        <Title>Interactive Guide</Title>
        <Subtitle>Learn how to make the most of Linker's unique features</Subtitle>
      </Header>
      
      <StepsContainer>
        {tutorialSteps.map((step, index) => (
          <StepTab 
            key={index} 
            active={activeTabIndex === index}
            completed={completed[index]}
            onClick={() => handleTabClick(index)}
          >
            {step.title}
          </StepTab>
        ))}
      </StepsContainer>
      
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <StepContent
          key={activeTabIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "tween", duration: 0.3 }}
        >
          <TutorialCard>
            <CardHeader>
              <IconWrapper>
                {tutorialSteps[activeTabIndex].icon}
              </IconWrapper>
              <StepTitle>{tutorialSteps[activeTabIndex].title}</StepTitle>
            </CardHeader>
            
            <CardContent>
              {tutorialSteps[activeTabIndex].content}
            </CardContent>
          </TutorialCard>
          
          <NavigationButtons>
            {activeTabIndex > 0 ? (
              <NavButton 
                className="prev"
                onClick={handlePrev}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaArrowLeft />
                Previous
              </NavButton>
            ) : <div />}
            
            <NavButton 
              className={allCompleted ? "complete" : "next"}
              onClick={handleNext}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {activeTabIndex === tutorialSteps.length - 1 ? (
                <>
                  {allCompleted ? (
                    <>
                      <FaRegCheckCircle />
                      Complete Tutorial
                    </>
                  ) : (
                    <>
                      <FaRegCheckCircle />
                      Finish
                    </>
                  )}
                </>
              ) : (
                <>
                  Next
                  <FaArrowRight />
                </>
              )}
            </NavButton>
          </NavigationButtons>
        </StepContent>
      </AnimatePresence>
      
      <ProgressDots>
        {tutorialSteps.map((_, index) => (
          <Dot key={index} active={index === activeTabIndex} />
        ))}
      </ProgressDots>
    </Container>
  );
};

export default InteractiveGuide; 