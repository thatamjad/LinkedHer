import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { FaBug, FaCamera, FaExclamationTriangle, FaInfo, FaCheck, FaDesktop, FaTrash } from 'react-icons/fa';

const BugReportForm = () => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [steps, setSteps] = useState([{ stepNumber: 1, description: '' }]);
  const [screenshots, setScreenshots] = useState([]);
  const [testScenario, setTestScenario] = useState('');
  const navigate = useNavigate();

  const watchFeatureArea = watch('featureArea');
  const watchSeverity = watch('severity', 'medium');

  // Add a new reproduction step
  const addStep = () => {
    setSteps([...steps, { stepNumber: steps.length + 1, description: '' }]);
  };

  // Remove a reproduction step
  const removeStep = (index) => {
    if (steps.length > 1) {
      const newSteps = [...steps];
      newSteps.splice(index, 1);
      // Update step numbers
      newSteps.forEach((step, i) => {
        step.stepNumber = i + 1;
      });
      setSteps(newSteps);
    }
  };

  // Handle step description change
  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index].description = value;
    setSteps(newSteps);
  };

  // Handle screenshot upload
  const handleScreenshotUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setScreenshots(prev => [
            ...prev, 
            { 
              url: reader.result, 
              file, 
              description: '', 
              timestamp: new Date() 
            }
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Clear the input
    e.target.value = '';
  };

  // Remove a screenshot
  const removeScreenshot = (index) => {
    const newScreenshots = [...screenshots];
    newScreenshots.splice(index, 1);
    setScreenshots(newScreenshots);
  };

  // Update screenshot description
  const updateScreenshotDescription = (index, description) => {
    const newScreenshots = [...screenshots];
    newScreenshots[index].description = description;
    setScreenshots(newScreenshots);
  };

  // Get device information automatically
  const getDeviceInfo = () => {
    const deviceInfo = {
      deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      browser: getBrowserInfo(),
      operatingSystem: getOSInfo(),
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      userAgent: navigator.userAgent
    };
    
    setValue('deviceInfo.deviceType', deviceInfo.deviceType);
    setValue('deviceInfo.browser', deviceInfo.browser);
    setValue('deviceInfo.operatingSystem', deviceInfo.operatingSystem);
    setValue('deviceInfo.screenResolution', deviceInfo.screenResolution);
    setValue('deviceInfo.otherDetails', deviceInfo.userAgent);
    
    toast.success('Device information detected!', { autoClose: 2000 });
  };

  // Get browser information
  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    let browserName;
    
    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = "Chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = "Firefox";
    } else if (userAgent.match(/safari/i)) {
      browserName = "Safari";
    } else if (userAgent.match(/opr\//i)) {
      browserName = "Opera";
    } else if (userAgent.match(/edg/i)) {
      browserName = "Edge";
    } else {
      browserName = "Unknown";
    }
    
    return browserName;
  };

  // Get OS information
  const getOSInfo = () => {
    const userAgent = navigator.userAgent;
    let osName;
    
    if (userAgent.indexOf("Win") !== -1) {
      osName = "Windows";
    } else if (userAgent.indexOf("Mac") !== -1) {
      osName = "MacOS";
    } else if (userAgent.indexOf("Linux") !== -1) {
      osName = "Linux";
    } else if (userAgent.indexOf("Android") !== -1) {
      osName = "Android";
    } else if (userAgent.indexOf("iOS") !== -1) {
      osName = "iOS";
    } else {
      osName = "Unknown";
    }
    
    return osName;
  };

  // Submit the bug report
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Format reproduction steps and screenshots
      const formattedSteps = steps.map(step => ({
        stepNumber: step.stepNumber,
        description: step.description
      }));
      
      const formattedScreenshots = screenshots.map(screenshot => ({
        url: screenshot.url,
        description: screenshot.description,
        timestamp: screenshot.timestamp
      }));
      
      // Prepare data for submission
      const reportData = {
        ...data,
        testerId: localStorage.getItem('betaTesterId') || data.testerId,
        reproductionSteps: formattedSteps,
        screenshots: formattedScreenshots,
        relatedTestScenario: testScenario || null
      };
      
      const response = await axios.post('/api/beta-testing/bug-reports', reportData);
      
      toast.success('Bug report submitted successfully!');
      navigate('/beta-testing/bugs/confirmation', { state: { bugId: response.data.data._id } });
    } catch (error) {
      console.error('Error submitting bug report:', error);
      toast.error(error.response?.data?.message || 'Failed to submit bug report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer>
      <FormHeader>
        <BugIconWrapper>
          <FaBug size={24} />
        </BugIconWrapper>
        <h1>Report a Bug</h1>
        <p>Help us improve AuraConnect by reporting any issues you encounter</p>
      </FormHeader>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Section>
          <SectionTitle>
            <h2>Bug Details</h2>
            <p>Tell us what went wrong</p>
          </SectionTitle>

          <FormGroup>
            <Label htmlFor="title">Bug Title <Required>*</Required></Label>
            <Input
              type="text"
              id="title"
              placeholder="Brief description of the issue"
              {...register('title', { required: 'Bug title is required' })}
            />
            {errors.title && <ErrorMessage>{errors.title.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="featureArea">Feature Area <Required>*</Required></Label>
            <Select
              id="featureArea"
              {...register('featureArea', { required: 'Feature area is required' })}
            >
              <option value="">Select a feature area</option>
              <option value="professionalMode">Professional Mode</option>
              <option value="anonymousMode">Anonymous Mode</option>
              <option value="verification">Verification System</option>
              <option value="jobBoard">Job Board</option>
              <option value="mentorship">Mentorship</option>
              <option value="supportGroups">Support Groups</option>
              <option value="skillGap">Skill Gap Analysis</option>
              <option value="negotiation">Negotiation Tools</option>
              <option value="security">Security & Privacy</option>
              <option value="modeSwitch">Mode Switching</option>
              <option value="reporting">Reporting System</option>
              <option value="onboarding">Onboarding</option>
              <option value="other">Other</option>
            </Select>
            {errors.featureArea && <ErrorMessage>{errors.featureArea.message}</ErrorMessage>}
          </FormGroup>

          <Row>
            <HalfWidth>
              <FormGroup>
                <Label htmlFor="severity">Severity <Required>*</Required></Label>
                <SeverityOptions>
                  <SeverityOption selected={watchSeverity === 'low'}>
                    <input
                      type="radio"
                      id="severityLow"
                      value="low"
                      {...register('severity', { required: 'Severity is required' })}
                    />
                    <SeverityLabel htmlFor="severityLow" severity="low">
                      <FaInfo /> Low
                    </SeverityLabel>
                  </SeverityOption>
                  
                  <SeverityOption selected={watchSeverity === 'medium'}>
                    <input
                      type="radio"
                      id="severityMedium"
                      value="medium"
                      {...register('severity')}
                    />
                    <SeverityLabel htmlFor="severityMedium" severity="medium">
                      <FaExclamationTriangle /> Medium
                    </SeverityLabel>
                  </SeverityOption>
                  
                  <SeverityOption selected={watchSeverity === 'high'}>
                    <input
                      type="radio"
                      id="severityHigh"
                      value="high"
                      {...register('severity')}
                    />
                    <SeverityLabel htmlFor="severityHigh" severity="high">
                      <FaExclamationTriangle /> High
                    </SeverityLabel>
                  </SeverityOption>
                  
                  <SeverityOption selected={watchSeverity === 'critical'}>
                    <input
                      type="radio"
                      id="severityCritical"
                      value="critical"
                      {...register('severity')}
                    />
                    <SeverityLabel htmlFor="severityCritical" severity="critical">
                      <FaExclamationTriangle /> Critical
                    </SeverityLabel>
                  </SeverityOption>
                </SeverityOptions>
                {errors.severity && <ErrorMessage>{errors.severity.message}</ErrorMessage>}
              </FormGroup>
            </HalfWidth>
            
            <HalfWidth>
              <FormGroup>
                <Label htmlFor="reproducibility">Reproducibility <Required>*</Required></Label>
                <Select
                  id="reproducibility"
                  {...register('reproducibility', { required: 'Reproducibility is required' })}
                >
                  <option value="">How often does this happen?</option>
                  <option value="always">Always (100%)</option>
                  <option value="sometimes">Sometimes (50-99%)</option>
                  <option value="rarely">Rarely (1-49%)</option>
                  <option value="once">Once (Happened only once)</option>
                </Select>
                {errors.reproducibility && <ErrorMessage>{errors.reproducibility.message}</ErrorMessage>}
              </FormGroup>
            </HalfWidth>
          </Row>

          <FormGroup>
            <Label htmlFor="description">Detailed Description <Required>*</Required></Label>
            <Textarea
              id="description"
              rows="5"
              placeholder="Please provide a detailed description of the issue..."
              {...register('description', { required: 'Description is required' })}
            ></Textarea>
            {errors.description && <ErrorMessage>{errors.description.message}</ErrorMessage>}
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>
            <h2>Reproduction Steps</h2>
            <p>Help us reproduce the issue by listing the steps</p>
          </SectionTitle>

          {steps.map((step, index) => (
            <StepRow key={index}>
              <StepNumber>{step.stepNumber}</StepNumber>
              <StepInput
                type="text"
                placeholder={`Step ${step.stepNumber}: What did you do?`}
                value={step.description}
                onChange={(e) => handleStepChange(index, e.target.value)}
              />
              <StepButton type="button" onClick={() => removeStep(index)} disabled={steps.length === 1}>
                <FaTrash />
              </StepButton>
            </StepRow>
          ))}

          <AddStepButton type="button" onClick={addStep}>
            + Add Step
          </AddStepButton>

          <FormGroup style={{ marginTop: '1.5rem' }}>
            <Label htmlFor="expectedBehavior">Expected Behavior</Label>
            <Textarea
              id="expectedBehavior"
              rows="3"
              placeholder="What did you expect to happen?"
              {...register('expectedBehavior')}
            ></Textarea>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="actualBehavior">Actual Behavior <Required>*</Required></Label>
            <Textarea
              id="actualBehavior"
              rows="3"
              placeholder="What actually happened?"
              {...register('actualBehavior', { required: 'Actual behavior is required' })}
            ></Textarea>
            {errors.actualBehavior && <ErrorMessage>{errors.actualBehavior.message}</ErrorMessage>}
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>
            <h2>Visual Evidence</h2>
            <p>Add screenshots to help us understand the issue</p>
          </SectionTitle>

          <ScreenshotUpload>
            <ScreenshotLabel htmlFor="screenshots">
              <FaCamera size={20} />
              <span>Add Screenshots</span>
            </ScreenshotLabel>
            <ScreenshotInput
              type="file"
              id="screenshots"
              accept="image/*"
              multiple
              onChange={handleScreenshotUpload}
            />
          </ScreenshotUpload>

          {screenshots.length > 0 && (
            <ScreenshotGrid>
              {screenshots.map((screenshot, index) => (
                <ScreenshotItem key={index}>
                  <ScreenshotImage src={screenshot.url} alt={`Screenshot ${index + 1}`} />
                  <ScreenshotControls>
                    <ScreenshotDescription
                      type="text"
                      placeholder="What does this show?"
                      value={screenshot.description}
                      onChange={(e) => updateScreenshotDescription(index, e.target.value)}
                    />
                    <ScreenshotRemove type="button" onClick={() => removeScreenshot(index)}>
                      <FaTrash />
                    </ScreenshotRemove>
                  </ScreenshotControls>
                </ScreenshotItem>
              ))}
            </ScreenshotGrid>
          )}

          <FormGroup>
            <Label htmlFor="consoleErrors">Console Errors</Label>
            <Textarea
              id="consoleErrors"
              rows="3"
              placeholder="Paste any errors from the browser console here (F12 > Console)"
              {...register('consoleErrors')}
            ></Textarea>
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>
            <h2>Environment Information</h2>
            <p>Details about your device and browser</p>
          </SectionTitle>

          <DeviceInfoButton type="button" onClick={getDeviceInfo}>
            <FaDesktop /> Detect My Device Info
          </DeviceInfoButton>

          <Row>
            <HalfWidth>
              <FormGroup>
                <Label htmlFor="deviceType">Device Type</Label>
                <Input
                  type="text"
                  id="deviceType"
                  placeholder="Desktop, Mobile, Tablet..."
                  {...register('deviceInfo.deviceType')}
                />
              </FormGroup>
            </HalfWidth>
            
            <HalfWidth>
              <FormGroup>
                <Label htmlFor="browser">Browser</Label>
                <Input
                  type="text"
                  id="browser"
                  placeholder="Chrome, Firefox, Safari..."
                  {...register('deviceInfo.browser')}
                />
              </FormGroup>
            </HalfWidth>
          </Row>

          <Row>
            <HalfWidth>
              <FormGroup>
                <Label htmlFor="operatingSystem">Operating System</Label>
                <Input
                  type="text"
                  id="operatingSystem"
                  placeholder="Windows, MacOS, Android..."
                  {...register('deviceInfo.operatingSystem')}
                />
              </FormGroup>
            </HalfWidth>
            
            <HalfWidth>
              <FormGroup>
                <Label htmlFor="screenResolution">Screen Resolution</Label>
                <Input
                  type="text"
                  id="screenResolution"
                  placeholder="1920x1080"
                  {...register('deviceInfo.screenResolution')}
                />
              </FormGroup>
            </HalfWidth>
          </Row>

          <FormGroup>
            <Label htmlFor="otherDetails">Other Details</Label>
            <Textarea
              id="otherDetails"
              rows="2"
              placeholder="Any other relevant information about your device or environment"
              {...register('deviceInfo.otherDetails')}
            ></Textarea>
          </FormGroup>
        </Section>

        <SubmitButtonContainer>
          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
          </SubmitButton>
        </SubmitButtonContainer>
      </Form>
    </FormContainer>
  );
};

// Styled Components
const FormContainer = styled.div`
  max-width: 900px;
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  p {
    color: #6c757d;
    font-size: 1rem;
  }
`;

const BugIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--soft-pink);
  color: var(--primary-purple);
  margin: 0 auto 1rem;
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

const Required = styled.span`
  color: #dc3545;
  margin-left: 0.25rem;
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

const Textarea = styled.textarea`
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

const Row = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
`;

const HalfWidth = styled.div`
  flex: 1;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SeverityOptions = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 576px) {
    flex-wrap: wrap;
  }
`;

const SeverityOption = styled.div`
  flex: 1;
  
  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  @media (max-width: 576px) {
    flex: 0 0 calc(50% - 0.25rem);
  }
`;

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'low':
      return '#28a745';
    case 'medium':
      return '#ffc107';
    case 'high':
      return '#fd7e14';
    case 'critical':
      return '#dc3545';
    default:
      return '#6c757d';
  }
};

const SeverityLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  background-color: ${props => props.selected ? getSeverityColor(props.severity) + '20' : '#f8f9fa'};
  border: 2px solid ${props => getSeverityColor(props.severity)};
  color: ${props => getSeverityColor(props.severity)};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  
  &:hover {
    background-color: ${props => getSeverityColor(props.severity) + '30'};
  }
`;

const StepRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const StepNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: var(--primary-purple);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
`;

const StepInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  
  &:focus {
    border-color: var(--primary-purple);
    outline: none;
    box-shadow: 0 0 0 3px rgba(139, 95, 191, 0.1);
  }
`;

const StepButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  background-color: ${props => props.disabled ? '#e9ecef' : '#f8d7da'};
  color: ${props => props.disabled ? '#adb5bd' : '#dc3545'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.15s ease-in-out;
  
  &:hover:not(:disabled) {
    background-color: #f5c2c7;
  }
`;

const AddStepButton = styled.button`
  display: block;
  margin-left: 2rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background-color: #e3f2fd;
  color: #0d6efd;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  
  &:hover {
    background-color: #cfe2ff;
  }
`;

const ScreenshotUpload = styled.div`
  margin-bottom: 1.5rem;
`;

const ScreenshotLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  background-color: #e9ecef;
  color: #495057;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  
  &:hover {
    background-color: #dee2e6;
  }
`;

const ScreenshotInput = styled.input`
  display: none;
`;

const ScreenshotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ScreenshotItem = styled.div`
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

const ScreenshotImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
`;

const ScreenshotControls = styled.div`
  display: flex;
  border-top: 1px solid #e9ecef;
`;

const ScreenshotDescription = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: none;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
  }
`;

const ScreenshotRemove = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  background-color: transparent;
  border: none;
  border-left: 1px solid #e9ecef;
  color: #dc3545;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  
  &:hover {
    background-color: #f8d7da;
  }
`;

const DeviceInfoButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 6px;
  background-color: #e3f2fd;
  color: #0d6efd;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  
  &:hover {
    background-color: #cfe2ff;
  }
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
  
  &:hover:not(:disabled) {
    background-color: #7b4fb0;
  }
  
  &:disabled {
    background-color: #a8a8a8;
    cursor: not-allowed;
  }
`;

export default BugReportForm; 