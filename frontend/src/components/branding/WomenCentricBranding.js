import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

/**
 * Women-centric branding component for Linker
 * Provides branded visual elements focused on women professionals
 */

const WomenCentricBranding = ({ showAll = false }) => {
  return (
    <BrandingContainer>
      <BrandingHeader>
        <Logo size="medium" />
        <BrandingTitle>Linker Brand Identity</BrandingTitle>
        <BrandTagline>Empowering women to connect professionally with confidence</BrandTagline>
      </BrandingHeader>
      
      <Section>
        <SectionTitle>Color Palette</SectionTitle>
        <ColorGrid>
          <ColorSwatch color="var(--primary-purple)" name="Primary Purple" hex="#8B5FBF" />
          <ColorSwatch color="var(--soft-pink)" name="Soft Pink" hex="#F8E8F0" />
          <ColorSwatch color="var(--professional-navy)" name="Professional Navy" hex="#2C3E50" />
          <ColorSwatch color="var(--success-green)" name="Success Green" hex="#27AE60" />
          <ColorSwatch color="var(--warning-amber)" name="Warning Amber" hex="#F39C12" />
        </ColorGrid>
      </Section>
      
      {showAll && (
        <>
          <Section>
            <SectionTitle>Typography</SectionTitle>
            <TypographyShowcase>
              <HeadingOne>Build your professional presence</HeadingOne>
              <HeadingTwo>Connect with other women in your field</HeadingTwo>
              <HeadingThree>Share insights safely and securely</HeadingThree>
              <BodyText>
                AuraConnect is designed to help women network confidently in a secure, 
                supportive environment. Our platform offers both professional visibility 
                and anonymous sharing options to address the unique challenges women face 
                in the workplace.
              </BodyText>
            </TypographyShowcase>
          </Section>
          
          <Section>
            <SectionTitle>Brand Values</SectionTitle>
            <ValueGrid>
              {brandValues.map((value, index) => (
                <ValueCard 
                  key={index}
                  whileHover={{ y: -5 }}
                >
                  <ValueIcon>{value.icon}</ValueIcon>
                  <ValueTitle>{value.title}</ValueTitle>
                  <ValueDescription>{value.description}</ValueDescription>
                </ValueCard>
              ))}
            </ValueGrid>
          </Section>
        </>
      )}
      
      <Section>
        <SectionTitle>Visual Style</SectionTitle>
        <StyleGrid>
          <StyleExample>
            <StyleImage src="/assets/branding/illustration-example.svg" alt="Brand illustration style" />
            <StyleTitle>Diverse & Inclusive Illustrations</StyleTitle>
          </StyleExample>
          <StyleExample>
            <StyleImage src="/assets/branding/photography-example.jpg" alt="Brand photography style" />
            <StyleTitle>Authentic Photography</StyleTitle>
          </StyleExample>
          <StyleExample>
            <StyleImage src="/assets/branding/ui-example.png" alt="UI component style" />
            <StyleTitle>Clean UI Components</StyleTitle>
          </StyleExample>
        </StyleGrid>
      </Section>
    </BrandingContainer>
  );
};

// Brand values data
const brandValues = [
  {
    icon: "🛡️",
    title: "Safety",
    description: "Creating a secure environment for professional women to connect and share."
  },
  {
    icon: "👥",
    title: "Community",
    description: "Building a supportive network of women across diverse industries and backgrounds."
  },
  {
    icon: "✨",
    title: "Empowerment",
    description: "Providing tools and resources for professional growth and confidence."
  },
  {
    icon: "🔒",
    title: "Privacy",
    description: "Respecting personal boundaries with robust privacy controls and anonymous options."
  }
];

// Logo component
const Logo = ({ size = "medium" }) => {
  const sizes = {
    small: 40,
    medium: 60,
    large: 100
  };
  
  return (
    <LogoImage 
      src="/assets/logo.svg" 
      alt="AuraConnect Logo" 
      width={sizes[size]}
      height={sizes[size]}
    />
  );
};

// Color swatch component
const ColorSwatch = ({ color, name, hex }) => (
  <SwatchContainer>
    <SwatchColor style={{ backgroundColor: color }} />
    <SwatchInfo>
      <SwatchName>{name}</SwatchName>
      <SwatchHex>{hex}</SwatchHex>
    </SwatchInfo>
  </SwatchContainer>
);

// Styled components
const BrandingContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
`;

const BrandingHeader = styled.header`
  text-align: center;
  margin-bottom: 3rem;
`;

const LogoImage = styled.img`
  margin-bottom: 1rem;
`;

const BrandingTitle = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--professional-navy);
  margin-bottom: 0.5rem;
`;

const BrandTagline = styled.p`
  font-size: 1.1rem;
  color: var(--primary-purple);
  font-style: italic;
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--professional-navy);
  margin-bottom: 1.5rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: var(--primary-purple);
    border-radius: 1.5px;
  }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
`;

const SwatchContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
`;

const SwatchColor = styled.div`
  height: 100px;
`;

const SwatchInfo = styled.div`
  padding: 0.75rem;
  background-color: white;
`;

const SwatchName = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const SwatchHex = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const TypographyShowcase = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
`;

const HeadingOne = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--professional-navy);
  margin-bottom: 1rem;
`;

const HeadingTwo = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--professional-navy);
  margin-bottom: 0.75rem;
`;

const HeadingThree = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--professional-navy);
  margin-bottom: 1rem;
`;

const BodyText = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
`;

const ValueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
`;

const ValueCard = styled(motion.div)`
  background-color: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const ValueIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const ValueTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--professional-navy);
  margin-bottom: 0.5rem;
`;

const ValueDescription = styled.p`
  font-size: 0.9rem;
  line-height: 1.5;
  color: #666;
`;

const StyleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
`;

const StyleExample = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const StyleImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 1rem;
`;

const StyleTitle = styled.h4`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--professional-navy);
`;

export default WomenCentricBranding; 