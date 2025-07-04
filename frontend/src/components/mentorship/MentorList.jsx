import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Heading,
  Text,
  Flex,
  Image,
  Badge,
  Button,
  Select,
  Input,
  SimpleGrid,
  Skeleton,
  Stack,
  useToast,
  Container,
  Divider,
  HStack,
  VStack,
  Icon,
  Avatar
} from '@chakra-ui/react';
import { FaStar, FaSearch, FaFilter, FaBriefcase } from 'react-icons/fa';

const MentorList = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    specialization: '',
    industry: '',
    mentorshipStyle: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  useEffect(() => {
    fetchMentors();
  }, [page, filters]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...filters
      };

      // Filter out empty params
      Object.keys(params).forEach(key => !params[key] && delete params[key]);

      const response = await axios.get('/api/mentorship/mentors', { params });
      
      setMentors(response.data.mentors);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch mentors');
      toast({
        title: 'Error',
        description: 'Failed to load mentors',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    setPage(1); // Reset to first page when filters change
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  if (error) {
    return (
      <Box textAlign="center" py={10}>
        <Heading as="h2" size="lg" mb={4}>
          Error Loading Mentors
        </Heading>
        <Text>{error}</Text>
        <Button mt={4} colorScheme="blue" onClick={fetchMentors}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={6}>
        Find a Mentor
      </Heading>
      
      <Text mb={6} fontSize="lg">
        Connect with experienced professionals who can guide you in your career journey.
      </Text>
      
      {/* Filters */}
      <Box mb={8} p={4} bg="gray.50" borderRadius="md">
        <Flex direction={{ base: 'column', md: 'row' }} gap={4} align="center">
          <HStack spacing={2} mb={{ base: 4, md: 0 }}>
            <Icon as={FaFilter} />
            <Text fontWeight="bold">Filters:</Text>
          </HStack>
          
          <Select
            name="specialization"
            placeholder="All Specializations"
            value={filters.specialization}
            onChange={handleFilterChange}
            maxW={{ base: 'full', md: '200px' }}
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
          
          <Select
            name="industry"
            placeholder="All Industries"
            value={filters.industry}
            onChange={handleFilterChange}
            maxW={{ base: 'full', md: '200px' }}
          >
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="education">Education</option>
            <option value="retail">Retail</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="media">Media & Entertainment</option>
            <option value="government">Government</option>
            <option value="nonprofit">Nonprofit</option>
          </Select>
          
          <Select
            name="mentorshipStyle"
            placeholder="All Mentorship Styles"
            value={filters.mentorshipStyle}
            onChange={handleFilterChange}
            maxW={{ base: 'full', md: '200px' }}
          >
            <option value="directive">Directive</option>
            <option value="non_directive">Non-Directive</option>
            <option value="situational">Situational</option>
            <option value="transformational">Transformational</option>
            <option value="developmental">Developmental</option>
          </Select>
        </Flex>
      </Box>
      
      {/* Mentor List */}
      {loading ? (
        <Stack spacing={4}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="200px" borderRadius="md" />
          ))}
        </Stack>
      ) : mentors.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Heading as="h3" size="md" mb={4}>
            No mentors found
          </Heading>
          <Text>Try adjusting your filters to see more results.</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {mentors.map((mentor) => (
            <Box
              key={mentor._id}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              boxShadow="md"
              transition="transform 0.3s, box-shadow 0.3s"
              _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
            >
              <Flex direction="column" h="full">
                <Box p={4} bg="purple.50">
                  <Flex align="center" mb={3}>
                    <Avatar 
                      size="lg"
                      src={mentor.user.profileImage}
                      name={`${mentor.user.firstName} ${mentor.user.lastName}`}
                      mr={3}
                    />
                    <Box>
                      <Heading as="h3" size="md">
                        {mentor.user.firstName} {mentor.user.lastName}
                      </Heading>
                      {mentor.expertise && mentor.expertise.length > 0 && (
                        <Text color="gray.600" fontSize="sm">
                          {mentor.expertise[0].name} ({mentor.expertise[0].yearsExperience} years)
                        </Text>
                      )}
                    </Box>
                  </Flex>
                  
                  <Box mb={3}>
                    <Flex align="center" mb={1}>
                      <Icon as={FaStar} color="yellow.400" mr={1} />
                      <Text fontWeight="bold">
                        {mentor.rating.average ? mentor.rating.average.toFixed(1) : 'New'} 
                        {mentor.rating.count > 0 && ` (${mentor.rating.count})`}
                      </Text>
                    </Flex>
                    
                    <Flex wrap="wrap" mt={2}>
                      {mentor.specializations && mentor.specializations.map((spec, i) => (
                        <Badge key={i} colorScheme="purple" mr={1} mb={1}>
                          {spec}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                </Box>
                
                <Box p={4} flex="1">
                  <Text noOfLines={3} mb={4}>
                    {mentor.biography}
                  </Text>
                  
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" mb={1}>
                      Mentorship Style:
                    </Text>
                    <Text fontSize="sm" textTransform="capitalize" mb={3}>
                      {mentor.mentorshipStyle?.replace('_', ' ')}
                    </Text>
                    
                    <Text fontWeight="bold" fontSize="sm" mb={1}>
                      Availability:
                    </Text>
                    <Text fontSize="sm">
                      {mentor.availability?.maxMentees - mentor.availability?.currentMentees} of {mentor.availability?.maxMentees} spots available
                    </Text>
                  </Box>
                </Box>
                
                <Divider />
                
                <Box p={4}>
                  <Button
                    as={Link}
                    to={`/mentorship/mentors/${mentor._id}`}
                    colorScheme="purple"
                    size="md"
                    width="full"
                  >
                    View Profile
                  </Button>
                </Box>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Flex justify="center" mt={8}>
          <Button
            onClick={handlePrevPage}
            disabled={page === 1}
            mr={2}
          >
            Previous
          </Button>
          <Text alignSelf="center" mx={4}>
            Page {page} of {totalPages}
          </Text>
          <Button
            onClick={handleNextPage}
            disabled={page === totalPages}
            ml={2}
          >
            Next
          </Button>
        </Flex>
      )}
    </Container>
  );
};

export default MentorList; 