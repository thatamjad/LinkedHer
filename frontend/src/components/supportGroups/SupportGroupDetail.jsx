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
  Avatar,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  List,
  ListItem,
  ListIcon,
  IconButton,
  AvatarGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  FormControl,
  FormLabel,
  Input,
  Divider,
  Tag,
  TagLabel,
  HStack,
  VStack,
  Skeleton,
  useToast,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue
} from '@chakra-ui/react';
import {
  FaUsers,
  FaUserShield,
  FaInfoCircle,
  FaCheckCircle,
  FaComments,
  FaPlus,
  FaUserPlus,
  FaHeart,
  FaThumbsUp,
  FaLightbulb,
  FaChevronDown
} from 'react-icons/fa';

const SupportGroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [group, setGroup] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [discussionsLoading, setDiscussionsLoading] = useState(true);
  const [userIsMember, setUserIsMember] = useState(false);
  const [userIsModerator, setUserIsModerator] = useState(false);
  const [joinRequestStatus, setJoinRequestStatus] = useState(null);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    isAnonymous: false
  });

  const { 
    isOpen: isCreateDiscussionOpen, 
    onOpen: onCreateDiscussionOpen, 
    onClose: onCreateDiscussionClose 
  } = useDisclosure();

  const bg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('purple.50', 'purple.900');

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/support-groups/${groupId}`);
      setGroup(response.data);
      
      // Check if user is a member
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (token && userId) {
        const isMember = response.data.members.some(
          member => member.user._id === userId && member.isActive
        );
        setUserIsMember(isMember);
        
        // Check if user is a moderator
        const isModerator = response.data.moderators.some(
          moderator => moderator._id === userId
        );
        setUserIsModerator(isModerator);
        
        // Check if user has pending join request
        if (response.data.isPrivate && !isMember) {
          const joinRequest = response.data.joinRequests?.find(
            request => request.user === userId
          );
          
          if (joinRequest) {
            setJoinRequestStatus(joinRequest.status);
          }
        }
        
        // If user is a member or the group is public, fetch discussions
        if (isMember || !response.data.isPrivate) {
          fetchDiscussions();
        } else {
          setDiscussionsLoading(false);
        }
      } else {
        // If not logged in and group is public, fetch discussions
        if (!response.data.isPrivate) {
          fetchDiscussions();
        } else {
          setDiscussionsLoading(false);
        }
      }
      
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load support group details',
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

  const fetchDiscussions = async () => {
    try {
      setDiscussionsLoading(true);
      const response = await axios.get(`/api/support-groups/${groupId}/discussions`);
      setDiscussions(response.data.discussions);
      setDiscussionsLoading(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load discussions',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      setDiscussionsLoading(false);
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
        navigate('/login', { state: { from: `/support-groups/${groupId}` } });
        return;
      }

      const response = await axios.post(`/api/support-groups/${groupId}/join`);
      
      if (response.data.isPending) {
        setJoinRequestStatus('pending');
        toast({
          title: 'Request submitted',
          description: 'Your request to join this group has been submitted',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } else {
        setUserIsMember(true);
        // Refetch group data to get updated member list
        fetchGroupDetails();
        toast({
          title: 'Success',
          description: 'You have joined this group',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }
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
      await axios.post(`/api/support-groups/${groupId}/leave`);
      setUserIsMember(false);
      setUserIsModerator(false);
      // Refetch group data to get updated member list
      fetchGroupDetails();
      toast({
        title: 'Success',
        description: 'You have left this group',
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

  const handleDiscussionInputChange = (e) => {
    const { name, value } = e.target;
    setNewDiscussion({
      ...newDiscussion,
      [name]: value
    });
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide a title and content for your discussion',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    try {
      await axios.post(`/api/support-groups/${groupId}/discussions`, newDiscussion);
      
      // Reset form and close modal
      setNewDiscussion({
        title: '',
        content: '',
        isAnonymous: false
      });
      onCreateDiscussionClose();
      
      // Refetch discussions
      fetchDiscussions();
      
      toast({
        title: 'Success',
        description: 'Your discussion has been created',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create discussion',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Skeleton height="200px" mb={6} />
        <Skeleton height="50px" mb={6} />
        <Skeleton height="300px" mb={6} />
      </Container>
    );
  }

  if (!group) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Heading mb={4}>Group not found</Heading>
          <Button as={Link} to="/support-groups" colorScheme="purple">
            Back to Support Groups
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      {/* Group Header */}
      <Flex
        direction="column"
        bg={headerBg}
        p={6}
        borderRadius="lg"
        mb={8}
        position="relative"
        boxShadow="md"
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          mb={4}
        >
          <Box>
            <Flex align="center" mb={2}>
              <Heading as="h1" size="xl" mr={3}>
                {group.name}
              </Heading>
              {group.isPrivate && (
                <Badge colorScheme="gray" fontSize="md">Private</Badge>
              )}
            </Flex>
            <Badge 
              colorScheme={
                group.category === 'career_development' ? 'blue' :
                group.category === 'workplace_challenges' ? 'orange' :
                group.category === 'work_life_balance' ? 'green' :
                group.category === 'leadership' ? 'purple' :
                group.category === 'discrimination' ? 'red' :
                group.category === 'harassment' ? 'red' :
                group.category === 'mental_health' ? 'teal' :
                group.category === 'entrepreneurship' ? 'yellow' :
                group.category === 'negotiation' ? 'cyan' :
                'gray'
              }
              mb={4}
            >
              {group.category.replace('_', ' ')}
            </Badge>
          </Box>
          
          {!userIsMember && !joinRequestStatus && (
            <Button 
              colorScheme="purple" 
              onClick={handleJoinGroup}
              leftIcon={<FaUserPlus />}
            >
              Join Group
            </Button>
          )}
          
          {joinRequestStatus === 'pending' && (
            <Badge colorScheme="yellow" p={2} fontSize="md">
              Join Request Pending
            </Badge>
          )}
          
          {userIsMember && (
            <Button 
              colorScheme="red" 
              variant="outline" 
              onClick={handleLeaveGroup}
            >
              Leave Group
            </Button>
          )}
        </Flex>
        
        <Text mb={4}>{group.description}</Text>
        
        <Flex wrap="wrap" mb={4}>
          {group.topics.map((topic, i) => (
            <Tag key={i} colorScheme="purple" mr={2} mb={2}>
              {topic}
            </Tag>
          ))}
        </Flex>
        
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', md: 'center' }}
        >
          <HStack spacing={4} mb={{ base: 4, md: 0 }}>
            <Flex align="center">
              <FaUsers style={{ marginRight: '8px' }} />
              <Text>{group.members.length} members</Text>
            </Flex>
            <Flex align="center">
              <FaUserShield style={{ marginRight: '8px' }} />
              <Text>{group.moderators.length} moderators</Text>
            </Flex>
          </HStack>
          
          <AvatarGroup size="md" max={5}>
            {group.members.map((member) => (
              <Avatar 
                key={member.user._id}
                name={`${member.user.firstName} ${member.user.lastName}`}
                src={member.user.profileImage}
              />
            ))}
          </AvatarGroup>
        </Flex>
      </Flex>

      {/* Group Content */}
      <Tabs colorScheme="purple" isLazy>
        <TabList>
          <Tab><FaComments style={{ marginRight: '8px' }} /> Discussions</Tab>
          <Tab><FaInfoCircle style={{ marginRight: '8px' }} /> About</Tab>
          {userIsMember && userIsModerator && (
            <Tab><FaUserShield style={{ marginRight: '8px' }} /> Manage</Tab>
          )}
        </TabList>

        <TabPanels>
          {/* Discussions Tab */}
          <TabPanel p={4}>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading as="h2" size="lg">
                Discussions
              </Heading>
              
              {userIsMember && (
                <Button 
                  colorScheme="purple" 
                  leftIcon={<FaPlus />}
                  onClick={onCreateDiscussionOpen}
                >
                  New Discussion
                </Button>
              )}
            </Flex>

            {!userIsMember && group.isPrivate ? (
              <Box textAlign="center" py={10} bg={bg} borderRadius="md" p={6} boxShadow="sm">
                <Heading as="h3" size="md" mb={4}>
                  Join this group to view discussions
                </Heading>
                <Button 
                  colorScheme="purple" 
                  onClick={handleJoinGroup}
                  leftIcon={<FaUserPlus />}
                >
                  Join Group
                </Button>
              </Box>
            ) : discussionsLoading ? (
              <VStack spacing={4} align="stretch">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height="100px" />
                ))}
              </VStack>
            ) : discussions.length === 0 ? (
              <Box textAlign="center" py={10} bg={bg} borderRadius="md" p={6} boxShadow="sm">
                <Heading as="h3" size="md" mb={4}>
                  No discussions yet
                </Heading>
                {userIsMember && (
                  <Button 
                    colorScheme="purple" 
                    leftIcon={<FaPlus />}
                    onClick={onCreateDiscussionOpen}
                  >
                    Start a Discussion
                  </Button>
                )}
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {discussions.map((discussion) => (
                  <Box 
                    key={discussion._id} 
                    p={4} 
                    borderWidth="1px" 
                    borderRadius="md"
                    bg={bg}
                    boxShadow="sm"
                    transition="transform 0.2s"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                  >
                    <Flex justify="space-between" align="flex-start" mb={3}>
                      <Link to={`/support-groups/${groupId}/discussions/${discussion._id}`}>
                        <Heading as="h3" size="md">
                          {discussion.title}
                        </Heading>
                      </Link>
                      
                      <HStack>
                        <Badge colorScheme="blue">
                          {discussion.replies?.length || 0} replies
                        </Badge>
                        <Badge colorScheme="green">
                          {discussion.views} views
                        </Badge>
                      </HStack>
                    </Flex>
                    
                    <Text noOfLines={2} mb={4}>
                      {discussion.content}
                    </Text>
                    
                    <Flex justify="space-between" align="center">
                      <Flex align="center">
                        <Avatar 
                          size="sm" 
                          mr={2} 
                          src={discussion.isAnonymous ? 
                            discussion.anonymousPersona?.avatar : 
                            discussion.author?.profileImage
                          }
                          name={discussion.isAnonymous ? 
                            discussion.anonymousPersona?.displayName : 
                            `${discussion.author?.firstName} ${discussion.author?.lastName}`
                          }
                        />
                        <Text fontSize="sm">
                          {discussion.isAnonymous ? 
                            discussion.anonymousPersona?.displayName : 
                            `${discussion.author?.firstName} ${discussion.author?.lastName}`
                          }
                          <Text as="span" color="gray.500" ml={2}>
                            {new Date(discussion.createdAt).toLocaleDateString()}
                          </Text>
                        </Text>
                      </Flex>
                      
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="Support"
                          icon={<FaHeart />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          isDisabled={!userIsMember}
                        />
                        <IconButton
                          aria-label="Helpful"
                          icon={<FaThumbsUp />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          isDisabled={!userIsMember}
                        />
                        <IconButton
                          aria-label="Insightful"
                          icon={<FaLightbulb />}
                          size="sm"
                          variant="ghost"
                          colorScheme="yellow"
                          isDisabled={!userIsMember}
                        />
                      </HStack>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            )}
          </TabPanel>

          {/* About Tab */}
          <TabPanel p={4}>
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading as="h3" size="md" mb={4}>
                  Group Rules
                </Heading>
                
                {group.rules && group.rules.length > 0 ? (
                  <List spacing={3}>
                    {group.rules.map((rule, index) => (
                      <ListItem key={index} display="flex">
                        <ListIcon as={FaCheckCircle} color="green.500" mt={1} />
                        <Box>
                          <Text fontWeight="bold">{rule.title}</Text>
                          <Text>{rule.description}</Text>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Text>No specific rules have been set for this group.</Text>
                )}
              </Box>
              
              <Divider />
              
              <Box>
                <Heading as="h3" size="md" mb={4}>
                  Moderators
                </Heading>
                
                <Flex wrap="wrap" gap={4}>
                  {group.moderators.map((mod) => (
                    <Flex 
                      key={mod._id} 
                      direction="column" 
                      align="center" 
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                    >
                      <Avatar 
                        size="md" 
                        name={`${mod.firstName} ${mod.lastName}`}
                        src={mod.profileImage}
                        mb={2}
                      />
                      <Text fontWeight="bold">
                        {mod.firstName} {mod.lastName}
                      </Text>
                      <Badge colorScheme="purple">Moderator</Badge>
                    </Flex>
                  ))}
                </Flex>
              </Box>
              
              <Divider />
              
              {group.resourceLinks && group.resourceLinks.length > 0 && (
                <Box>
                  <Heading as="h3" size="md" mb={4}>
                    Resources
                  </Heading>
                  
                  <List spacing={3}>
                    {group.resourceLinks.map((resource, index) => (
                      <ListItem key={index}>
                        <Link href={resource.url} isExternal color="blue.500">
                          <Text fontWeight="bold">{resource.title}</Text>
                          {resource.description && (
                            <Text fontSize="sm">{resource.description}</Text>
                          )}
                        </Link>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </VStack>
          </TabPanel>

          {/* Manage Tab (for moderators only) */}
          {userIsModerator && (
            <TabPanel p={4}>
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading as="h3" size="md" mb={4}>
                    Group Management
                  </Heading>
                  
                  <Flex gap={4} wrap="wrap">
                    <Button 
                      as={Link} 
                      to={`/support-groups/${groupId}/edit`}
                      colorScheme="purple"
                    >
                      Edit Group Details
                    </Button>
                    
                    <Button 
                      as={Link} 
                      to={`/support-groups/${groupId}/members`}
                      colorScheme="blue"
                    >
                      Manage Members
                    </Button>
                    
                    {group.isPrivate && (
                      <Button 
                        as={Link} 
                        to={`/support-groups/${groupId}/requests`}
                        colorScheme="teal"
                      >
                        Join Requests
                      </Button>
                    )}
                  </Flex>
                </Box>
                
                <Divider />
                
                <Box>
                  <Heading as="h3" size="md" mb={4}>
                    Group Statistics
                  </Heading>
                  
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Box p={4} borderWidth="1px" borderRadius="md">
                      <Heading size="sm" mb={2}>Total Members</Heading>
                      <Text fontSize="2xl" fontWeight="bold">{group.members.length}</Text>
                    </Box>
                    <Box p={4} borderWidth="1px" borderRadius="md">
                      <Heading size="sm" mb={2}>Total Discussions</Heading>
                      <Text fontSize="2xl" fontWeight="bold">
                        {discussions ? discussions.length : '...'}
                      </Text>
                    </Box>
                    <Box p={4} borderWidth="1px" borderRadius="md">
                      <Heading size="sm" mb={2}>Group Created</Heading>
                      <Text>{new Date(group.createdAt).toLocaleDateString()}</Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              </VStack>
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>

      {/* Create Discussion Modal */}
      <Modal isOpen={isCreateDiscussionOpen} onClose={onCreateDiscussionClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Discussion</ModalHeader>
          <ModalCloseButton />
          
          <form onSubmit={handleCreateDiscussion}>
            <ModalBody pb={6}>
              <FormControl mb={4} isRequired>
                <FormLabel>Title</FormLabel>
                <Input 
                  name="title"
                  value={newDiscussion.title}
                  onChange={handleDiscussionInputChange}
                  placeholder="Enter a title for your discussion"
                />
              </FormControl>
              
              <FormControl mb={4} isRequired>
                <FormLabel>Content</FormLabel>
                <Textarea 
                  name="content"
                  value={newDiscussion.content}
                  onChange={handleDiscussionInputChange}
                  placeholder="Share your thoughts, questions, or experiences..."
                  minHeight="200px"
                />
              </FormControl>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCreateDiscussionClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="purple" 
                type="submit"
              >
                Create Discussion
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default SupportGroupDetail; 