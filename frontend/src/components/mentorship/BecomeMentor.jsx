import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Checkbox,
  CheckboxGroup,
  Stack,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  VStack,
  SimpleGrid,
  FormHelperText,
  useToast,
  Divider,
  Icon,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { 
  FaUserTie, 
  FaGraduationCap, 
  FaBriefcase, 
  FaUsers, 
  FaCalendarAlt,
  FaGlobe,
  FaCheck,
  FaInfoCircle
} from 'react-icons/fa';

const BecomeMentor = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    isActive: true,
    biography: '',
    specializations: [],
    mentorshipStyle: 'situational',
    expertise: [{ name: '', yearsExperience: 1, proficiencyLevel: 'intermediate' }],
    availability: {
      maxMentees: 3,
      schedule: [{ day: '', startTime: '', endTime: '' }],
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    preferredMenteeLevel: ['any'],
    industries: [],
    languages: [{ name: 'English', proficiency: 'intermediate' }]
  });
  
  const [specialization, setSpecialization] = useState('');
  const [industry, setIndustry] = useState('');
  
  useEffect(() => {
    checkMentorStatus();
  }, []);
  
  const checkMentorStatus = async () => {
    try {
      setLoading(true);
      // Get user profile to check if user exists
      const profileResponse = await axios.get('/api/users/profile');
      setUser(profileResponse.data);
      
      try {
        // Check if user already has a mentor profile
        const mentorResponse = await axios.get(`/api/mentorship/mentor-profile/${profileResponse.data._id}`);
        // If successful, user is already a mentor - redirect to dashboard
        toast({
          title: 'You are already a mentor',
          description: 'Redirecting to your mentor dashboard',
          status: 'info',
          duration: 3000,
          isClosable: true
        });
        navigate('/mentorship/dashboard');
      } catch (err) {
        // If error, user is not a mentor - continue with form
        setLoading(false);
      }
    } catch (err) {
      toast({
        title: 'Authentication error',
        description: 'Please sign in to become a mentor',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      navigate('/login', { state: { from: '/mentorship/become-mentor' } });
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleNestedChange = (category, field, value) => {
    setFormData({
      ...formData,
      [category]: {
        ...formData[category],
        [field]: value
      }
    });
  };
  
  const handleArrayItemChange = (arrayName, index, field, value) => {
    const updatedArray = [...formData[arrayName]];
    updatedArray[index] = {
      ...updatedArray[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      [arrayName]: updatedArray
    });
  };
  
  const handleScheduleChange = (index, field, value) => {
    const updatedSchedule = [...formData.availability.schedule];
    updatedSchedule[index] = {
      ...updatedSchedule[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        schedule: updatedSchedule
      }
    });
  };
  
  const addExpertise = () => {
    setFormData({
      ...formData,
      expertise: [
        ...formData.expertise,
        { name: '', yearsExperience: 1, proficiencyLevel: 'intermediate' }
      ]
    });
  };
  
  const removeExpertise = (index) => {
    const updatedExpertise = [...formData.expertise];
    updatedExpertise.splice(index, 1);
    setFormData({
      ...formData,
      expertise: updatedExpertise
    });
  };
  
  const addScheduleSlot = () => {
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        schedule: [
          ...formData.availability.schedule,
          { day: '', startTime: '', endTime: '' }
        ]
      }
    });
  };
  
  const removeScheduleSlot = (index) => {
    const updatedSchedule = [...formData.availability.schedule];
    updatedSchedule.splice(index, 1);
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        schedule: updatedSchedule
      }
    });
  };
  
  const addLanguage = () => {
    setFormData({
      ...formData,
      languages: [
        ...formData.languages,
        { name: '', proficiency: 'intermediate' }
      ]
    });
  };
  
  const removeLanguage = (index) => {
    const updatedLanguages = [...formData.languages];
    updatedLanguages.splice(index, 1);
    setFormData({
      ...formData,
      languages: updatedLanguages
    });
  };
  
  const addSpecialization = () => {
    if (specialization && !formData.specializations.includes(specialization)) {
      setFormData({
        ...formData,
        specializations: [...formData.specializations, specialization]
      });
      setSpecialization('');
    }
  };
  
  const removeSpecialization = (item) => {
    setFormData({
      ...formData,
      specializations: formData.specializations.filter(i => i !== item)
    });
  };
  
  const addIndustry = () => {
    if (industry && !formData.industries.includes(industry)) {
      setFormData({
        ...formData,
        industries: [...formData.industries, industry]
      });
      setIndustry('');
    }
  };
  
  const removeIndustry = (item) => {
    setFormData({
      ...formData,
      industries: formData.industries.filter(i => i !== item)
    });
  };
  
  const handlePreferredMenteeLevelChange = (selected) => {
    setFormData({
      ...formData,
      preferredMenteeLevel: selected
    });
  };
  
  const validateForm = () => {
    // Check required fields
    if (!formData.biography) {
      toast({
        title: 'Missing information',
        description: 'Please provide a biography',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return false;
    }
    
    if (formData.specializations.length === 0) {
      toast({
        title: 'Missing information',
        description: 'Please add at least one specialization',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return false;
    }
    
    // Validate expertise
    for (const exp of formData.expertise) {
      if (!exp.name) {
        toast({
          title: 'Missing information',
          description: 'Please fill in all expertise fields',
          status: 'warning',
          duration: 3000,
          isClosable: true
        });
        return false;
      }
    }
    
    // Validate schedule
    for (const slot of formData.availability.schedule) {
      if (!slot.day || !slot.startTime || !slot.endTime) {
        toast({
          title: 'Missing information',
          description: 'Please fill in all schedule fields or remove empty slots',
          status: 'warning',
          duration: 3000,
          isClosable: true
        });
        return false;
      }
    }
    
    // Validate languages
    for (const lang of formData.languages) {
      if (!lang.name) {
        toast({
          title: 'Missing information',
          description: 'Please fill in all language fields',
          status: 'warning',
          duration: 3000,
          isClosable: true
        });
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await axios.post('/api/mentorship/mentor-profile', formData);
      
      toast({
        title: 'Success',
        description: 'Your mentor profile has been created!',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      navigate('/mentorship/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create mentor profile';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={4} align="center">
          <Heading>Loading...</Heading>
          <Text>Please wait while we check your profile.</Text>
        </VStack>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center" mb={8}>
          <Heading as="h1" size="xl" mb={4}>
            Become a Mentor
          </Heading>
          <Text fontSize="lg">
            Share your experience and help other women advance in their careers
          </Text>
        </Box>
        
        <Alert status="info" borderRadius="md" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>Why become a mentor?</AlertTitle>
            <AlertDescription>
              Mentoring helps you develop leadership skills, expand your network, and make a meaningful impact in other women's careers.
            </AlertDescription>
          </Box>
        </Alert>
        
        <form onSubmit={handleSubmit}>
          <Tabs colorScheme="purple" isFitted variant="enclosed">
            <TabList mb="1em">
              <Tab><Icon as={FaUserTie} mr={2} /> Profile</Tab>
              <Tab><Icon as={FaBriefcase} mr={2} /> Expertise</Tab>
              <Tab><Icon as={FaCalendarAlt} mr={2} /> Availability</Tab>
              <Tab><Icon as={FaUsers} mr={2} /> Preferences</Tab>
            </TabList>
            
            <TabPanels>
              {/* Profile Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Professional Biography</FormLabel>
                    <Textarea
                      name="biography"
                      value={formData.biography}
                      onChange={handleChange}
                      placeholder="Tell potential mentees about your professional background, experience, and approach to mentoring..."
                      rows={6}
                    />
                    <FormHelperText>
                      This will be visible to potential mentees (500-1000 characters recommended)
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Specializations</FormLabel>
                    <HStack>
                      <Select
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="Select or type a specialization"
                      >
                        <option value="career_advancement">Career Advancement</option>
                        <option value="leadership">Leadership</option>
                        <option value="technical_skills">Technical Skills</option>
                        <option value="work_life_balance">Work-Life Balance</option>
                        <option value="networking">Networking</option>
                        <option value="communication">Communication</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="industry_specific">Industry Specific</option>
                        <option value="entrepreneurship">Entrepreneurship</option>
                        <option value="personal_development">Personal Development</option>
                      </Select>
                      <Button onClick={addSpecialization}>Add</Button>
                    </HStack>
                    <FormHelperText>
                      Select the areas where you can provide the most value
                    </FormHelperText>
                    
                    <Box mt={3}>
                      {formData.specializations.length === 0 ? (
                        <Text fontSize="sm" color="gray.500">No specializations added yet</Text>
                      ) : (
                        <Flex wrap="wrap" gap={2}>
                          {formData.specializations.map((item, index) => (
                            <Tag key={index} size="md" colorScheme="purple" borderRadius="full">
                              <TagLabel>{item}</TagLabel>
                              <TagCloseButton onClick={() => removeSpecialization(item)} />
                            </Tag>
                          ))}
                        </Flex>
                      )}
                    </Box>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Mentorship Style</FormLabel>
                    <Select
                      name="mentorshipStyle"
                      value={formData.mentorshipStyle}
                      onChange={handleChange}
                    >
                      <option value="directive">Directive (I provide specific advice and guidance)</option>
                      <option value="non_directive">Non-directive (I ask questions to help mentees find their own answers)</option>
                      <option value="situational">Situational (I adapt my approach based on needs)</option>
                      <option value="transformational">Transformational (I focus on inspiring significant change)</option>
                      <option value="developmental">Developmental (I focus on long-term growth and skills)</option>
                    </Select>
                    <FormHelperText>
                      Choose the style that best represents how you prefer to mentor
                    </FormHelperText>
                  </FormControl>
                </VStack>
              </TabPanel>
              
              {/* Expertise Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Flex justify="space-between" align="center" mb={3}>
                      <Heading as="h3" size="md">
                        Areas of Expertise
                      </Heading>
                      <Button 
                        size="sm" 
                        colorScheme="purple" 
                        variant="outline"
                        onClick={addExpertise}
                      >
                        Add Another
                      </Button>
                    </Flex>
                    
                    <VStack spacing={4} align="stretch" mb={6}>
                      {formData.expertise.map((exp, index) => (
                        <Box 
                          key={index} 
                          p={4} 
                          borderWidth="1px" 
                          borderRadius="md"
                          position="relative"
                        >
                          {index > 0 && (
                            <Button
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              position="absolute"
                              top={2}
                              right={2}
                              onClick={() => removeExpertise(index)}
                            >
                              Remove
                            </Button>
                          )}
                          
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl isRequired>
                              <FormLabel>Expertise Area</FormLabel>
                              <Input
                                value={exp.name}
                                onChange={(e) => handleArrayItemChange('expertise', index, 'name', e.target.value)}
                                placeholder="e.g., Frontend Development"
                              />
                            </FormControl>
                            
                            <FormControl isRequired>
                              <FormLabel>Years of Experience</FormLabel>
                              <NumberInput
                                min={1}
                                max={50}
                                value={exp.yearsExperience}
                                onChange={(value) => handleArrayItemChange('expertise', index, 'yearsExperience', parseInt(value))}
                              >
                                <NumberInputField />
                                <NumberInputStepper>
                                  <NumberIncrementStepper />
                                  <NumberDecrementStepper />
                                </NumberInputStepper>
                              </NumberInput>
                            </FormControl>
                          </SimpleGrid>
                          
                          <FormControl mt={4}>
                            <FormLabel>Proficiency Level</FormLabel>
                            <Select
                              value={exp.proficiencyLevel}
                              onChange={(e) => handleArrayItemChange('expertise', index, 'proficiencyLevel', e.target.value)}
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                              <option value="expert">Expert</option>
                            </Select>
                          </FormControl>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                  
                  <Divider />
                  
                  <FormControl>
                    <FormLabel>Industries</FormLabel>
                    <HStack>
                      <Input
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="Enter an industry"
                      />
                      <Button onClick={addIndustry}>Add</Button>
                    </HStack>
                    <FormHelperText>
                      Add industries you have experience in
                    </FormHelperText>
                    
                    <Box mt={3}>
                      {formData.industries.length === 0 ? (
                        <Text fontSize="sm" color="gray.500">No industries added yet</Text>
                      ) : (
                        <Flex wrap="wrap" gap={2}>
                          {formData.industries.map((item, index) => (
                            <Tag key={index} size="md" colorScheme="blue" borderRadius="full">
                              <TagLabel>{item}</TagLabel>
                              <TagCloseButton onClick={() => removeIndustry(item)} />
                            </Tag>
                          ))}
                        </Flex>
                      )}
                    </Box>
                  </FormControl>
                  
                  <Box>
                    <Flex justify="space-between" align="center" mb={3}>
                      <FormLabel mb={0}>Languages</FormLabel>
                      <Button 
                        size="sm" 
                        colorScheme="purple" 
                        variant="outline"
                        onClick={addLanguage}
                      >
                        Add Language
                      </Button>
                    </Flex>
                    
                    <VStack spacing={3} align="stretch">
                      {formData.languages.map((lang, index) => (
                        <Flex key={index} gap={3} align="flex-end">
                          <FormControl isRequired>
                            <FormLabel>Language</FormLabel>
                            <Input
                              value={lang.name}
                              onChange={(e) => handleArrayItemChange('languages', index, 'name', e.target.value)}
                              placeholder="e.g., English"
                            />
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>Proficiency</FormLabel>
                            <Select
                              value={lang.proficiency}
                              onChange={(e) => handleArrayItemChange('languages', index, 'proficiency', e.target.value)}
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                              <option value="native">Native</option>
                            </Select>
                          </FormControl>
                          
                          {index > 0 && (
                            <Button 
                              colorScheme="red" 
                              variant="ghost"
                              onClick={() => removeLanguage(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </Flex>
                      ))}
                    </VStack>
                  </Box>
                </VStack>
              </TabPanel>
              
              {/* Availability Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <FormLabel>Maximum Number of Mentees</FormLabel>
                    <NumberInput
                      min={1}
                      max={10}
                      value={formData.availability.maxMentees}
                      onChange={(value) => handleNestedChange('availability', 'maxMentees', parseInt(value))}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText>
                      How many mentees can you effectively mentor at once?
                    </FormHelperText>
                  </FormControl>
                  
                  <Box>
                    <Flex justify="space-between" align="center" mb={3}>
                      <FormLabel mb={0}>Availability Schedule</FormLabel>
                      <Button 
                        size="sm" 
                        colorScheme="purple" 
                        variant="outline"
                        onClick={addScheduleSlot}
                      >
                        Add Time Slot
                      </Button>
                    </Flex>
                    
                    <VStack spacing={4} align="stretch">
                      {formData.availability.schedule.map((slot, index) => (
                        <Box 
                          key={index} 
                          p={4} 
                          borderWidth="1px" 
                          borderRadius="md"
                        >
                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                            <FormControl isRequired>
                              <FormLabel>Day</FormLabel>
                              <Select
                                value={slot.day}
                                onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                                placeholder="Select day"
                              >
                                <option value="monday">Monday</option>
                                <option value="tuesday">Tuesday</option>
                                <option value="wednesday">Wednesday</option>
                                <option value="thursday">Thursday</option>
                                <option value="friday">Friday</option>
                                <option value="saturday">Saturday</option>
                                <option value="sunday">Sunday</option>
                              </Select>
                            </FormControl>
                            
                            <FormControl isRequired>
                              <FormLabel>Start Time</FormLabel>
                              <Input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                              />
                            </FormControl>
                            
                            <FormControl isRequired>
                              <FormLabel>End Time</FormLabel>
                              <Input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                              />
                            </FormControl>
                          </SimpleGrid>
                          
                          {index > 0 && (
                            <Button
                              mt={3}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => removeScheduleSlot(index)}
                            >
                              Remove Slot
                            </Button>
                          )}
                        </Box>
                      ))}
                    </VStack>
                    <FormHelperText>
                      Add your regular availability for mentoring sessions
                    </FormHelperText>
                  </Box>
                  
                  <FormControl>
                    <FormLabel>Time Zone</FormLabel>
                    <Select
                      value={formData.availability.timeZone}
                      onChange={(e) => handleNestedChange('availability', 'timeZone', e.target.value)}
                    >
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">British Time (GMT/BST)</option>
                      <option value="Europe/Paris">Central European Time (CET/CEST)</option>
                      <option value="Asia/Kolkata">India Standard Time (IST)</option>
                      <option value="Asia/Singapore">Singapore Time (SGT)</option>
                      <option value="Australia/Sydney">Australian Eastern Time (AEST/AEDT)</option>
                    </Select>
                    <FormHelperText>
                      Your local time zone for scheduling meetings
                    </FormHelperText>
                  </FormControl>
                </VStack>
              </TabPanel>
              
              {/* Preferences Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <FormLabel>Preferred Mentee Experience Level</FormLabel>
                    <CheckboxGroup
                      colorScheme="purple"
                      value={formData.preferredMenteeLevel}
                      onChange={handlePreferredMenteeLevelChange}
                    >
                      <Stack spacing={2} direction="column">
                        <Checkbox value="entry_level">Entry Level (0-2 years)</Checkbox>
                        <Checkbox value="mid_level">Mid Level (3-5 years)</Checkbox>
                        <Checkbox value="senior_level">Senior Level (6+ years)</Checkbox>
                        <Checkbox value="executive">Executive Level</Checkbox>
                        <Checkbox value="any">Any Experience Level</Checkbox>
                      </Stack>
                    </CheckboxGroup>
                    <FormHelperText>
                      Select all that apply. This helps match you with appropriate mentees.
                    </FormHelperText>
                  </FormControl>
                  
                  <Divider />
                  
                  <FormControl>
                    <FormLabel mb={4}>Mentor Profile Status</FormLabel>
                    <Checkbox
                      isChecked={formData.isActive}
                      onChange={(e) => setFormData({
                        ...formData,
                        isActive: e.target.checked
                      })}
                      colorScheme="green"
                      size="lg"
                    >
                      <Text fontWeight="bold">Profile Active</Text>
                    </Checkbox>
                    <FormHelperText>
                      When active, your profile will be visible to potential mentees. You can change this later.
                    </FormHelperText>
                  </FormControl>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
          
          <Box mt={8}>
            <Button
              type="submit"
              colorScheme="purple"
              size="lg"
              width="full"
              isLoading={isSubmitting}
              loadingText="Submitting"
            >
              Create Mentor Profile
            </Button>
          </Box>
        </form>
      </VStack>
    </Container>
  );
};

export default BecomeMentor; 