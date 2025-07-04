import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { submitFeedback } from '../../services/feedbackService';
import { useAuth } from '../../context/AuthContext';

const FeedbackContainer = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const FeedbackButton = styled(motion.button)`
  background-color: var(--primary-purple);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 15px rgba(139, 95, 191, 0.3);
  
  &:hover {
    background-color: #7d51af;
  }
  
  svg {
    margin-right: 8px;
  }
`;

const FeedbackForm = styled(motion.div)`
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  width: 350px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const FormTitle = styled.h3`
  margin: 0;
  color: var(--professional-navy);
  font-size: 1.1rem;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  
  &:hover {
    color: #666;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: var(--professional-navy);
  font-size: 0.9rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  font-size: 1rem;
  
  &:focus {
    border-color: var(--primary-purple);
    outline: none;
    box-shadow: 0 0 0 2px rgba(139, 95, 191, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    border-color: var(--primary-purple);
    outline: none;
    box-shadow: 0 0 0 2px rgba(139, 95, 191, 0.2);
  }
`;

const RatingContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const RatingButton = styled.button`
  background-color: ${props => props.selected ? 'var(--primary-purple)' : '#f3f3f3'};
  color: ${props => props.selected ? 'white' : 'var(--professional-navy)'};
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.selected ? 'var(--primary-purple)' : '#e0e0e0'};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: var(--primary-purple);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background-color: #7d51af;
  }
  
  &:disabled {
    background-color: #c4b7d9;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled(motion.div)`
  background-color: #27ae60;
  color: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
  font-weight: 500;
`;

const FeedbackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
    <path d="M12 15H14V13H12V15ZM12 11H14V7H12V11Z" fill="currentColor"/>
  </svg>
);

const FeedbackCollector = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [type, setType] = useState('general');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating || !message.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await submitFeedback({
        userId: user?._id,
        rating,
        type,
        message,
        email,
        source: window.location.pathname,
        metadata: {
          browser: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form
      setRating(0);
      setType('general');
      setMessage('');
      
      // Close form after success
      setTimeout(() => {
        setShowSuccess(false);
        setIsOpen(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <FeedbackContainer>
      <AnimatePresence>
        {showSuccess && (
          <SuccessMessage
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            Thank you for your feedback!
          </SuccessMessage>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isOpen && (
          <FeedbackForm
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <FormHeader>
              <FormTitle>Share your feedback</FormTitle>
              <CloseButton onClick={() => setIsOpen(false)}>&times;</CloseButton>
            </FormHeader>
            
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>How would you rate your experience?</Label>
                <RatingContainer>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <RatingButton 
                      key={value}
                      type="button"
                      selected={rating === value}
                      onClick={() => setRating(value)}
                    >
                      {value}
                    </RatingButton>
                  ))}
                </RatingContainer>
              </FormGroup>
              
              <FormGroup>
                <Label>Feedback type</Label>
                <Input 
                  as="select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="general">General Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="content">Content Feedback</option>
                  <option value="ux">User Experience</option>
                </Input>
              </FormGroup>
              
              <FormGroup>
                <Label>Your feedback</Label>
                <TextArea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you think or how we can improve..."
                  required
                />
              </FormGroup>
              
              {!user && (
                <FormGroup>
                  <Label>Email (optional)</Label>
                  <Input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email for follow-up"
                  />
                </FormGroup>
              )}
              
              <SubmitButton 
                type="submit" 
                disabled={isSubmitting || !rating || !message.trim()}
              >
                {isSubmitting ? 'Sending...' : 'Submit Feedback'}
              </SubmitButton>
            </form>
          </FeedbackForm>
        )}
      </AnimatePresence>
      
      <FeedbackButton
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FeedbackIcon />
        Feedback
      </FeedbackButton>
    </FeedbackContainer>
  );
};

export default FeedbackCollector; 