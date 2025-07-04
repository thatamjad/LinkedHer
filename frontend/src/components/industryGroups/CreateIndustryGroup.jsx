import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  VStack,
  FormHelperText,
  useToast,
  Text,
  Flex,
  Divider,
  Switch,
  Badge,
  Icon,
  useColorModeValue,
  Image
} from '@chakra-ui/react';
import { FaImage, FaPlus, FaTimes } from 'react-icons/fa';

const CreateIndustryGroup = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    focusAreas: [],
    bannerImage: ''
  });

  const [focusArea, setFocusArea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const cardBg = useColorModeValue('white', 'gray.800');
  const dndBg = useColorModeValue('gray.50', 'gray.700');

  const industryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'retail', label: 'Retail' },
    { value: 'legal', label: 'Legal' },
    { value: 'media', label: 'Media & Communications' },
    { value: 'nonprofit', label: 'Non-Profit' },
    { value: 'government', label: 'Government' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'science', label: 'Science & Research' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddFocusArea = () => {
    if (!focusArea.trim()) return;
    
    if (formData.focusAreas.includes(focusArea.trim())) {
      toast({
        title: 'Duplicate focus area',
        description: 'This focus area already exists',
        status: 'warning',
        duration: 2000,
        isClosable: true
      });
      return;
    }
    
    if (formData.focusAreas.length >= 10) {
      toast({
        title: 'Maximum focus areas reached',
        description: 'You can add up to 10 focus areas',
        status: 'warning',
        duration: 2000,
        isClosable: true
      });
      return;
    }
    
    setFormData({
      ...formData,
      focusAreas: [...formData.focusAreas, focusArea.trim()]
    });
    setFocusArea('');
  };

  const handleRemoveFocusArea = (areaToRemove) => {
    setFormData({
      ...formData,
      focusAreas: formData.focusAreas.filter(area => area !== areaToRemove)
    });
  };

  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // For demo purposes, we'll just use a local preview
    // In a real app, you would upload this to a server
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setFormData({
        ...formData,
        bannerImage: e.target.result // In a real app, this would be the URL from your server
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBannerImage = () => {
    setImagePreview('');
    setFormData({
      ...formData,
      bannerImage: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: 'Group name required',
        description: 'Please provide a name for your industry group',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    if (!formData.description.trim()) {
      toast({
        title: 'Description required',
        description: 'Please provide a description for your industry group',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    if (!formData.industry) {
      toast({
        title: 'Industry required',
        description: 'Please select an industry for your group',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    if (formData.focusAreas.length === 0) {
      toast({
        title: 'Focus areas required',
        description: 'Please add at least one focus area for your industry group',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await axios.post('/api/industry-groups', formData);
      
      toast({
        title: 'Industry group created',
        description: 'Your industry group has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      // Navigate to the new group
      navigate(`/industry-groups/${response.data._id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create industry group',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Box 
        bg={cardBg}
        p={8}
        borderRadius="lg"
        boxShadow="md"
        mb={8}
      >
        <Heading as="h1" size="xl" mb={6} textAlign="center">
          Create Industry Group
        </Heading>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel>Group Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter industry group name"
              />
              <FormHelperText>
                Choose a descriptive name that clearly identifies your industry group
              </FormHelperText>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the purpose and goals of this industry group"
                rows={4}
              />
              <FormHelperText>
                Explain what this group offers to members and what kind of professionals should join
              </FormHelperText>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Industry</FormLabel>
              <Select
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                placeholder="Select an industry"
              >
                {industryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <FormHelperText>
                Choose the primary industry this group represents
              </FormHelperText>
            </FormControl>
            
            <FormControl>
              <FormLabel>Focus Areas</FormLabel>
              <HStack>
                <Input
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  placeholder="Add specific focus areas within your industry"
                />
                <Button 
                  onClick={handleAddFocusArea}
                  colorScheme="blue"
                >
                  Add
                </Button>
              </HStack>
              <FormHelperText>
                Add specific areas of focus within your industry (e.g., "Cloud Computing" for Technology)
              </FormHelperText>
              
              <Box mt={3}>
                {formData.focusAreas.length > 0 ? (
                  <Flex flexWrap="wrap" gap={2}>
                    {formData.focusAreas.map((area, index) => (
                      <Tag key={index} size="md" colorScheme="blue" borderRadius="full">
                        <TagLabel>{area}</TagLabel>
                        <TagCloseButton onClick={() => handleRemoveFocusArea(area)} />
                      </Tag>
                    ))}
                  </Flex>
                ) : (
                  <Text fontSize="sm" color="gray.500">No focus areas added yet</Text>
                )}
              </Box>
            </FormControl>
            
            <Divider />
            
            <FormControl>
              <FormLabel>Banner Image</FormLabel>
              
              {!imagePreview ? (
                                 <Box
                   borderWidth="2px"
                   borderStyle="dashed"
                   borderRadius="md"
                   p={6}
                   textAlign="center"
                   bg={dndBg}
                 >
                  <input
                    type="file"
                    id="banner-image"
                    accept="image/*"
                    onChange={handleBannerImageChange}
                    style={{ display: 'none' }}
                  />
                  <Icon as={FaImage} boxSize={10} color="gray.400" mb={2} />
                  <Text mb={4}>Upload a banner image for your group</Text>
                  <Button
                    as="label"
                    htmlFor="banner-image"
                    colorScheme="blue"
                    variant="outline"
                    cursor="pointer"
                  >
                    Select Image
                  </Button>
                </Box>
              ) : (
                <Box position="relative">
                  <Image
                    src={imagePreview}
                    alt="Banner preview"
                    borderRadius="md"
                    maxH="200px"
                    w="100%"
                    objectFit="cover"
                  />
                  <Button
                    position="absolute"
                    top={2}
                    right={2}
                    colorScheme="red"
                    size="sm"
                    onClick={handleRemoveBannerImage}
                    leftIcon={<FaTimes />}
                  >
                    Remove
                  </Button>
                </Box>
              )}
              <FormHelperText>
                Choose a banner image that represents your industry (recommended size: 1200x300px)
              </FormHelperText>
            </FormControl>
            
            <Divider />
            
            <Flex justify="space-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/industry-groups')}
              >
                Cancel
              </Button>
              <Button 
                colorScheme="blue" 
                type="submit"
                isLoading={isSubmitting}
                loadingText="Creating..."
              >
                Create Industry Group
              </Button>
            </Flex>
          </VStack>
        </form>
      </Box>
    </Container>
  );
};

export default CreateIndustryGroup; 