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
  Switch,
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
  Badge,
  useColorModeValue
} from '@chakra-ui/react';

const CreateSupportGroup = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isPrivate: false,
    topics: [],
    rules: [
      { title: '', description: '' }
    ]
  });

  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardBg = useColorModeValue('white', 'gray.800');
  const mainBg = useColorModeValue('gray.50', 'gray.900');
  const ruleBg = useColorModeValue('gray.50', 'gray.700');

  const categoryOptions = [
    { value: 'career_development', label: 'Career Development' },
    { value: 'workplace_challenges', label: 'Workplace Challenges' },
    { value: 'work_life_balance', label: 'Work-Life Balance' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'discrimination', label: 'Discrimination' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'mental_health', label: 'Mental Health' },
    { value: 'entrepreneurship', label: 'Entrepreneurship' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddTopic = () => {
    if (!topic.trim()) return;
    
    if (formData.topics.includes(topic.trim())) {
      toast({
        title: 'Duplicate topic',
        description: 'This topic already exists',
        status: 'warning',
        duration: 2000,
        isClosable: true
      });
      return;
    }
    
    if (formData.topics.length >= 10) {
      toast({
        title: 'Maximum topics reached',
        description: 'You can add up to 10 topics',
        status: 'warning',
        duration: 2000,
        isClosable: true
      });
      return;
    }
    
    setFormData({
      ...formData,
      topics: [...formData.topics, topic.trim()]
    });
    setTopic('');
  };

  const handleRemoveTopic = (topicToRemove) => {
    setFormData({
      ...formData,
      topics: formData.topics.filter(t => t !== topicToRemove)
    });
  };

  const handleRuleChange = (index, field, value) => {
    const updatedRules = [...formData.rules];
    updatedRules[index] = {
      ...updatedRules[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      rules: updatedRules
    });
  };

  const handleAddRule = () => {
    if (formData.rules.length >= 10) {
      toast({
        title: 'Maximum rules reached',
        description: 'You can add up to 10 rules',
        status: 'warning',
        duration: 2000,
        isClosable: true
      });
      return;
    }
    
    setFormData({
      ...formData,
      rules: [...formData.rules, { title: '', description: '' }]
    });
  };

  const handleRemoveRule = (index) => {
    const updatedRules = formData.rules.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      rules: updatedRules
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: 'Group name required',
        description: 'Please provide a name for your support group',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    if (!formData.description.trim()) {
      toast({
        title: 'Description required',
        description: 'Please provide a description for your support group',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    if (!formData.category) {
      toast({
        title: 'Category required',
        description: 'Please select a category for your support group',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    if (formData.topics.length === 0) {
      toast({
        title: 'Topics required',
        description: 'Please add at least one topic for your support group',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // Filter out empty rules
    const filteredRules = formData.rules.filter(
      rule => rule.title.trim() !== '' && rule.description.trim() !== ''
    );
    
    try {
      setIsSubmitting(true);
      
      const response = await axios.post('/api/support-groups', {
        ...formData,
        rules: filteredRules
      });
      
      toast({
        title: 'Support group created',
        description: 'Your support group has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      // Navigate to the new group
      navigate(`/support-groups/${response.data._id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create support group',
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
          Create Support Group
        </Heading>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel>Group Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter support group name"
              />
              <FormHelperText>
                Choose a descriptive name that clearly conveys your group's purpose
              </FormHelperText>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the purpose and goals of this support group"
                rows={4}
              />
              <FormHelperText>
                Clearly explain what members can expect and what kinds of discussions will happen here
              </FormHelperText>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Select a category"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <FormHelperText>
                Select the primary focus area of your support group
              </FormHelperText>
            </FormControl>
            
            <FormControl>
              <FormLabel>Topics</FormLabel>
              <HStack>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Add relevant topics"
                />
                <Button 
                  onClick={handleAddTopic}
                  colorScheme="purple"
                >
                  Add
                </Button>
              </HStack>
              <FormHelperText>
                Add specific topics that will be discussed in this group (max 10)
              </FormHelperText>
              
              <Box mt={3}>
                {formData.topics.length > 0 ? (
                  <Flex flexWrap="wrap" gap={2}>
                    {formData.topics.map((t, index) => (
                      <Tag key={index} size="md" colorScheme="purple" borderRadius="full">
                        <TagLabel>{t}</TagLabel>
                        <TagCloseButton onClick={() => handleRemoveTopic(t)} />
                      </Tag>
                    ))}
                  </Flex>
                ) : (
                  <Text fontSize="sm" color="gray.500">No topics added yet</Text>
                )}
              </Box>
            </FormControl>
            
            <Divider />
            
            <FormControl display="flex" alignItems="center">
              <Switch
                id="is-private"
                name="isPrivate"
                isChecked={formData.isPrivate}
                onChange={handleInputChange}
                mr={3}
              />
              <FormLabel htmlFor="is-private" mb={0}>
                Private Group
              </FormLabel>
            </FormControl>
            
            <Text fontSize="sm" color="gray.500" mt={-4}>
              Private groups require moderator approval before new members can join
            </Text>
            
            <Divider />
            
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading as="h3" size="md">
                  Group Rules
                </Heading>
                <Button 
                  size="sm" 
                  onClick={handleAddRule}
                  colorScheme="blue"
                  variant="outline"
                >
                  Add Rule
                </Button>
              </Flex>
              
              {formData.rules.map((rule, index) => (
                                 <Box 
                   key={index} 
                   p={4} 
                   mb={4} 
                   borderWidth="1px" 
                   borderRadius="md"
                   bg={ruleBg}
                 >
                  <Flex justify="space-between" align="center" mb={2}>
                    <Badge colorScheme="blue">Rule {index + 1}</Badge>
                    <Button 
                      size="xs" 
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleRemoveRule(index)}
                    >
                      Remove
                    </Button>
                  </Flex>
                  
                  <FormControl mb={3}>
                    <FormLabel fontSize="sm">Rule Title</FormLabel>
                    <Input
                      value={rule.title}
                      onChange={(e) => handleRuleChange(index, 'title', e.target.value)}
                      placeholder="e.g., Respectful Communication"
                      size="sm"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">Description</FormLabel>
                    <Textarea
                      value={rule.description}
                      onChange={(e) => handleRuleChange(index, 'description', e.target.value)}
                      placeholder="Explain this rule in detail"
                      size="sm"
                      rows={2}
                    />
                  </FormControl>
                </Box>
              ))}
              
              {formData.rules.length === 0 && (
                <Text color="gray.500" fontSize="sm">No rules added yet</Text>
              )}
            </Box>
            
            <Divider />
            
            <Flex justify="space-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/support-groups')}
              >
                Cancel
              </Button>
              <Button 
                colorScheme="purple" 
                type="submit"
                isLoading={isSubmitting}
                loadingText="Creating..."
              >
                Create Support Group
              </Button>
            </Flex>
          </VStack>
        </form>
      </Box>
    </Container>
  );
};

export default CreateSupportGroup; 