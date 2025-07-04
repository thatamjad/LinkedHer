import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styled from 'styled-components';
import { 
  Users, 
  Shield, 
  Heart, 
  Sparkles, 
  ArrowRight, 
  Star, 
  CheckCircle,
  Play,
  Download,
  TrendingUp,  Award,
  Lock,
  MessageCircle
} from 'lucide-react';
import { Button, Card, Avatar, Badge } from '../ui/ModernComponents';

// Styled Components with Modern Design
const HeroSection = styled(motion.section)`
  min-height: 100vh;
  background: linear-gradient(135deg, 
    rgba(139, 95, 191, 0.1) 0%, 
    rgba(236, 72, 153, 0.1) 50%, 
    rgba(59, 130, 246, 0.1) 100%
  );
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="%23ffffff" stop-opacity="0.1"/><stop offset="100%" stop-color="%23ffffff" stop-opacity="0"/></radialGradient></defs><circle cx="500" cy="500" r="400" fill="url(%23a)"/></svg>') center/cover;
    pointer-events: none;
  }
`;

const HeroContainer = styled.div`
  max-width: 1200px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const HeroTitle = styled(motion.h1)`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  background: linear-gradient(135deg, #8b5fbf, #ec4899, #3b82f6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.25rem;
  color: var(--gray-600);
  line-height: 1.6;
  margin: 0;
`;

const HeroButtons = styled(motion.div)`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const HeroVisual = styled(motion.div)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FloatingCard = styled(motion.div)`
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 250px;
`;

const FeatureSection = styled.section`
  padding: 6rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const FeatureCard = styled(motion.div)`
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #8b5fbf, #ec4899);
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(139, 95, 191, 0.1), rgba(236, 72, 153, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: #8b5fbf;
`;

const StatsSection = styled.section`
  background: linear-gradient(135deg, #8b5fbf, #ec4899);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const StatCard = styled(motion.div)`
  text-align: center;
`;

const StatNumber = styled(motion.div)`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1.125rem;
  opacity: 0.9;
`;

const TestimonialSection = styled.section`
  padding: 6rem 2rem;
  background: rgba(139, 95, 191, 0.02);
`;

const TestimonialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 3rem auto 0;
`;

const TestimonialCard = styled(motion.div)`
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: relative;

  &::before {
    content: '"';
    position: absolute;
    top: -1rem;
    left: 1.5rem;
    font-size: 4rem;
    color: #8b5fbf;
    font-family: serif;
    opacity: 0.3;
  }
`;

const TestimonialContent = styled.p`
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  color: var(--gray-700);
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TestimonialName = styled.div`
  font-weight: 600;
  color: var(--gray-900);
`;

const TestimonialTitle = styled.div`
  font-size: 0.875rem;
  color: var(--gray-500);
`;

const CTASection = styled.section`
  background: linear-gradient(135deg, #1f2937, #374151);
  color: white;
  padding: 6rem 2rem;
  text-align: center;
`;

const CTAContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
`;

const CTASubtitle = styled.p`
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #8b5fbf, #ec4899);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SectionSubtitle = styled.p`
  font-size: 1.25rem;
  color: var(--gray-600);
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`;

const ModernLandingPage = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const features = [
    {
      icon: <Shield size={24} />,
      title: "Privacy First",
      description: "Advanced encryption and anonymous modes to protect your identity while networking professionally."
    },
    {
      icon: <Users size={24} />,
      title: "Women-Centric Community",
      description: "Connect with like-minded women professionals in a safe, supportive environment designed for growth."
    },
    {
      icon: <Heart size={24} />,
      title: "Mental Health Support",
      description: "Access resources, support groups, and tools to maintain work-life balance and mental wellness."
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Career Growth",
      description: "Find mentors, explore opportunities, and advance your career with our comprehensive job platform."
    },
    {
      icon: <Award size={24} />,
      title: "Skill Development",
      description: "Identify skill gaps and access tailored learning resources to enhance your professional capabilities."
    },
    {
      icon: <MessageCircle size={24} />,
      title: "Collaborative Projects",
      description: "Work on meaningful projects with other professionals and build your portfolio together."
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Women" },
    { number: "500+", label: "Companies" },
    { number: "95%", label: "Success Rate" },
    { number: "24/7", label: "Support" }
  ];

  const testimonials = [
    {
      content: "AuraConnect helped me find my dream job in tech. The anonymous feature gave me confidence to share my experiences without fear.",
      author: "Sarah Chen",
      title: "Software Engineer at Google",
      avatar: "/api/placeholder/60/60"
    },
    {
      content: "The mentorship program connected me with amazing women leaders. I've grown more in 6 months than in my previous 2 years.",
      author: "Maria Rodriguez",
      title: "Product Manager at Microsoft",
      avatar: "/api/placeholder/60/60"
    },
    {
      content: "Finally, a platform that understands the unique challenges women face in the workplace. The support here is incredible.",
      author: "Dr. Aisha Patel",
      title: "Research Director at Stanford",
      avatar: "/api/placeholder/60/60"
    }
  ];

  const floatingElements = [
    {
      icon: <Users size={20} />,
      text: "Join 50K+ Women",
      delay: 0,
      x: 100,
      y: -50
    },
    {
      icon: <Shield size={20} />,
      text: "100% Secure",
      delay: 0.5,
      x: -80,
      y: 100
    },
    {
      icon: <Star size={20} />,
      text: "4.9/5 Rating",
      delay: 1,
      x: 120,
      y: 150
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <HeroSection style={{ y, opacity }}>
        <HeroContainer>
          <HeroContent>
            <HeroTitle
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Empower Your
              <br />
              Professional Journey
            </HeroTitle>
            
            <HeroSubtitle
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Join the premier platform designed exclusively for women professionals. 
              Connect, grow, and thrive in a safe, supportive community.
            </HeroSubtitle>

            <HeroButtons
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button 
                size="lg" 
                rightIcon={<ArrowRight size={20} />}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                leftIcon={<Play size={20} />}
              >
                Watch Demo
              </Button>
            </HeroButtons>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
            >
              <div style={{ display: 'flex', marginLeft: '-0.5rem' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Avatar 
                    key={i}
                    size="sm" 
                    src={`/api/placeholder/40/40?face=${i}`}
                    style={{ marginLeft: '-0.5rem', border: '2px solid white' }}
                  />
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />
                  ))}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', margin: 0 }}>
                  Trusted by 50,000+ women professionals
                </p>
              </div>
            </motion.div>
          </HeroContent>

          <HeroVisual>
            {floatingElements.map((element, index) => (
              <FloatingCard
                key={index}
                initial={{ opacity: 0, scale: 0.8, x: element.x, y: element.y }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: [element.y, element.y - 10, element.y],
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: element.delay,
                  y: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                style={{ x: element.x, y: element.y }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    padding: '0.5rem', 
                    borderRadius: '0.5rem', 
                    background: 'linear-gradient(135deg, rgba(139, 95, 191, 0.1), rgba(236, 72, 153, 0.1))',
                    color: '#8b5fbf'
                  }}>
                    {element.icon}
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>
                    {element.text}
                  </span>
                </div>
              </FloatingCard>
            ))}
          </HeroVisual>
        </HeroContainer>
      </HeroSection>

      {/* Features Section */}
      <FeatureSection>
        <SectionTitle>Everything You Need to Succeed</SectionTitle>
        <SectionSubtitle>
          Comprehensive tools and features designed specifically for women professionals
        </SectionSubtitle>

        <FeatureGrid>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
            >
              <FeatureIcon>
                {feature.icon}
              </FeatureIcon>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                marginBottom: '1rem',
                color: 'var(--gray-900)'
              }}>
                {feature.title}
              </h3>
              <p style={{ 
                color: 'var(--gray-600)', 
                lineHeight: 1.6,
                margin: 0
              }}>
                {feature.description}
              </p>
            </FeatureCard>
          ))}
        </FeatureGrid>
      </FeatureSection>

      {/* Stats Section */}
      <StatsSection>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <SectionTitle style={{ color: 'white', marginBottom: '3rem' }}>
            Trusted by Women Worldwide
          </SectionTitle>
          
          <StatsGrid>
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <StatNumber>{stat.number}</StatNumber>
                <StatLabel>{stat.label}</StatLabel>
              </StatCard>
            ))}
          </StatsGrid>
        </div>
      </StatsSection>

      {/* Testimonials Section */}
      <TestimonialSection>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <SectionTitle>What Our Community Says</SectionTitle>
          <SectionSubtitle>
            Real stories from women who've transformed their careers with AuraConnect
          </SectionSubtitle>

          <TestimonialGrid>
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <TestimonialContent>
                  {testimonial.content}
                </TestimonialContent>
                
                <TestimonialAuthor>
                  <Avatar 
                    src={testimonial.avatar}
                    name={testimonial.author}
                    size="md"
                  />
                  <div>
                    <TestimonialName>{testimonial.author}</TestimonialName>
                    <TestimonialTitle>{testimonial.title}</TestimonialTitle>
                  </div>
                </TestimonialAuthor>
              </TestimonialCard>
            ))}
          </TestimonialGrid>
        </div>
      </TestimonialSection>

      {/* CTA Section */}
      <CTASection>
        <CTAContent>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <CTATitle>Ready to Transform Your Career?</CTATitle>
            <CTASubtitle>
              Join thousands of successful women professionals who've already started their journey
            </CTASubtitle>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                size="xl"
                variant="secondary"
                rightIcon={<ArrowRight size={20} />}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Your Journey
              </Button>
              <Button 
                size="xl"
                variant="ghost"
                leftIcon={<Download size={20} />}
                style={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
              >
                Download App
              </Button>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <Badge color="success" size="lg">
                <CheckCircle size={16} style={{ marginRight: '0.5rem' }} />
                Free to Join
              </Badge>
              <Badge color="primary" size="lg">
                <Lock size={16} style={{ marginRight: '0.5rem' }} />
                100% Secure
              </Badge>
              <Badge color="warning" size="lg">
                <Sparkles size={16} style={{ marginRight: '0.5rem' }} />
                No Ads
              </Badge>
            </div>
          </motion.div>
        </CTAContent>
      </CTASection>
    </div>
  );
};

export default ModernLandingPage;
