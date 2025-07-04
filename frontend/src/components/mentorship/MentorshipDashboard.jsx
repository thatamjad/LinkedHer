import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Flex,
  Badge,
  Avatar,
  Divider,
  Icon,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Progress,
  VStack,
  HStack,
  SimpleGrid,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Checkbox,
  useDisclosure,
  Skeleton
} from '@chakra-ui/react';
import { 
  FaChevronDown, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaClock, 
  FaUserCheck,
  FaUserTimes,
  FaVideo,
  FaComments,
  FaStar,
  FaEdit,
  FaPlus
} from 'react-icons/fa';

const MentorshipDashboard = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('active');
  const [selectedMentorship, setSelectedMentorship] = useState(null);
  const [meetingData, setMeetingData] = useState({
    scheduledFor: '',
    duration: 30,
    meetingLink: ''
  });
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    feedback: ''
  });
  
  const { 
    isOpen: isMeetingModalOpen, 
    onOpen: onMeetingModalOpen, 
    onClose: onMeetingModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isFeedbackModalOpen, 
    onOpen: onFeedbackModalOpen, 
    onClose: onFeedbackModalClose 
  } = useDisclosure();

  useEffect(() => {
    fetchMentorships();
  }, [currentTab]);

  const fetchMentorships = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/mentorship/user-mentorships', {
        params: { status: currentTab === 'all' ? '' : currentTab }
      });
      setMentorships(response.data);
      setLoading(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load mentorships',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      setLoading(false);
    }
  };

  const handleTabChange = (index) => {
    const tabs = ['active', 'pending', 'completed', 'all'];
    setCurrentTab(tabs[index]);
  };

  const handleMeetingModalOpen = (mentorship) => {
    setSelectedMentorship(mentorship);
    setMeetingData({
      scheduledFor: '',
      duration: 30,
      meetingLink: ''
    });
    onMeetingModalOpen();
  };

  const handleFeedbackModalOpen = (mentorship) => {
    setSelectedMentorship(mentorship);
    setFeedbackData({
      rating: 5,
      feedback: ''
    });
    onFeedbackModalOpen();
  };

  const handleMeetingDataChange = (e) => {
    const { name, value } = e.target;
    setMeetingData({
      ...meetingData,
      [name]: value
    });
  };

  const handleFeedbackDataChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData({
      ...feedbackData,
      [name]: value
    });
  };

  const scheduleMeeting = async () => {
    try {
      if (!meetingData.scheduledFor) {
        toast({
          title: 'Missing information',
          description: 'Please select a date and time',
          status: 'warning',
          duration: 3000,
          isClosable: true
        });
        return;
      }
      
      await axios.post('/api/mentorship/schedule-meeting', {
        mentorshipId: selectedMentorship._id,
        scheduledFor: new Date(meetingData.scheduledFor).toISOString(),
        duration: parseInt(meetingData.duration),
        meetingLink: meetingData.meetingLink
      });
      
      toast({
        title: 'Success',
        description: 'Meeting scheduled successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      onMeetingModalClose();
      fetchMentorships();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to schedule meeting',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const provideFeedback = async () => {
    try {
      if (!feedbackData.feedback) {
        toast({
          title: 'Missing information',
          description: 'Please provide feedback',
          status: 'warning',
          duration: 3000,
          isClosable: true
        });
        return;
      }
      
      await axios.post('/api/mentorship/feedback', {
        mentorshipId: selectedMentorship._id,
        rating: parseInt(feedbackData.rating),
        feedback: feedbackData.feedback
      });
      
      toast({
        title: 'Success',
        description: 'Feedback submitted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      onFeedbackModalClose();
      fetchMentorships();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to submit feedback',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const completeMentorship = async (mentorshipId) => {
    try {
      await axios.put(`/api/mentorship/complete/${mentorshipId}`);
      
      toast({
        title: 'Success',
        description: 'Mentorship marked as completed',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      fetchMentorships();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to complete mentorship',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const respondToMentorshipRequest = async (mentorshipId, action) => {
    try {
      await axios.post('/api/mentorship/respond', {
        mentorshipId,
        action
      });
      
      toast({
        title: 'Success',
        description: `Mentorship request ${action === 'accept' ? 'accepted' : 'rejected'}`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      fetchMentorships();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to respond to request',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const updateMeetingStatus = async (mentorshipId, meetingId, status) => {
    try {
      await axios.put('/api/mentorship/meeting-status', {
        mentorshipId,
        meetingId,
        status
      });
      
      toast({
        title: 'Success',
        description: `Meeting marked as ${status}`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      fetchMentorships();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update meeting status',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const renderMentorshipCard = (mentorship) => {
    const isMentor = mentorship.mentor._id === localStorage.getItem('userId');
    const otherPerson = isMentor ? mentorship.mentee : mentorship.mentor;
    
    return (
      <Card key={mentorship._id} boxShadow="md" borderRadius="lg" overflow="hidden">
        <CardHeader bg="purple.50" p={4}>
          <Flex justify="space-between" align="center">
            <Flex align="center">
              <Avatar 
                src={otherPerson.profileImage} 
                name={`${otherPerson.firstName} ${otherPerson.lastName}`}
                mr={3}
              />
              <Box>
                <Heading size="md">
                  {otherPerson.firstName} {otherPerson.lastName}
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  {isMentor ? 'Mentee' : 'Mentor'}
                </Text>
              </Box>
            </Flex>
            
            <Badge 
              colorScheme={
                mentorship.status === 'active' ? 'green' :
                mentorship.status === 'pending' ? 'yellow' :
                mentorship.status === 'completed' ? 'blue' : 'red'
              }
              fontSize="sm"
              px={2}
              py={1}
            >
              {mentorship.status.toUpperCase()}
            </Badge>
          </Flex>
        </CardHeader>
        
        <CardBody p={4}>
          <Box mb={4}>
            <Text fontWeight="bold" mb={1}>Focus Areas:</Text>
            <Flex wrap="wrap">
              {mentorship.focusAreas.map((area, i) => (
                <Badge key={i} colorScheme="purple" mr={1} mb={1}>
                  {area}
                </Badge>
              ))}
            </Flex>
          </Box>
          
          <Box mb={4}>
            <Text fontWeight="bold" mb={1}>Goals:</Text>
            <VStack align="stretch" spacing={1}>
              {mentorship.goals.map((goal, i) => (
                <Flex key={i} align="center">
                  <Icon 
                    as={goal.isCompleted ? FaCheckCircle : FaCircle} 
                    color={goal.isCompleted ? "green.500" : "gray.300"} 
                    mr={2}
                  />
                  <Text>{goal.description}</Text>
                </Flex>
              ))}
            </VStack>
          </Box>
          
          {mentorship.meetings && mentorship.meetings.length > 0 && (
            <Box mb={4}>
              <Text fontWeight="bold" mb={1}>Upcoming Meetings:</Text>
              <VStack align="stretch" spacing={2}>
                {mentorship.meetings
                  .filter(meeting => meeting.status !== 'completed' && meeting.status !== 'cancelled')
                  .map((meeting, i) => (
                    <Box key={i} p={2} borderWidth="1px" borderRadius="md">
                      <Flex justify="space-between" align="center">
                        <Flex align="center">
                          <Icon as={FaCalendarAlt} mr={2} color="purple.500" />
                          <Text>
                            {new Date(meeting.scheduledFor).toLocaleDateString()} at{' '}
                            {new Date(meeting.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </Flex>
                        <Badge colorScheme={
                          meeting.status === 'scheduled' ? 'blue' :
                          meeting.status === 'rescheduled' ? 'yellow' : 'gray'
                        }>
                          {meeting.status}
                        </Badge>
                      </Flex>
                      
                      <Flex mt={2} justify="space-between" align="center">
                        <Flex align="center">
                          <Icon as={FaClock} mr={2} color="blue.500" />
                          <Text>{meeting.duration} minutes</Text>
                        </Flex>
                        
                        <Menu>
                          <MenuButton as={Button} size="sm" rightIcon={<FaChevronDown />}>
                            Actions
                          </MenuButton>
                          <MenuList>
                            {meeting.meetingLink && (
                              <MenuItem 
                                as="a" 
                                href={meeting.meetingLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                icon={<FaVideo />}
                              >
                                Join Meeting
                              </MenuItem>
                            )}
                            <MenuItem 
                              icon={<FaCheckCircle />}
                              onClick={() => updateMeetingStatus(mentorship._id, meeting._id, 'completed')}
                            >
                              Mark Completed
                            </MenuItem>
                            <MenuItem 
                              icon={<FaUserTimes />}
                              onClick={() => updateMeetingStatus(mentorship._id, meeting._id, 'cancelled')}
                            >
                              Cancel Meeting
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Flex>
                    </Box>
                  ))}
              </VStack>
            </Box>
          )}
        </CardBody>
        
        <Divider />
        
        <CardFooter p={4}>
          {mentorship.status === 'pending' && isMentor ? (
            <Flex width="100%" justify="space-between">
              <Button 
                colorScheme="green" 
                onClick={() => respondToMentorshipRequest(mentorship._id, 'accept')}
                leftIcon={<FaUserCheck />}
              >
                Accept
              </Button>
              <Button 
                colorScheme="red" 
                variant="outline"
                onClick={() => respondToMentorshipRequest(mentorship._id, 'reject')}
                leftIcon={<FaUserTimes />}
              >
                Decline
              </Button>
            </Flex>
          ) : mentorship.status === 'active' ? (
            <Flex width="100%" justify="space-between" wrap="wrap" gap={2}>
              <Button 
                colorScheme="purple" 
                leftIcon={<FaCalendarAlt />}
                onClick={() => handleMeetingModalOpen(mentorship)}
              >
                Schedule Meeting
              </Button>
              <Button 
                colorScheme="blue" 
                variant="outline"
                leftIcon={<FaComments />}
                as={Link}
                to={`/messages/${isMentor ? mentorship.mentee._id : mentorship.mentor._id}`}
              >
                Message
              </Button>
              <Button 
                colorScheme="teal" 
                variant="outline"
                leftIcon={<FaStar />}
                onClick={() => handleFeedbackModalOpen(mentorship)}
              >
                Provide Feedback
              </Button>
              <Button 
                colorScheme="gray" 
                variant="outline"
                leftIcon={<FaCheckCircle />}
                onClick={() => completeMentorship(mentorship._id)}
              >
                Complete
              </Button>
            </Flex>
          ) : mentorship.status === 'completed' ? (
            <VStack align="stretch" width="100%" spacing={3}>
              {(isMentor && !mentorship.feedback.mentorFeedback) || 
               (!isMentor && !mentorship.feedback.menteeFeedback) ? (
                <Button 
                  colorScheme="purple" 
                  leftIcon={<FaStar />}
                  onClick={() => handleFeedbackModalOpen(mentorship)}
                >
                  Provide Final Feedback
                </Button>
              ) : (
                <Box p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
                  <Flex align="center" mb={2}>
                    <Icon as={FaStar} color="yellow.400" mr={2} />
                    <Text fontWeight="bold">
                      Your Feedback
                    </Text>
                  </Flex>
                  <Text>
                    {isMentor ? mentorship.feedback.mentorFeedback : mentorship.feedback.menteeFeedback}
                  </Text>
                </Box>
              )}
            </VStack>
          ) : null}
        </CardFooter>
      </Card>
    );
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading as="h1" size="xl">
          My Mentorships
        </Heading>
        
        <Button 
          as={Link} 
          to="/mentorship/mentors" 
          colorScheme="purple" 
          leftIcon={<FaPlus />}
        >
          Find a Mentor
        </Button>
      </Flex>
      
      <Tabs onChange={handleTabChange} colorScheme="purple" mb={8}>
        <TabList>
          <Tab>Active</Tab>
          <Tab>Pending</Tab>
          <Tab>Completed</Tab>
          <Tab>All</Tab>
        </TabList>
        
        <TabPanels>
          {/* Active Mentorships */}
          <TabPanel>
            {loading ? (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {[1, 2].map(i => (
                  <Skeleton key={i} height="400px" borderRadius="lg" />
                ))}
              </SimpleGrid>
            ) : mentorships.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Heading as="h3" size="md" mb={4}>
                  No active mentorships
                </Heading>
                <Text mb={6}>You don't have any active mentorships at the moment.</Text>
                <Button 
                  as={Link} 
                  to="/mentorship/mentors" 
                  colorScheme="purple"
                >
                  Find a Mentor
                </Button>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {mentorships.map(mentorship => renderMentorshipCard(mentorship))}
              </SimpleGrid>
            )}
          </TabPanel>
          
          {/* Pending Mentorships */}
          <TabPanel>
            {loading ? (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {[1, 2].map(i => (
                  <Skeleton key={i} height="400px" borderRadius="lg" />
                ))}
              </SimpleGrid>
            ) : mentorships.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Heading as="h3" size="md" mb={4}>
                  No pending mentorships
                </Heading>
                <Text>You don't have any pending mentorship requests.</Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {mentorships.map(mentorship => renderMentorshipCard(mentorship))}
              </SimpleGrid>
            )}
          </TabPanel>
          
          {/* Completed Mentorships */}
          <TabPanel>
            {loading ? (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {[1, 2].map(i => (
                  <Skeleton key={i} height="400px" borderRadius="lg" />
                ))}
              </SimpleGrid>
            ) : mentorships.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Heading as="h3" size="md" mb={4}>
                  No completed mentorships
                </Heading>
                <Text>You haven't completed any mentorships yet.</Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {mentorships.map(mentorship => renderMentorshipCard(mentorship))}
              </SimpleGrid>
            )}
          </TabPanel>
          
          {/* All Mentorships */}
          <TabPanel>
            {loading ? (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {[1, 2].map(i => (
                  <Skeleton key={i} height="400px" borderRadius="lg" />
                ))}
              </SimpleGrid>
            ) : mentorships.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Heading as="h3" size="md" mb={4}>
                  No mentorships found
                </Heading>
                <Text mb={6}>You haven't participated in any mentorships yet.</Text>
                <Button 
                  as={Link} 
                  to="/mentorship/mentors" 
                  colorScheme="purple"
                >
                  Find a Mentor
                </Button>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {mentorships.map(mentorship => renderMentorshipCard(mentorship))}
              </SimpleGrid>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Schedule Meeting Modal */}
      <Modal isOpen={isMeetingModalOpen} onClose={onMeetingModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Schedule a Meeting</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Date and Time</FormLabel>
              <Input
                type="datetime-local"
                name="scheduledFor"
                value={meetingData.scheduledFor}
                onChange={handleMeetingDataChange}
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Duration (minutes)</FormLabel>
              <Select
                name="duration"
                value={meetingData.duration}
                onChange={handleMeetingDataChange}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
              </Select>
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Meeting Link (optional)</FormLabel>
              <Input
                type="url"
                name="meetingLink"
                value={meetingData.meetingLink}
                onChange={handleMeetingDataChange}
                placeholder="https://zoom.us/j/..."
              />
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onMeetingModalClose}>
              Cancel
            </Button>
            <Button colorScheme="purple" onClick={scheduleMeeting}>
              Schedule Meeting
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Feedback Modal */}
      <Modal isOpen={isFeedbackModalOpen} onClose={onFeedbackModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Provide Feedback</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Rating</FormLabel>
              <Flex>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    as={FaStar}
                    boxSize={8}
                    color={star <= feedbackData.rating ? "yellow.400" : "gray.200"}
                    cursor="pointer"
                    mr={1}
                    onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                  />
                ))}
              </Flex>
            </FormControl>
            
            <FormControl mb={4} isRequired>
              <FormLabel>Feedback</FormLabel>
              <Textarea
                name="feedback"
                value={feedbackData.feedback}
                onChange={handleFeedbackDataChange}
                placeholder="Share your experience and thoughts..."
                rows={6}
              />
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onFeedbackModalClose}>
              Cancel
            </Button>
            <Button colorScheme="purple" onClick={provideFeedback}>
              Submit Feedback
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default MentorshipDashboard; 