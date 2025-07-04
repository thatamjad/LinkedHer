import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { toast } from 'react-toastify';

const BetaTesterRecruitmentForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/beta-testing/testers/recruit', {
        userId: data.userId || localStorage.getItem('userId'),
        demographics: {
          age: parseInt(data.age),
          location: data.location,
          industry: data.industry,
          jobTitle: data.jobTitle,
          experience: data.experience,
          deviceTypes: data.deviceTypes
        },
        testingAreas: data.testingAreas.map(area => ({ feature: area }))
      });

      toast.success('Successfully joined the beta testing program!');
      navigate('/beta-testing/onboarding');
    } catch (error) {
      console.error('Error joining beta program:', error);
      toast.error(error.response?.data?.message || 'Failed to join beta program');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer>
      <FormHeader>
        <h1>Join Our Beta Testing Program</h1>
        <p>Help shape the future of AuraConnect by testing new features and providing valuable feedback</p>
      </FormHeader>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Section>
          <SectionTitle>
            <h2>Personal Information</h2>
            <p>Tell us a bit about yourself</p>
          </SectionTitle>

          <FormGroup>
            <Label htmlFor="age">Age</Label>
            <Input
              type="number"
              id="age"
              {...register('age', { required: 'Age is required', min: { value: 18, message: 'Must be at least 18 years old' } })}
            />
            {errors.age && <ErrorMessage>{errors.age.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="location">Location</Label>
            <Input
              type="text"
              id="location"
              placeholder="City, Country"
              {...register('location', { required: 'Location is required' })}
            />
            {errors.location && <ErrorMessage>{errors.location.message}</ErrorMessage>}
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>
            <h2>Professional Background</h2>
            <p>Information about your work experience</p>
          </SectionTitle>

          <FormGroup>
            <Label htmlFor="industry">Industry</Label>
            <Select
              id="industry"
              {...register('industry', { required: 'Industry is required' })}
            >
              <option value="">Select your industry</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="finance">Finance</option>
              <option value="marketing">Marketing</option>
              <option value="design">Design</option>
              <option value="retail">Retail</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="nonprofit">Non-profit</option>
              <option value="other">Other</option>
            </Select>
            {errors.industry && <ErrorMessage>{errors.industry.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              type="text"
              id="jobTitle"
              {...register('jobTitle', { required: 'Job title is required' })}
            />
            {errors.jobTitle && <ErrorMessage>{errors.jobTitle.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="experience">Experience Level</Label>
            <Select
              id="experience"
              {...register('experience', { required: 'Experience level is required' })}
            >
              <option value="">Select your experience level</option>
              <option value="0-2 years">0-2 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="6-10 years">6-10 years</option>
              <option value="10+ years">10+ years</option>
            </Select>
            {errors.experience && <ErrorMessage>{errors.experience.message}</ErrorMessage>}
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>
            <h2>Testing Preferences</h2>
            <p>Help us understand which areas you'd like to test</p>
          </SectionTitle>

          <FormGroup>
            <Label>Devices You Use</Label>
            <CheckboxGroup>
              <CheckboxItem>
                <Checkbox
                  type="checkbox"
                  id="deviceDesktop"
                  value="desktop"
                  {...register('deviceTypes', { required: 'Select at least one device' })}
                />
                <CheckboxLabel htmlFor="deviceDesktop">Desktop</CheckboxLabel>
              </CheckboxItem>
              
              <CheckboxItem>
                <Checkbox
                  type="checkbox"
                  id="deviceLaptop"
                  value="laptop"
                  {...register('deviceTypes')}
                />
                <CheckboxLabel htmlFor="deviceLaptop">Laptop</CheckboxLabel>
              </CheckboxItem>
              
              <CheckboxItem>
                <Checkbox
                  type="checkbox"
                  id="deviceTablet"
                  value="tablet"
                  {...register('deviceTypes')}
                />
                <CheckboxLabel htmlFor="deviceTablet">Tablet</CheckboxLabel>
              </CheckboxItem>
              
              <CheckboxItem>
                <Checkbox
                  type="checkbox"
                  id="deviceMobile"
                  value="mobile"
                  {...register('deviceTypes')}
                />
                <CheckboxLabel htmlFor="deviceMobile">Mobile</CheckboxLabel>
              </CheckboxItem>
            </CheckboxGroup>
            {errors.deviceTypes && <ErrorMessage>{errors.deviceTypes.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Areas You're Interested in Testing</Label>
            <CheckboxGroup>
              <CheckboxItem>
                <Checkbox
                  type="checkbox"
                  id="areaProfessional"
                  value="professionalMode"
                  {...register('testingAreas', { required: 'Select at least one area' })}
                />
                <CheckboxLabel htmlFor="areaProfessional">Professional Mode</CheckboxLabel>
              </CheckboxItem>
              
              <CheckboxItem>
                <Checkbox
                  type="checkbox"
                  id="areaAnonymous"
                  value="anonymousMode"
                  {...register('testingAreas')}
                />
                <CheckboxLabel htmlFor="areaAnonymous">Anonymous Mode</CheckboxLabel>
              </CheckboxItem>
              
              <CheckboxItem>
                <Checkbox
                  type="checkbox"
                  id="areaVerification"
                  value="verification"
                  {...register('testingAreas')}
                />
                <CheckboxLabel htmlFor="areaVerification">Verification System</CheckboxLabel>
              </CheckboxItem>
              
              <CheckboxItem>
                <Checkbox
                  type="checkbox"
                  id="areaJobs"
                  value="jobBoard"
                  {...register('testingAreas')}
                />
                <CheckboxLabel htmlFor="areaJobs">Job Board</CheckboxLabel>
              </CheckboxItem>
              
              <CheckboxItem>
                <Checkbox
                  type="checkbox"
                  id="areaMentorship"
                  value="mentorship"
                  {...register('testingAreas')}
                />
                <CheckboxLabel htmlFor="areaMentorship">Mentorship</CheckboxLabel>
              </CheckboxItem>
              
              <CheckboxItem>
                <Checkbox
                  type="checkbox"
                  id="areaSupportGroups"
                  value="supportGroups"
                  {...register('testingAreas')}
                />
                <CheckboxLabel htmlFor="areaSupportGroups">Support Groups</CheckboxLabel>
              </CheckboxItem>
              
              <CheckboxItem>
                <Checkbox
                  type="checkbox"
                  id="areaSkillGap"
                  value="skillGap"
                  {...register('testingAreas')}
                />
                <CheckboxLabel htmlFor="areaSkillGap">Skill Gap Analysis</CheckboxLabel>
              </CheckboxItem>
              
              <CheckboxItem>
                <Checkbox
                  type="checkbox"
                  id="areaNegotiation"
                  value="negotiation"
                  {...register('testingAreas')}
                />
                <CheckboxLabel htmlFor="areaNegotiation">Negotiation Tools</CheckboxLabel>
              </CheckboxItem>
              
              <CheckboxItem>
                <Checkbox
                  type="checkbox"
                  id="areaSecurity"
                  value="security"
                  {...register('testingAreas')}
                />
                <CheckboxLabel htmlFor="areaSecurity">Security & Privacy</CheckboxLabel>
              </CheckboxItem>
            </CheckboxGroup>
            {errors.testingAreas && <ErrorMessage>{errors.testingAreas.message}</ErrorMessage>}
          </FormGroup>
        </Section>

        <SubmitButtonContainer>
          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Join Beta Program'}
          </SubmitButton>
        </SubmitButtonContainer>
      </Form>
    </FormContainer>
  );
};

// Styled Components
const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(139, 95, 191, 0.1);
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    color: var(--professional-navy);
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #6c757d;
    font-size: 1rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e9ecef;
  
  h2 {
    color: var(--primary-purple);
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
  }
  
  p {
    color: #6c757d;
    font-size: 0.875rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--professional-navy);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.15s ease-in-out;
  
  &:focus {
    border-color: var(--primary-purple);
    outline: none;
    box-shadow: 0 0 0 3px rgba(139, 95, 191, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.15s ease-in-out;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
  
  &:focus {
    border-color: var(--primary-purple);
    outline: none;
    box-shadow: 0 0 0 3px rgba(139, 95, 191, 0.1);
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
  width: 18px;
  height: 18px;
  accent-color: var(--primary-purple);
`;

const CheckboxLabel = styled.label`
  font-size: 0.9rem;
  color: var(--professional-navy);
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const SubmitButtonContainer = styled.div`
  text-align: center;
`;

const SubmitButton = styled.button`
  background-color: var(--primary-purple);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.85rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
  
  &:hover {
    background-color: #7b4fb0;
  }
  
  &:disabled {
    background-color: #a8a8a8;
    cursor: not-allowed;
  }
`;

export default BetaTesterRecruitmentForm; 