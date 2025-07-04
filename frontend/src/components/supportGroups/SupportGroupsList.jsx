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
  Avatar,
  IconButton,
  Tag,
  HStack,
  VStack,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { FaSearch, FaFilter, FaUsers, FaPlus, FaChevronRight } from 'react-icons/fa';

const SupportGroupsList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    topic: '',
    search: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const categoryColorMap = {
    career_development: 'blue',
    workplace_challenges: 'orange',
    work_life_balance: 'green',
    leadership: 'purple',
    discrimination: 'red',
    harassment: 'red',
    mental_health: 'teal',
    entrepreneurship: 'yellow',
    negotiation: 'cyan',
    other: 'gray'
  };

  useEffect(() => {
    fetchGroups();
  }, [page, filters]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        ...filters
      };

      // Filter out empty params
      Object.keys(params).forEach(key => !params[key] && delete params[key]);

      const response = await axios.get('/api/support-groups', { params });
      setGroups(response.data.groups);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch support groups',
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
        <Skeleton key={i} height="200px" borderRadius="lg" />
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
            Support Groups
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Connect with women facing similar challenges
          </Text>
        </Box>
        
        <Button
          as={Link}
          to="/support-groups/create"
          leftIcon={<FaPlus />}
          colorScheme="purple"
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
              placeholder="Search groups"
              value={filters.search}
              onChange={handleSearchChange}
            />
          </InputGroup>
          
          <Select
            name="category"
            placeholder="All Categories"
            value={filters.category}
            onChange={handleFilterChange}
            maxW={{ base: 'full', md: '200px' }}
          >
            <option value="career_development">Career Development</option>
            <option value="workplace_challenges">Workplace Challenges</option>
            <option value="work_life_balance">Work-Life Balance</option>
            <option value="leadership">Leadership</option>
            <option value="discrimination">Discrimination</option>
            <option value="harassment">Harassment</option>
            <option value="mental_health">Mental Health</option>
            <option value="entrepreneurship">Entrepreneurship</option>
            <option value="negotiation">Negotiation</option>
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
                No support groups found
              </Heading>
              <Text mb={6}>Try adjusting your filters or create a new group</Text>
              <Button
                as={Link}
                to="/support-groups/create"
                colorScheme="purple"
                leftIcon={<FaPlus />}
              >
                Create Support Group
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
                  <Box p={4} bg={`${categoryColorMap[group.category] || 'gray'}.50`}>
                    <Flex justify="space-between" align="flex-start" mb={3}>
                      <Badge colorScheme={categoryColorMap[group.category] || 'gray'}>
                        {group.category.replace('_', ' ')}
                      </Badge>
                      {group.isPrivate && (
                        <Badge colorScheme="gray">Private</Badge>
                      )}
                    </Flex>
                    
                    <Heading as="h3" size="md" mb={2}>
                      {group.name}
                    </Heading>
                    
                    <Text noOfLines={2} mb={3} fontSize="sm">
                      {group.description}
                    </Text>
                    
                    <HStack mb={2}>
                      <FaUsers />
                      <Text fontSize="sm">
                        {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                      </Text>
                    </HStack>
                  </Box>
                  
                  <Box p={4}>
                    <Text fontWeight="bold" fontSize="sm" mb={2}>
                      Topics:
                    </Text>
                    <Flex wrap="wrap" mb={4}>
                      {group.topics.slice(0, 3).map((topic, i) => (
                        <Tag key={i} size="sm" colorScheme="purple" mr={1} mb={1}>
                          {topic}
                        </Tag>
                      ))}
                      {group.topics.length > 3 && (
                        <Tag size="sm" variant="outline" colorScheme="purple">
                          +{group.topics.length - 3} more
                        </Tag>
                      )}
                    </Flex>
                    
                    <Divider mb={4} />
                    
                    <Flex justify="space-between" align="center">
                      <HStack>
                        {group.moderators.slice(0, 3).map((mod, i) => (
                          <Avatar 
                            key={i} 
                            size="sm" 
                            name={`${mod.firstName} ${mod.lastName}`}
                            src={mod.profileImage}
                          />
                        ))}
                      </HStack>
                      
                      <Button
                        as={Link}
                        to={`/support-groups/${group._id}`}
                        rightIcon={<FaChevronRight />}
                        colorScheme="purple"
                        variant="outline"
                        size="sm"
                      >
                        View Group
                      </Button>
                    </Flex>
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

export default SupportGroupsList; 