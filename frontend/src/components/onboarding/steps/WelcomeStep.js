import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
  flex: 1;
`;

const LogoContainer = styled(motion.div)`
  margin-bottom: 2rem;
`;

const Logo = styled.img`
  width: 160px;
  height: auto;
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-purple);
  margin-bottom: 1rem;
`;

const Subtitle = styled(motion.p)`
  font-size: 1.2rem;
  color: var(--professional-navy);
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 500px;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
  margin-top: 1rem;
`;

const FeatureItem = styled(motion.div)`
  background-color: #f9f4fc;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const FeatureIcon = styled.div`
  width: 50px;
  height: 50px;
  background-color: var(--primary-purple);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: white;
  font-size: 1.5rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--professional-navy);
  margin-bottom: 0.5rem;
`;

const FeatureDescription = styled.p`
  font-size: 0.9rem;
  color: #607081;
`;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const WelcomeStep = ({ setValid }) => {
  useEffect(() => {
    // This step is always valid
    setValid(true);
  }, [setValid]);

  return (
    <StepContainer>
      <LogoContainer
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Logo src="/logo.svg" alt="Linker Logo" />
      </LogoContainer>
      
      <Title
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Welcome to Linker
      </Title>
      
      <Subtitle
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        A safe professional space designed exclusively for women to connect, share, and grow together.
      </Subtitle>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ width: '100%' }}
      >
        <FeatureGrid>
          <FeatureItem variants={itemVariants}>
            <FeatureIcon>
              <span role="img" aria-label="shield">🛡️</span>
            </FeatureIcon>
            <FeatureTitle>Women-Only Space</FeatureTitle>
            <FeatureDescription>
              Connect with verified professional women in a safe, secure environment
            </FeatureDescription>
          </FeatureItem>
          
          <FeatureItem variants={itemVariants}>
            <FeatureIcon>
              <span role="img" aria-label="anonymous mask">🎭</span>
            </FeatureIcon>
            <FeatureTitle>Anonymous Mode</FeatureTitle>
            <FeatureDescription>
              Share freely with cryptographically secure anonymity when needed
            </FeatureDescription>
          </FeatureItem>
          
          <FeatureItem variants={itemVariants}>
            <FeatureIcon>
              <span role="img" aria-label="growth chart">📈</span>
            </FeatureIcon>
            <FeatureTitle>Career Growth</FeatureTitle>
            <FeatureDescription>
              Access mentorship, skill development, and job opportunities
            </FeatureDescription>
          </FeatureItem>
          
          <FeatureItem variants={itemVariants}>
            <FeatureIcon>
              <span role="img" aria-label="community">👥</span>
            </FeatureIcon>
            <FeatureTitle>Supportive Community</FeatureTitle>
            <FeatureDescription>
              Join industry groups and find support for workplace challenges
            </FeatureDescription>
          </FeatureItem>
        </FeatureGrid>
      </motion.div>
    </StepContainer>
  );
};

export default WelcomeStep; 