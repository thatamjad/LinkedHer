import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCamera, FaLinkedin } from 'react-icons/fa';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: var(--professional-navy);
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #667788;
  margin-bottom: 1.5rem;
`;

const ProfilePhotoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1rem;
`;

const PhotoUploadContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #f0f0f5;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 3px solid var(--primary-purple);
  
  &:hover {
    background-color: #e8e8f0;
  }
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UploadIcon = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: var(--primary-purple);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const PhotoInstructions = styled.div`
  flex: 1;
  
  h4 {
    color: var(--professional-navy);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #667788;
    font-size: 0.9rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: var(--professional-navy);
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 2px solid #dde1e7;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-purple);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 2px solid #dde1e7;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-purple);
  }
`;

const LinkedInButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: #0077b5;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #006097;
  }
`;

const HelpText = styled.p`
  font-size: 0.85rem;
  color: #667788;
  margin-top: 0.5rem;
`;

const ProfileSetupStep = ({ userData, updateUserData, setValid }) => {
  const [profileImage, setProfileImage] = useState(userData.profileImage || null);
  const [name, setName] = useState(userData.name || '');
  const [headline, setHeadline] = useState(userData.headline || '');
  const [bio, setBio] = useState(userData.bio || '');
  const [fileInput, setFileInput] = useState(null);
  
  useEffect(() => {
    // Update parent validation state
    const isValid = name.trim() !== '' && headline.trim() !== '';
    setValid(isValid);
    
    // Update parent state
    updateUserData({
      name,
      headline,
      bio,
      profileImage
    });
  }, [name, headline, bio, profileImage, updateUserData, setValid]);
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleLinkedInImport = () => {
    // This would normally integrate with LinkedIn API
    // For now, just show a placeholder function
    alert('LinkedIn import functionality would be implemented here.');
  };
  
  return (
    <Container>
      <div>
        <Title>Your Professional Profile</Title>
        <Subtitle>Let's create a profile that highlights your professional identity</Subtitle>
      </div>
      
      <ProfilePhotoSection>
        <PhotoUploadContainer 
          onClick={() => fileInput && fileInput.click()}
          as={motion.div}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          {profileImage ? (
            <ProfileImage src={profileImage} alt="Profile" />
          ) : (
            <FaCamera size={30} color="#8B5FBF" />
          )}
          <UploadIcon>
            <FaCamera size={16} />
          </UploadIcon>
          <input 
            type="file" 
            ref={ref => setFileInput(ref)}
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={handleImageUpload}
          />
        </PhotoUploadContainer>
        
        <PhotoInstructions>
          <h4>Profile Photo</h4>
          <p>Upload a professional photo that clearly shows your face. This helps build trust in our women-focused community.</p>
        </PhotoInstructions>
      </ProfilePhotoSection>
      
      <FormGroup>
        <Label htmlFor="name">Full Name*</Label>
        <Input 
          id="name"
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your professional name"
        />
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="headline">Professional Headline*</Label>
        <Input 
          id="headline"
          type="text" 
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="e.g. Senior Software Engineer at Google"
        />
        <HelpText>A brief headline that describes your current role or expertise</HelpText>
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="bio">Professional Bio</Label>
        <TextArea 
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Share your professional journey, achievements, and what you're passionate about..."
        />
        <HelpText>Highlight your expertise and what makes you unique (300 characters max)</HelpText>
      </FormGroup>
      
      <LinkedInButton 
        onClick={handleLinkedInImport}
        as={motion.button}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <FaLinkedin size={20} />
        Import from LinkedIn
      </LinkedInButton>
    </Container>
  );
};

export default ProfileSetupStep; 