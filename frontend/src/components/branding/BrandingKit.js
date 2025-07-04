import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

/**
 * Comprehensive branding kit for AuraConnect
 * Provides women-centric visual elements and design guidelines
 */

// Logo variants
export const Logo = ({variant = 'primary', size = 'medium'}) => {
  const logoSizes = {
    small: 40,
    medium: 80,
    large: 120,
    xlarge: 180
  };
  
  // Choose the right logo based on variant
  const logoSrc = variant === 'light' 
    ? '/assets/logo-light.svg' 
    : variant === 'dark' 
      ? '/assets/logo-dark.svg'
      : '/assets/logo.svg';
  
  return (
    <LogoImage 
      src={logoSrc} 
      alt="AuraConnect Logo" 
      width={logoSizes[size]} 
      height={logoSizes[size]}
    />
  );
};

// Brand colors
export const BrandColors = () => {
  return (
    <ColorsContainer>
      <ColorSection>
        <SectionTitle>Primary Brand Colors</SectionTitle>
        <ColorGrid>
          <ColorSwatch color="var(--primary-purple)" name="Primary Purple" hex="#8B5FBF" />
          <ColorSwatch color="var(--soft-pink)" name="Soft Pink" hex="#F8E8F0" />
          <ColorSwatch color="var(--professional-navy)" name="Professional Navy" hex="#2C3E50" />
        </ColorGrid>
      </ColorSection>
      
      <ColorSection>
        <SectionTitle>Functional Colors</SectionTitle>
        <ColorGrid>
          <ColorSwatch color="var(--success-green)" name="Success Green" hex="#27AE60" />
          <ColorSwatch color="var(--warning-amber)" name="Warning Amber" hex="#F39C12" />
          <ColorSwatch color="var(--danger-red)" name="Danger Red" hex="#E74C3C" />
          <ColorSwatch color="var(--info-blue)" name="Info Blue" hex="#3498DB" />
        </ColorGrid>
      </ColorSection>
      
      <ColorSection>
        <SectionTitle>Neutrals</SectionTitle>
        <ColorGrid>
          <ColorSwatch color="#FFFFFF" name="White" hex="#FFFFFF" />
          <ColorSwatch color="#F9F9F9" name="Ghost White" hex="#F9F9F9" />
          <ColorSwatch color="#E8E8E8" name="Light Gray" hex="#E8E8E8" />
          <ColorSwatch color="#BCBCBC" name="Medium Gray" hex="#BCBCBC" />
          <ColorSwatch color="#757575" name="Dark Gray" hex="#757575" />
          <ColorSwatch color="#333333" name="Almost Black" hex="#333333" />
        </ColorGrid>
      </ColorSection>
    </ColorsContainer>
  );
};

// Typography showcase
export const Typography = () => {
  return (
    <TypographyContainer>
      <SectionTitle>Typography</SectionTitle>
      
      <FontSection>
        <FontTitle>Headings: Montserrat</FontTitle>
        <HeadingOne>H1: Empowering Women in Professional Spaces</HeadingOne>
        <HeadingTwo>H2: Build Your Network with Confidence</HeadingTwo>
        <HeadingThree>H3: Share Your Voice Without Judgment</HeadingThree>
        <HeadingFour>H4: Connect with Like-minded Professionals</HeadingFour>
        <HeadingFive>H5: Support Across Industries</HeadingFive>
        <HeadingSix>H6: Safe and Secure Community</HeadingSix>
      </FontSection>
      
      <FontSection>
        <FontTitle>Body Text: Inter</FontTitle>
        <BodyText>
          Body Text: AuraConnect is a professional networking platform exclusively designed for women, 
          providing a safe space to build connections, share experiences, and grow professionally without 
          the common biases found in traditional networking environments.
        </BodyText>
        <BodyTextSmall>
          Small Text: Our verification system ensures a women-only space while our anonymous mode 
          provides an additional layer of protection when discussing sensitive topics.
        </BodyTextSmall>
      </FontSection>
    </TypographyContainer>
  );
};

// Illustration showcase with women-centric themes
export const Illustrations = () => {
  const illustrations = [
    { 
      src: '/assets/illustrations/networking.svg', 
      alt: 'Women networking', 
      title: 'Professional Networking' 
    },
    { 
      src: '/assets/illustrations/mentorship.svg', 
      alt: 'Mentorship session', 
      title: 'Mentorship' 
    },
    { 
      src: '/assets/illustrations/community.svg', 
      alt: 'Supportive community', 
      title: 'Community Support' 
    },
    { 
      src: '/assets/illustrations/career.svg', 
      alt: 'Career growth', 
      title: 'Career Development' 
    }
  ];
  
  return (
    <IllustrationsContainer>
      <SectionTitle>Illustrations</SectionTitle>
      <IllustrationGrid>
        {illustrations.map((illustration, index) => (
          <IllustrationCard key={index}>
            <IllustrationImage
              src={illustration.src}
              alt={illustration.alt}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
            <IllustrationTitle>{illustration.title}</IllustrationTitle>
          </IllustrationCard>
        ))}
      </IllustrationGrid>
    </IllustrationsContainer>
  );
};

// Button variants showcase
export const ButtonVariants = () => {
  return (
    <ButtonsContainer>
      <SectionTitle>Button Variants</SectionTitle>
      
      <ButtonSet>
        <ButtonVariantTitle>Primary Buttons</ButtonVariantTitle>
        <ButtonRow>
          <PrimaryButton>Primary</PrimaryButton>
          <PrimaryButton disabled>Disabled</PrimaryButton>
          <PrimaryButton>
            <ButtonIcon className="material-icons">add</ButtonIcon>
            With Icon
          </PrimaryButton>
        </ButtonRow>
      </ButtonSet>
      
      <ButtonSet>
        <ButtonVariantTitle>Secondary Buttons</ButtonVariantTitle>
        <ButtonRow>
          <SecondaryButton>Secondary</SecondaryButton>
          <SecondaryButton disabled>Disabled</SecondaryButton>
          <SecondaryButton>
            <ButtonIcon className="material-icons">favorite</ButtonIcon>
            With Icon
          </SecondaryButton>
        </ButtonRow>
      </ButtonSet>
      
      <ButtonSet>
        <ButtonVariantTitle>Text Buttons</ButtonVariantTitle>
        <ButtonRow>
          <TextButton>Text Button</TextButton>
          <TextButton disabled>Disabled</TextButton>
          <TextButton>
            <ButtonIcon className="material-icons">arrow_forward</ButtonIcon>
            With Icon
          </TextButton>
        </ButtonRow>
      </ButtonSet>
      
      <ButtonSet>
        <ButtonVariantTitle>Special Buttons</ButtonVariantTitle>
        <ButtonRow>
          <AnonymousModeButton>
            <ButtonIcon className="material-icons">mask</ButtonIcon>
            Anonymous Mode
          </AnonymousModeButton>
          <ProfessionalModeButton>
            <ButtonIcon className="material-icons">business</ButtonIcon>
            Professional Mode
          </ProfessionalModeButton>
        </ButtonRow>
      </ButtonSet>
    </ButtonsContainer>
  );
};

// Brand message and values showcase
export const BrandValues = () => {
  const values = [
    {
      icon: 'security',
      title: 'Safety',
      description: 'Creating a secure environment for professional women to connect and share.'
    },
    {
      icon: 'diversity_3',
      title: 'Community',
      description: 'Building a supportive network of women across diverse industries and backgrounds.'
    },
    {
      icon: 'psychology',
      title: 'Empowerment',
      description: 'Providing tools and resources for professional growth and confidence.'
    },
    {
      icon: 'visibility_off',
      title: 'Privacy',
      description: 'Respecting personal boundaries with robust privacy controls and anonymous interaction options.'
    },
    {
      icon: 'workspace_premium',
      title: 'Excellence',
      description: 'Striving for the highest quality in platform features and user experience.'
    },
    {
      icon: 'menu_book',
      title: 'Education',
      description: 'Facilitating knowledge sharing and skill development among members.'
    }
  ];
  
  return (
    <ValuesContainer>
      <SectionTitle>Brand Values</SectionTitle>
      <ValuesMission>
        Empowering women to build meaningful professional connections in a safe, supportive environment.
      </ValuesMission>
      
      <ValuesGrid>
        {values.map((value, index) => (
          <ValueCard 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <ValueIcon className="material-icons">{value.icon}</ValueIcon>
            <ValueTitle>{value.title}</ValueTitle>
            <ValueDescription>{value.description}</ValueDescription>
          </ValueCard>
        ))}
      </ValuesGrid>
    </ValuesContainer>
  );
};

// Complete branding kit component
const BrandingKit = () => {
  return (
    <BrandingContainer>
      <BrandingHeader>
        <Logo size="large" />
        <BrandingTitle>AuraConnect Brand Guidelines</BrandingTitle>
      </BrandingHeader>
      
      <BrandingSection>
        <BrandColors />
      </BrandingSection>
      
      <BrandingSection>
        <Typography />
      </BrandingSection>
      
      <BrandingSection>
        <ButtonVariants />
      </BrandingSection>
      
      <BrandingSection>
        <Illustrations />
      </BrandingSection>
      
      <BrandingSection>
        <BrandValues />
      </BrandingSection>
    </BrandingContainer>
  );
};

// Styled components definitions

const LogoImage = styled.img`
  object-fit: contain;
`;

const BrandingContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
`;

const BrandingHeader = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 4rem;
  text-align: center;
`;

const BrandingTitle = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--professional-navy);
  margin-top: 1.5rem;
`;

const BrandingSection = styled.section`
  margin-bottom: 4rem;
  padding: 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const ColorsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ColorSection = styled.div``;

const SectionTitle = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--professional-navy);
  margin-bottom: 1.5rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 80px;
    height: 4px;
    background-color: var(--primary-purple);
    border-radius: 2px;
  }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;

const ColorSwatch = ({ color, name, hex }) => (
  <SwatchContainer>
    <SwatchColor style={{ backgroundColor: color }} />
    <SwatchName>{name}</SwatchName>
    <SwatchHex>{hex}</SwatchHex>
  </SwatchContainer>
);

const SwatchContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const SwatchColor = styled.div`
  width: 100%;
  height: 80px;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
`;

const SwatchName = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
`;

const SwatchHex = styled.span`
  font-size: 0.8rem;
  color: #666;
`;

const TypographyContainer = styled.div``;

const FontSection = styled.div`
  margin-bottom: 2rem;
`;

const FontTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary-purple);
  margin-bottom: 1rem;
`;

const HeadingOne = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--professional-navy);
`;

const HeadingTwo = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--professional-navy);
`;

const HeadingThree = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--professional-navy);
`;

const HeadingFour = styled.h4`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--professional-navy);
`;

const HeadingFive = styled.h5`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--professional-navy);
`;

const HeadingSix = styled.h6`
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--professional-navy);
`;

const BodyText = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  color: #333;
`;

const BodyTextSmall = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #666;
`;

const IllustrationsContainer = styled.div``;

const IllustrationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
`;

const IllustrationCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IllustrationImage = styled(motion.img)`
  width: 100%;
  height: 180px;
  object-fit: contain;
  margin-bottom: 1rem;
`;

const IllustrationTitle = styled.h4`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--professional-navy);
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ButtonSet = styled.div`
  margin-bottom: 1.5rem;
`;

const ButtonVariantTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ButtonIcon = styled.span`
  margin-right: 0.5rem;
  font-size: 1.2rem;
`;

const baseButtonStyles = `
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const PrimaryButton = styled.button`
  ${baseButtonStyles}
  background-color: var(--primary-purple);
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #7d51af;
    transform: translateY(-2px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled.button`
  ${baseButtonStyles}
  background-color: transparent;
  color: var(--primary-purple);
  border: 2px solid var(--primary-purple);
  
  &:hover:not(:disabled) {
    background-color: rgba(139, 95, 191, 0.1);
    transform: translateY(-2px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const TextButton = styled.button`
  ${baseButtonStyles}
  background-color: transparent;
  color: var(--primary-purple);
  border: none;
  padding: 0.75rem 1rem;
  
  &:hover:not(:disabled) {
    background-color: rgba(139, 95, 191, 0.1);
  }
`;

const AnonymousModeButton = styled.button`
  ${baseButtonStyles}
  background-color: #2f3136;
  color: white;
  border: none;
  
  &:hover {
    background-color: #26282c;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ProfessionalModeButton = styled.button`
  ${baseButtonStyles}
  background-color: #3498db;
  color: white;
  border: none;
  
  &:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ValuesContainer = styled.div``;

const ValuesMission = styled.p`
  font-size: 1.4rem;
  font-style: italic;
  font-weight: 500;
  color: var(--primary-purple);
  text-align: center;
  margin-bottom: 3rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
`;

const ValueCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(139, 95, 191, 0.15);
  }
`;

const ValueIcon = styled.span`
  font-size: 2.5rem;
  color: var(--primary-purple);
  margin-bottom: 1rem;
`;

const ValueTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--professional-navy);
  margin-bottom: 0.75rem;
`;

const ValueDescription = styled.p`
  font-size: 0.95rem;
  line-height: 1.5;
  color: #666;
`;

export default BrandingKit; 