import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Flex,
  Badge,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  Stack,
  Skeleton,
  useToast,
  Icon,
  Tag,
  HStack,
  Image,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  FaSearch, 
  FaIndustry, 
  FaUsers, 
  FaChevronRight, 
  FaPlus, 
  FaBookmark, 
  FaCalendarAlt 
} from 'react-icons/fa';

const IndustryGroupsList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    industry: '',
    search: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const contentBg = useColorModeValue('white', 'gray.700');
  
  const industryColorMap = {
    'technology': 'blue',
    'healthcare': 'green',
    'finance': 'purple',
    'education': 'teal',
    'manufacturing': 'orange',
    'retail': 'pink',
    'legal': 'cyan',
    'media': 'yellow',
    'nonprofit': 'gray',
    'government': 'red',
    'engineering': 'blue',
    'science': 'teal',
    'other': 'gray'
  };

  useEffect(() => {
    fetchGroups();
  }, [page, filters]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 9,
        ...filters
      };

      // Filter out empty params
      Object.keys(params).forEach(key => !params[key] && delete params[key]);

      const response = await axios.get('/api/industry-groups', { params });
      setGroups(response.data.groups);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch industry groups',
        status: 'error',
        duration: 3000,
        isClosable: true
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

  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value
    });
    setPage(1);
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

  const renderSkeletons = () => (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} height="300px" borderRadius="lg" />
      ))}
    </SimpleGrid>
  );

  return (
    <Container maxW="container.xl" py={8}>
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        justify="space-between" 
        align={{ base: 'flex-start', md: 'center' }} 
        mb={8}
      >
        <Box mb={{ base: 4, md: 0 }}>
          <Heading as="h1" size="xl" mb={2}>
            Industry Groups
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Connect with professionals in your field
          </Text>
        </Box>
        
        <Button
          as={Link}
          to="/industry-groups/create"
          leftIcon={<FaPlus />}
          colorScheme="blue"
          size="md"
        >
          Create Group
        </Button>
      </Flex>

      {/* Filters */}
      <Box mb={8} p={5} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
        <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search industry groups"
              value={filters.search}
              onChange={handleSearchChange}
            />
          </InputGroup>
          
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
            <option value="manufacturing">Manufacturing</option>
            <option value="retail">Retail</option>
            <option value="legal">Legal</option>
            <option value="media">Media & Communications</option>
            <option value="nonprofit">Non-Profit</option>
            <option value="government">Government</option>
            <option value="engineering">Engineering</option>
            <option value="science">Science & Research</option>
            <option value="other">Other</option>
          </Select>
        </Stack>
      </Box>

      {/* Groups List */}
      {loading ? (
        renderSkeletons()
      ) : (
        <>
          {groups.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Heading as="h3" size="lg" mb={4}>
                No industry groups found
              </Heading>
              <Text mb={6}>Try adjusting your filters or create a new group</Text>
              <Button
                as={Link}
                to="/industry-groups/create"
                colorScheme="blue"
                leftIcon={<FaPlus />}
              >
                Create Industry Group
              </Button>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {groups.map((group) => (
                <Box
                  key={group._id}
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  bg={cardBg}
                  boxShadow="md"
                  transition="transform 0.3s, box-shadow 0.3s"
                  _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
                >
                  {/* Group Header with Banner Image */}
                  <Box 
                    h="120px" 
                    bgImage={group.bannerImage || `https://source.unsplash.com/random/800x200/?${group.industry}`}
                    bgSize="cover"
                    bgPosition="center"
                    position="relative"
                  >
                    <Box 
                      position="absolute" 
                      top={0} 
                      left={0} 
                      right={0} 
                      bottom={0} 
                      bg="blackAlpha.600"
                    />
                    <Flex 
                      position="absolute" 
                      bottom={3} 
                      left={4} 
                      align="center"
                    >
                      <Badge 
                        colorScheme={industryColorMap[group.industry] || 'blue'} 
                        fontSize="0.8em"
                      >
                        {group.industry.charAt(0).toUpperCase() + group.industry.slice(1)}
                      </Badge>
                    </Flex>
                  </Box>
                  
                  <Box p={5}>
                    <Heading as="h3" size="md" mb={2}>
                      {group.name}
                    </Heading>
                    
                    <Text noOfLines={2} mb={4} fontSize="sm" color="gray.500">
                      {group.description}
                    </Text>
                    
                    <HStack mb={4} spacing={4}>
                      <Flex align="center">
                        <Icon as={FaUsers} mr={1} color="blue.500" />
                        <Text fontSize="sm">
                          {group.members?.length || 0} members
                        </Text>
                      </Flex>
                      
                      {group.upcomingEvents > 0 && (
                        <Flex align="center">
                          <Icon as={FaCalendarAlt} mr={1} color="green.500" />
                          <Text fontSize="sm">
                            {group.upcomingEvents} events
                          </Text>
                        </Flex>
                      )}
                      
                      {group.resources?.length > 0 && (
                        <Flex align="center">
                          <Icon as={FaBookmark} mr={1} color="purple.500" />
                          <Text fontSize="sm">
                            {group.resources.length} resources
                          </Text>
                        </Flex>
                      )}
                    </HStack>
                    
                    <Divider mb={4} />
                    
                    <Text fontWeight="bold" fontSize="sm" mb={2}>
                      Focus Areas:
                    </Text>
                    <Flex wrap="wrap" mb={4}>
                      {(group.focusAreas || []).slice(0, 3).map((area, i) => (
                        <Tag key={i} size="sm" colorScheme="blue" mr={1} mb={1}>
                          {area}
                        </Tag>
                      ))}
                      {(group.focusAreas?.length || 0) > 3 && (
                        <Tag size="sm" variant="outline" colorScheme="blue">
                          +{group.focusAreas.length - 3} more
                        </Tag>
                      )}
                    </Flex>
                    
                    <Button
                      as={Link}
                      to={`/industry-groups/${group._id}`}
                      rightIcon={<FaChevronRight />}
                      colorScheme="blue"
                      size="sm"
                      width="full"
                    >
                      View Group
                    </Button>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Flex justify="center" mt={8}>
              <Button
                onClick={handlePrevPage}
                isDisabled={page === 1}
                mr={2}
              >
                Previous
              </Button>
              <Text alignSelf="center" mx={4}>
                Page {page} of {totalPages}
              </Text>
              <Button
                onClick={handleNextPage}
                isDisabled={page === totalPages}
                ml={2}
              >
                Next
              </Button>
            </Flex>
          )}
        </>
      )}
    </Container>
  );
};

export default IndustryGroupsList; 