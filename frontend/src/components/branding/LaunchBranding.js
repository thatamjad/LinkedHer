import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaHeart, FaUsers, FaShieldAlt, FaLightbulb } from 'react-icons/fa';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Hero = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const BrandLogo = styled(motion.img)`
  height: 120px;
  margin-bottom: 1.5rem;
`;

const Tagline = styled.h1`
  font-size: 2.5rem;
  color: var(--professional-navy);
  margin-bottom: 1rem;
  font-weight: 700;
  
  span {
    color: var(--primary-purple);
  }
`;

const SubTagline = styled.h2`
  font-size: 1.5rem;
  color: #667788;
  font-weight: 500;
  max-width: 800px;
  margin: 0 auto 2rem;
  line-height: 1.4;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  width: 100%;
`;

const FeatureCard = styled(motion.div)`
  background-color: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const IconContainer = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: #f3e8fc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: var(--primary-purple);
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  color: var(--professional-navy);
  margin-bottom: 0.75rem;
  font-weight: 600;
`;

const FeatureDescription = styled.p`
  color: #667788;
  line-height: 1.6;
`;

const CTASection = styled.div`
  margin-top: 4rem;
  text-align: center;
`;

const CTAButton = styled(motion.button)`
  padding: 1rem 2.5rem;
  background-color: var(--primary-purple);
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 6px 15px rgba(139, 95, 191, 0.3);
  margin-bottom: 1.5rem;
`;

const TestimonialSection = styled.div`
  margin-top: 5rem;
  width: 100%;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  color: var(--professional-navy);
  text-align: center;
  margin-bottom: 2rem;
`;

const TestimonialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const TestimonialCard = styled.div`
  background-color: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  position: relative;
`;

const QuoteMark = styled.div`
  position: absolute;
  top: -15px;
  left: 25px;
  font-size: 4rem;
  color: var(--soft-pink);
  font-family: Georgia, serif;
  opacity: 0.6;
`;

const TestimonialText = styled.p`
  color: #4a5568;
  line-height: 1.7;
  font-style: italic;
  margin-bottom: 1.5rem;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AuthorAvatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.span`
  font-weight: 600;
  color: var(--professional-navy);
`;

const AuthorTitle = styled.span`
  font-size: 0.9rem;
  color: #667788;
`;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5
    }
  },
  hover: {
    y: -10,
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.12)",
    transition: { duration: 0.3 }
  }
};

const LaunchBranding = () => {
  return (
    <Container>
      <Hero>
        <BrandLogo 
          src="/images/branding/auraconnect-logo.png" 
          alt="AuraConnect Logo"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />
        <Tagline>
          Connect, Share, and Thrive with <span>AuraConnect</span>
        </Tagline>
        <SubTagline>
          A secure professional network designed exclusively for women to connect, 
          share experiences, and advance their careers in a supportive environment.
        </SubTagline>
      </Hero>
      
      <FeatureGrid>
        <FeatureCard
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <IconContainer>
            <FaShieldAlt size={32} />
          </IconContainer>
          <FeatureTitle>Women-Only Verification</FeatureTitle>
          <FeatureDescription>
            Our comprehensive verification system ensures a safe community of professional women with multi-factor authentication and identity verification.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          transition={{ delay: 0.1 }}
        >
          <IconContainer>
            <FaLightbulb size={32} />
          </IconContainer>
          <FeatureTitle>Dual-Mode Experience</FeatureTitle>
          <FeatureDescription>
            Switch seamlessly between your professional identity and anonymous mode to seek advice, share experiences, and discuss sensitive workplace issues.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          transition={{ delay: 0.2 }}
        >
          <IconContainer>
            <FaUsers size={32} />
          </IconContainer>
          <FeatureTitle>Mentorship & Support</FeatureTitle>
          <FeatureDescription>
            Connect with experienced mentors, join industry-specific groups, and access resources tailored to women's professional growth and challenges.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          transition={{ delay: 0.3 }}
        >
          <IconContainer>
            <FaHeart size={32} />
          </IconContainer>
          <FeatureTitle>Women-Friendly Jobs</FeatureTitle>
          <FeatureDescription>
            Discover career opportunities at companies with inclusive policies, pay equity, and advancement opportunities for women professionals.
          </FeatureDescription>
        </FeatureCard>
      </FeatureGrid>
      
      <CTASection>
        <CTAButton 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          Join AuraConnect Today
        </CTAButton>
      </CTASection>
      
      <TestimonialSection>
        <SectionTitle>What Women Are Saying</SectionTitle>
        
        <TestimonialGrid>
          <TestimonialCard>
            <QuoteMark>"</QuoteMark>
            <TestimonialText>
              AuraConnect's anonymous mode allowed me to discuss salary negotiations openly and get advice that helped me secure a 25% raise. The supportive community made all the difference.
            </TestimonialText>
            <TestimonialAuthor>
              <AuthorAvatar src="/images/branding/testimonial-1.jpg" alt="Testimonial Author" />
              <AuthorInfo>
                <AuthorName>Sarah J.</AuthorName>
                <AuthorTitle>Senior Product Manager</AuthorTitle>
              </AuthorInfo>
            </TestimonialAuthor>
          </TestimonialCard>
          
          <TestimonialCard>
            <QuoteMark>"</QuoteMark>
            <TestimonialText>
              The mentorship program connected me with an amazing leader in my field who helped guide my career transition. The women-only space creates a level of trust I haven't found elsewhere.
            </TestimonialText>
            <TestimonialAuthor>
              <AuthorAvatar src="/images/branding/testimonial-2.jpg" alt="Testimonial Author" />
              <AuthorInfo>
                <AuthorName>Maya R.</AuthorName>
                <AuthorTitle>Software Engineer</AuthorTitle>
              </AuthorInfo>
            </TestimonialAuthor>
          </TestimonialCard>
          
          <TestimonialCard>
            <QuoteMark>"</QuoteMark>
            <TestimonialText>
              Being able to share challenges in a safe space with other women executives has been invaluable. I found my tribe of supportive leaders who understand the unique challenges we face.
            </TestimonialText>
            <TestimonialAuthor>
              <AuthorAvatar src="/images/branding/testimonial-3.jpg" alt="Testimonial Author" />
              <AuthorInfo>
                <AuthorName>Priya K.</AuthorName>
                <AuthorTitle>VP of Operations</AuthorTitle>
              </AuthorInfo>
            </TestimonialAuthor>
          </TestimonialCard>
        </TestimonialGrid>
      </TestimonialSection>
    </Container>
  );
};

export default LaunchBranding; 