import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Grid,
  GridItem,
  Avatar,
  AvatarGroup,
  Divider,
  List,
  ListItem,
  ListIcon,
  Icon,
  Image,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  SimpleGrid,
  Tag,
  TagLabel,
  HStack,
  VStack,
  Skeleton,
  useToast,
  useDisclosure,
  useColorModeValue
} from '@chakra-ui/react';
import {
  FaUsers,
  FaCalendarAlt,
  FaBookmark,
  FaLink,
  FaUserPlus,
  FaClock,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaLightbulb,
  FaChalkboardTeacher,
  FaComments,
  FaRegNewspaper
} from 'react-icons/fa';

const IndustryGroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [group, setGroup] = useState(null);
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userIsMember, setUserIsMember] = useState(false);
  
  const bannerBg = useColorModeValue('blue.50', 'blue.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/industry-groups/${groupId}`);
      setGroup(response.data);
      
      // Check if user is a member
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (token && userId) {
        const isMember = response.data.members.some(
          member => member._id === userId
        );
        setUserIsMember(isMember);
      }
      
      // Fetch resources, events and discussions
      await Promise.all([
        fetchResources(),
        fetchEvents(),
        fetchDiscussions()
      ]);
      
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load industry group details',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      setLoading(false);
      
      // If 404, navigate to not found
      if (error.response && error.response.status === 404) {
        navigate('/not-found');
      }
    }
  };

  const fetchResources = async () => {
    try {
      const response = await axios.get(`/api/industry-groups/${groupId}/resources`);
      setResources(response.data.resources);
    } catch (error) {
      console.error('Failed to fetch resources', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`/api/industry-groups/${groupId}/events`);
      setEvents(response.data.events);
    } catch (error) {
      console.error('Failed to fetch events', error);
    }
  };

  const fetchDiscussions = async () => {
    try {
      const response = await axios.get(`/api/industry-groups/${groupId}/discussions`);
      setDiscussions(response.data.discussions);
    } catch (error) {
      console.error('Failed to fetch discussions', error);
    }
  };

  const handleJoinGroup = async () => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to join this group',
          status: 'warning',
          duration: 3000,
          isClosable: true
        });
        navigate('/login', { state: { from: `/industry-groups/${groupId}` } });
        return;
      }

      await axios.post(`/api/industry-groups/${groupId}/join`);
      setUserIsMember(true);
      
      // Refetch group data to get updated member list
      fetchGroupDetails();
      
      toast({
        title: 'Success',
        description: 'You have joined this industry group',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to join group',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await axios.post(`/api/industry-groups/${groupId}/leave`);
      setUserIsMember(false);
      
      // Refetch group data to get updated member list
      fetchGroupDetails();
      
      toast({
        title: 'Success',
        description: 'You have left this industry group',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to leave group',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Skeleton height="400px" mb={6} />
        <Skeleton height="50px" mb={6} />
        <Skeleton height="300px" />
      </Container>
    );
  }

  if (!group) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Heading mb={4}>Industry group not found</Heading>
          <Button as={Link} to="/industry-groups" colorScheme="blue">
            Back to Industry Groups
          </Button>
        </Box>
      </Container>
    );
  }

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container maxW="container.xl" py={8}>
      {/* Banner */}
      <Box
        bgImage={group.bannerImage || `https://source.unsplash.com/random/1200x300/?${group.industry}`}
        bgSize="cover"
        bgPosition="center"
        borderRadius="lg"
        h="250px"
        mb={6}
        position="relative"
      >
        <Box 
          position="absolute" 
          top={0} 
          left={0} 
          right={0} 
          bottom={0} 
          bg="blackAlpha.600"
          borderRadius="lg"
        />
        
        <Box 
          position="absolute" 
          bottom={6} 
          left={6} 
          right={6}
        >
          <Badge 
            colorScheme={
              group.industry === 'technology' ? 'blue' :
              group.industry === 'healthcare' ? 'green' :
              group.industry === 'finance' ? 'purple' :
              group.industry === 'education' ? 'teal' :
              group.industry === 'manufacturing' ? 'orange' :
              group.industry === 'retail' ? 'pink' :
              group.industry === 'legal' ? 'cyan' :
              group.industry === 'media' ? 'yellow' :
              'gray'
            } 
            mb={2}
          >
            {group.industry.charAt(0).toUpperCase() + group.industry.slice(1)}
          </Badge>
          
          <Heading as="h1" size="xl" color="white">
            {group.name}
          </Heading>
        </Box>
      </Box>

      <Grid templateColumns={{ base: "1fr", lg: "3fr 1fr" }} gap={6}>
        <GridItem>
          {/* Group Content */}
          <Tabs colorScheme="blue" isLazy>
            <TabList>
              <Tab><Icon as={FaRegNewspaper} mr={2} /> Overview</Tab>
              <Tab><Icon as={FaBookmark} mr={2} /> Resources</Tab>
              <Tab><Icon as={FaCalendarAlt} mr={2} /> Events</Tab>
              <Tab><Icon as={FaComments} mr={2} /> Discussions</Tab>
            </TabList>

            <TabPanels>
              {/* Overview Tab */}
              <TabPanel p={4}>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Heading as="h3" size="md" mb={4}>
                      About This Group
                    </Heading>
                    <Text>{group.description}</Text>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Heading as="h3" size="md" mb={4}>
                      Focus Areas
                    </Heading>
                    <Flex wrap="wrap" gap={2}>
                      {(group.focusAreas || []).map((area, index) => (
                        <Tag key={index} colorScheme="blue" size="md">
                          {area}
                        </Tag>
                      ))}
                      
                      {(!group.focusAreas || group.focusAreas.length === 0) && (
                        <Text>No focus areas have been defined for this group.</Text>
                      )}
                    </Flex>
                  </Box>
                  
                  {group.industryTrends && group.industryTrends.length > 0 && (
                    <>
                      <Divider />
                      
                      <Box>
                        <Heading as="h3" size="md" mb={4}>
                          Industry Trends
                        </Heading>
                        <List spacing={3}>
                          {group.industryTrends.map((trend, index) => (
                            <ListItem key={index} display="flex">
                              <ListIcon as={FaLightbulb} color="yellow.500" mt={1} />
                              <Box>
                                <Text fontWeight="bold">{trend.title}</Text>
                                <Text>{trend.description}</Text>
                              </Box>
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </>
                  )}
                  
                  <Divider />
                  
                  <Box>
                    <Heading as="h3" size="md" mb={4}>
                      Group Statistics
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                      <Box p={4} borderWidth="1px" borderRadius="md" bg={cardBg}>
                        <Heading size="sm" mb={2}>Members</Heading>
                        <Flex align="center">
                          <Icon as={FaUsers} mr={2} color="blue.500" />
                          <Text fontSize="2xl" fontWeight="bold">{group.members.length}</Text>
                        </Flex>
                      </Box>
                      
                      <Box p={4} borderWidth="1px" borderRadius="md" bg={cardBg}>
                        <Heading size="sm" mb={2}>Resources</Heading>
                        <Flex align="center">
                          <Icon as={FaBookmark} mr={2} color="purple.500" />
                          <Text fontSize="2xl" fontWeight="bold">{resources.length}</Text>
                        </Flex>
                      </Box>
                      
                      <Box p={4} borderWidth="1px" borderRadius="md" bg={cardBg}>
                        <Heading size="sm" mb={2}>Upcoming Events</Heading>
                        <Flex align="center">
                          <Icon as={FaCalendarAlt} mr={2} color="green.500" />
                          <Text fontSize="2xl" fontWeight="bold">
                            {events.filter(e => new Date(e.startDate) > new Date()).length}
                          </Text>
                        </Flex>
                      </Box>
                    </SimpleGrid>
                  </Box>
                </VStack>
              </TabPanel>

              {/* Resources Tab */}
              <TabPanel p={4}>
                <Flex justify="space-between" align="center" mb={6}>
                  <Heading as="h2" size="lg">
                    Industry Resources
                  </Heading>
                  
                  {userIsMember && (
                    <Button 
                      as={Link} 
                      to={`/industry-groups/${groupId}/resources/add`}
                      colorScheme="blue"
                      size="sm"
                    >
                      Add Resource
                    </Button>
                  )}
                </Flex>
                
                {resources.length === 0 ? (
                  <Box textAlign="center" py={8} borderWidth="1px" borderRadius="md" bg={cardBg}>
                    <Icon as={FaBookmark} boxSize={10} mb={4} color="gray.500" />
                    <Heading as="h3" size="md" mb={2}>No Resources Available</Heading>
                    <Text mb={4}>This group hasn't added any resources yet.</Text>
                    
                    {userIsMember && (
                      <Button 
                        as={Link} 
                        to={`/industry-groups/${groupId}/resources/add`}
                        colorScheme="blue"
                      >
                        Be the First to Add a Resource
                      </Button>
                    )}
                  </Box>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {resources.map((resource) => (
                      <Card key={resource._id} bg={cardBg}>
                        <CardHeader pb={2}>
                          <Tag colorScheme="blue" mb={2}>
                            {resource.type}
                          </Tag>
                          <Heading as="h3" size="md">
                            {resource.title}
                          </Heading>
                        </CardHeader>
                        
                        <CardBody pt={0} pb={2}>
                          <Text noOfLines={3}>{resource.description}</Text>
                        </CardBody>
                        
                        <CardFooter pt={0}>
                          <Button
                            as="a"
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            rightIcon={<FaExternalLinkAlt />}
                            colorScheme="blue"
                            variant="outline"
                            size="sm"
                            w="full"
                          >
                            View Resource
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </TabPanel>

              {/* Events Tab */}
              <TabPanel p={4}>
                <Flex justify="space-between" align="center" mb={6}>
                  <Heading as="h2" size="lg">
                    Industry Events
                  </Heading>
                  
                  {userIsMember && (
                    <Button 
                      as={Link} 
                      to={`/industry-groups/${groupId}/events/create`}
                      colorScheme="blue"
                      size="sm"
                    >
                      Create Event
                    </Button>
                  )}
                </Flex>
                
                {events.length === 0 ? (
                  <Box textAlign="center" py={8} borderWidth="1px" borderRadius="md" bg={cardBg}>
                    <Icon as={FaCalendarAlt} boxSize={10} mb={4} color="gray.500" />
                    <Heading as="h3" size="md" mb={2}>No Scheduled Events</Heading>
                    <Text mb={4}>This group hasn't scheduled any events yet.</Text>
                    
                    {userIsMember && (
                      <Button 
                        as={Link} 
                        to={`/industry-groups/${groupId}/events/create`}
                        colorScheme="blue"
                      >
                        Schedule an Event
                      </Button>
                    )}
                  </Box>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {events
                      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                      .map((event) => {
                        const isUpcoming = new Date(event.startDate) > new Date();
                        
                        return (
                          <Box 
                            key={event._id} 
                            p={4} 
                            borderWidth="1px" 
                            borderRadius="md"
                            bg={cardBg}
                            borderLeftWidth="4px"
                            borderLeftColor={isUpcoming ? "blue.500" : "gray.300"}
                          >
                            <Flex 
                              direction={{ base: "column", md: "row" }} 
                              justify="space-between"
                              align={{ base: "flex-start", md: "center" }}
                            >
                              <Box>
                                <Flex align="center" mb={1}>
                                  <Badge 
                                    colorScheme={isUpcoming ? "blue" : "gray"}
                                    mr={2}
                                  >
                                    {isUpcoming ? "Upcoming" : "Past"}
                                  </Badge>
                                  <Badge colorScheme="green">
                                    {event.format}
                                  </Badge>
                                </Flex>
                                
                                <Heading as="h3" size="md" mb={1}>
                                  {event.title}
                                </Heading>
                                
                                <HStack mb={2}>
                                  <Flex align="center">
                                    <Icon as={FaClock} mr={1} color="blue.500" />
                                    <Text fontSize="sm">
                                      {formatDate(event.startDate)}
                                    </Text>
                                  </Flex>
                                  
                                  {event.location && (
                                    <Flex align="center">
                                      <Icon as={FaMapMarkerAlt} mr={1} color="red.500" />
                                      <Text fontSize="sm">
                                        {event.location}
                                      </Text>
                                    </Flex>
                                  )}
                                </HStack>
                                
                                <Text fontSize="sm" noOfLines={2}>
                                  {event.description}
                                </Text>
                              </Box>
                              
                              <Button 
                                as={Link} 
                                to={`/industry-groups/${groupId}/events/${event._id}`}
                                colorScheme="blue"
                                variant={isUpcoming ? "solid" : "outline"}
                                size="sm"
                                mt={{ base: 4, md: 0 }}
                              >
                                {isUpcoming ? "Register" : "View Details"}
                              </Button>
                            </Flex>
                          </Box>
                        );
                      })}
                  </VStack>
                )}
              </TabPanel>

              {/* Discussions Tab */}
              <TabPanel p={4}>
                <Flex justify="space-between" align="center" mb={6}>
                  <Heading as="h2" size="lg">
                    Industry Discussions
                  </Heading>
                  
                  {userIsMember && (
                    <Button 
                      as={Link} 
                      to={`/industry-groups/${groupId}/discussions/create`}
                      colorScheme="blue"
                      size="sm"
                    >
                      Start Discussion
                    </Button>
                  )}
                </Flex>
                
                {!userIsMember ? (
                  <Box textAlign="center" py={8} borderWidth="1px" borderRadius="md" bg={cardBg}>
                    <Icon as={FaComments} boxSize={10} mb={4} color="gray.500" />
                    <Heading as="h3" size="md" mb={2}>Join to View Discussions</Heading>
                    <Text mb={4}>You need to be a member to view and participate in discussions.</Text>
                    <Button 
                      colorScheme="blue"
                      onClick={handleJoinGroup}
                    >
                      Join This Group
                    </Button>
                  </Box>
                ) : discussions.length === 0 ? (
                  <Box textAlign="center" py={8} borderWidth="1px" borderRadius="md" bg={cardBg}>
                    <Icon as={FaComments} boxSize={10} mb={4} color="gray.500" />
                    <Heading as="h3" size="md" mb={2}>No Discussions Started</Heading>
                    <Text mb={4}>Be the first to start a discussion in this group.</Text>
                    <Button 
                      as={Link} 
                      to={`/industry-groups/${groupId}/discussions/create`}
                      colorScheme="blue"
                    >
                      Start a Discussion
                    </Button>
                  </Box>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {discussions.map((discussion) => (
                      <Box 
                        key={discussion._id} 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="md"
                        bg={cardBg}
                      >
                        <Link to={`/industry-groups/${groupId}/discussions/${discussion._id}`}>
                          <Heading as="h3" size="md" mb={2}>
                            {discussion.title}
                          </Heading>
                        </Link>
                        
                        <Text noOfLines={2} mb={3}>
                          {discussion.content}
                        </Text>
                        
                        <Flex justify="space-between" align="center">
                          <Flex align="center">
                            <Avatar 
                              size="sm" 
                              mr={2}
                              src={discussion.author.profileImage}
                              name={`${discussion.author.firstName} ${discussion.author.lastName}`}
                            />
                            <Box>
                              <Text fontSize="sm" fontWeight="bold">
                                {discussion.author.firstName} {discussion.author.lastName}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {new Date(discussion.createdAt).toLocaleDateString()}
                              </Text>
                            </Box>
                          </Flex>
                          
                          <HStack>
                            <Badge colorScheme="blue">
                              {discussion.replies?.length || 0} replies
                            </Badge>
                            <Badge colorScheme="green">
                              {discussion.views} views
                            </Badge>
                          </HStack>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </GridItem>
        
        {/* Sidebar */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* Join/Leave Group */}
            <Box p={4} borderWidth="1px" borderRadius="md" bg={cardBg}>
              {!userIsMember ? (
                <Button
                  colorScheme="blue"
                  leftIcon={<FaUserPlus />}
                  w="full"
                  onClick={handleJoinGroup}
                >
                  Join This Group
                </Button>
              ) : (
                <Button
                  colorScheme="red"
                  variant="outline"
                  w="full"
                  onClick={handleLeaveGroup}
                >
                  Leave Group
                </Button>
              )}
            </Box>
            
            {/* Members */}
            <Box p={4} borderWidth="1px" borderRadius="md" bg={cardBg}>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading as="h3" size="md">
                  Members
                </Heading>
                <Text fontSize="sm">
                  {group.members.length} total
                </Text>
              </Flex>
              
              <AvatarGroup size="md" max={5} mb={2}>
                {group.members.map((member) => (
                  <Avatar 
                    key={member._id}
                    name={`${member.firstName} ${member.lastName}`}
                    src={member.profileImage}
                  />
                ))}
              </AvatarGroup>
              
              <Button 
                as={Link} 
                to={`/industry-groups/${groupId}/members`}
                variant="outline" 
                size="sm" 
                w="full" 
                mt={2}
              >
                View All Members
              </Button>
            </Box>
            
            {/* Group Leaders */}
            {group.leaders && group.leaders.length > 0 && (
              <Box p={4} borderWidth="1px" borderRadius="md" bg={cardBg}>
                <Heading as="h3" size="md" mb={4}>
                  Group Leaders
                </Heading>
                
                <VStack spacing={4} align="stretch">
                  {group.leaders.map((leader) => (
                    <Flex key={leader._id} align="center">
                      <Avatar 
                        size="sm" 
                        mr={3}
                        name={`${leader.firstName} ${leader.lastName}`}
                        src={leader.profileImage}
                      />
                      <Box>
                        <Text fontWeight="bold">
                          {leader.firstName} {leader.lastName}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {leader.role || 'Group Leader'}
                        </Text>
                      </Box>
                    </Flex>
                  ))}
                </VStack>
              </Box>
            )}
            
            {/* Featured Resource */}
            {resources.length > 0 && (
              <Box p={4} borderWidth="1px" borderRadius="md" bg={cardBg}>
                <Heading as="h3" size="md" mb={4}>
                  Featured Resource
                </Heading>
                
                <Box>
                  <Tag colorScheme="blue" mb={2}>
                    {resources[0].type}
                  </Tag>
                  <Heading as="h4" size="sm" mb={2}>
                    {resources[0].title}
                  </Heading>
                  <Text fontSize="sm" mb={3} noOfLines={3}>
                    {resources[0].description}
                  </Text>
                  <Button
                    as="a"
                    href={resources[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    rightIcon={<FaExternalLinkAlt />}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                    w="full"
                  >
                    View Resource
                  </Button>
                </Box>
              </Box>
            )}
            
            {/* Next Event */}
            {events.length > 0 && (() => {
              // Find the next upcoming event
              const now = new Date();
              const upcomingEvents = events.filter(e => new Date(e.startDate) > now);
              const nextEvent = upcomingEvents.sort((a, b) => 
                new Date(a.startDate) - new Date(b.startDate)
              )[0];
              
              if (nextEvent) {
                return (
                  <Box p={4} borderWidth="1px" borderRadius="md" bg={cardBg}>
                    <Heading as="h3" size="md" mb={4}>
                      Next Event
                    </Heading>
                    
                    <Badge colorScheme="green" mb={2}>
                      {nextEvent.format}
                    </Badge>
                    <Heading as="h4" size="sm" mb={2}>
                      {nextEvent.title}
                    </Heading>
                    
                    <HStack mb={3}>
                      <Flex align="center">
                        <Icon as={FaClock} mr={1} color="blue.500" />
                        <Text fontSize="sm">
                          {formatDate(nextEvent.startDate)}
                        </Text>
                      </Flex>
                    </HStack>
                    
                    <Button
                      as={Link}
                      to={`/industry-groups/${groupId}/events/${nextEvent._id}`}
                      colorScheme="blue"
                      size="sm"
                      w="full"
                    >
                      View Event
                    </Button>
                  </Box>
                );
              }
              return null;
            })()}
          </VStack>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default IndustryGroupDetail; 