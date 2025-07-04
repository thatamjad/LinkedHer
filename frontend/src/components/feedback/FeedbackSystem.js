import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRegSmile, FaRegMeh, FaRegFrown, FaTimes, FaPaperPlane, FaThumbsUp } from 'react-icons/fa';

const FeedbackContainer = styled.div`
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
  border-radius: 30px;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
`;

const FeedbackModal = styled(motion.div)`
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 350px;
  margin-bottom: 1rem;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  background-color: var(--primary-purple);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-weight: 600;
  font-size: 1.1rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  padding: 1.5rem;
`;

const SentimentSelector = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 1.5rem;
`;

const SentimentOption = styled.button`
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: ${props => props.selected ? 'var(--primary-purple)' : '#4a5568'};
  transform: ${props => props.selected ? 'scale(1.1)' : 'scale(1)'};
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--primary-purple);
  }
  
  svg {
    font-size: 2rem;
  }
  
  span {
    font-size: 0.8rem;
    font-weight: 500;
  }
`;

const FeedbackForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 2px solid #dde1e7;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: var(--primary-purple);
  }
`;

const CategorySelector = styled.select`
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 2px solid #dde1e7;
  
  &:focus {
    outline: none;
    border-color: var(--primary-purple);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4a5568;
  cursor: pointer;
`;

const SubmitButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: var(--primary-purple);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
  
  svg {
    color: var(--success-green);
    font-size: 3rem;
  }
  
  h4 {
    margin: 0;
    color: var(--professional-navy);
  }
  
  p {
    margin: 0;
    color: #667788;
  }
`;

const FeedbackSystem = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sentiment, setSentiment] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('general');
  const [contactConsent, setContactConsent] = useState(false);
  const [anonymousFeedback, setAnonymousFeedback] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleOpenFeedback = () => {
    setIsOpen(true);
  };
  
  const handleCloseFeedback = () => {
    setIsOpen(false);
    // Reset form after animation completes
    setTimeout(() => {
      if (!isOpen) {
        setSentiment(null);
        setFeedback('');
        setCategory('general');
        setContactConsent(false);
        setAnonymousFeedback(false);
        setSubmitted(false);
      }
    }, 300);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construct feedback data
    const feedbackData = {
      sentiment,
      feedback,
      category,
      contactConsent,
      anonymous: anonymousFeedback,
      timestamp: new Date().toISOString(),
      // Would normally include user ID if not anonymous
      userId: anonymousFeedback ? null : 'current-user-id',
      // Add browser and device info for technical issues
      userAgent: navigator.userAgent,
      // Include current page/feature for context
      currentPage: window.location.pathname,
    };
    
    // Here you would normally send the data to your backend
    console.log('Submitting feedback:', feedbackData);
    
    // Show success message
    setSubmitted(true);
    
    // Close feedback modal after delay
    setTimeout(() => {
      handleCloseFeedback();
    }, 3000);
  };
  
  return (
    <FeedbackContainer>
      <AnimatePresence>
        {isOpen && (
          <FeedbackModal
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <ModalHeader>
              <ModalTitle>Share Your Feedback</ModalTitle>
              <CloseButton onClick={handleCloseFeedback}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            
            <ModalContent>
              {!submitted ? (
                <>
                  <SentimentSelector>
                    <SentimentOption 
                      onClick={() => setSentiment('positive')}
                      selected={sentiment === 'positive'}
                    >
                      <FaRegSmile />
                      <span>Positive</span>
                    </SentimentOption>
                    
                    <SentimentOption 
                      onClick={() => setSentiment('neutral')}
                      selected={sentiment === 'neutral'}
                    >
                      <FaRegMeh />
                      <span>Neutral</span>
                    </SentimentOption>
                    
                    <SentimentOption 
                      onClick={() => setSentiment('negative')}
                      selected={sentiment === 'negative'}
                    >
                      <FaRegFrown />
                      <span>Negative</span>
                    </SentimentOption>
                  </SentimentSelector>
                  
                  <FeedbackForm onSubmit={handleSubmit}>
                    <CategorySelector 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="general">General Feedback</option>
                      <option value="ui">User Interface</option>
                      <option value="feature">Feature Request</option>
                      <option value="bug">Bug Report</option>
                      <option value="content">Content Quality</option>
                      <option value="community">Community Experience</option>
                      <option value="verification">Verification Process</option>
                      <option value="anonymous">Anonymous Mode</option>
                    </CategorySelector>
                    
                    <TextArea 
                      placeholder="Tell us what you think..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      required
                    />
                    
                    <CheckboxGroup>
                      <CheckboxLabel>
                        <input 
                          type="checkbox" 
                          checked={anonymousFeedback}
                          onChange={() => setAnonymousFeedback(!anonymousFeedback)}
                        />
                        Submit as anonymous feedback
                      </CheckboxLabel>
                      
                      <CheckboxLabel>
                        <input 
                          type="checkbox" 
                          checked={contactConsent}
                          onChange={() => setContactConsent(!contactConsent)}
                          disabled={anonymousFeedback}
                        />
                        {anonymousFeedback ? 
                          "Contact consent unavailable for anonymous feedback" : 
                          "It's okay to contact me about this feedback"
                        }
                      </CheckboxLabel>
                    </CheckboxGroup>
                    
                    <SubmitButton 
                      type="submit"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <FaPaperPlane />
                      Submit Feedback
                    </SubmitButton>
                  </FeedbackForm>
                </>
              ) : (
                <SuccessMessage
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <FaThumbsUp />
                  <h4>Thank You For Your Feedback!</h4>
                  <p>Your input helps us improve Linker for all women professionals.</p>
                </SuccessMessage>
              )}
            </ModalContent>
          </FeedbackModal>
        )}
      </AnimatePresence>
      
      <FeedbackButton 
        onClick={handleOpenFeedback}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaRegSmile />
        Share Feedback
      </FeedbackButton>
    </FeedbackContainer>
  );
};

export default FeedbackSystem; 