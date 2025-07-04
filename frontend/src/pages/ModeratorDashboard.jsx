import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Flex, 
  Badge, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Button, 
  Select, 
  Stack, 
  Input,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Textarea,
  FormControl,
  FormLabel,
  Image,
  Link,
  Grid,
  useToast
} from '@chakra-ui/react';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ModeratorDashboard = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering and pagination state
  const [status, setStatus] = useState('');
  const [reportType, setReportType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected report for detail view
  const [selectedReport, setSelectedReport] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Form state for updating reports
  const [resolution, setResolution] = useState({
    status: '',
    moderationNotes: '',
    resolutionAction: '',
  });

  // Redirect if not authenticated or not a moderator
  useEffect(() => {
    if (isAuthenticated && !user?.isModerator) {
      toast({
        title: "Access denied",
        description: "You don't have permission to access this page",
        status: "error",
        duration: 5000,
      });
      navigate('/');
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate, toast]);

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const params = {
          page,
          limit: 10,
        };

        if (status) params.status = status;
        if (reportType) params.reportType = reportType;

        const response = await axios.get('/api/reports', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        });

        setReports(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports');
        setLoading(false);
      }
    };

    fetchReports();
  }, [token, page, status, reportType]);

  // Handle viewing a report
  const handleViewReport = async (reportId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reports/${reportId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setSelectedReport(response.data.data);
      setResolution({
        status: response.data.data.status,
        moderationNotes: response.data.data.moderationNotes || '',
        resolutionAction: response.data.data.resolutionAction || '',
      });
      onOpen();
      setLoading(false);
    } catch (err) {
      console.error('Error fetching report details:', err);
      toast({
        title: "Error",
        description: "Could not retrieve report details",
        status: "error",
        duration: 3000,
      });
      setLoading(false);
    }
  };

  // Update report resolution
  const handleResolveReport = async () => {
    try {
      setLoading(true);
      await axios.put(`/api/reports/${selectedReport._id}`, resolution, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update reports list
      const updatedReports = reports.map(report => 
        report._id === selectedReport._id 
          ? { ...report, ...resolution } 
          : report
      );
      
      setReports(updatedReports);
      onClose();
      
      toast({
        title: "Report updated",
        description: `Report has been ${resolution.status}`,
        status: "success",
        duration: 3000,
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error updating report:', err);
      toast({
        title: "Update failed",
        description: err.response?.data?.error || "Could not update report",
        status: "error",
        duration: 5000,
      });
      setLoading(false);
    }
  };

  // Get badge color based on report status
  const getBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'under_review': return 'orange';
      case 'resolved': return 'green';
      case 'dismissed': return 'gray';
      default: return 'gray';
    }
  };

  // Get badge color based on report type severity
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'harassment': return 'red';
      case 'hate_speech': return 'red';
      case 'misinformation': return 'orange';
      case 'inappropriate_content': return 'orange';
      case 'impersonation': return 'purple';
      default: return 'blue';
    }
  };

  // Format report type for display
  const formatReportType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Container maxW="container.xl" py={6}>
      <Heading as="h1" mb={6}>Moderation Dashboard</Heading>
      
      {/* Filters */}
      <Flex mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Select 
            placeholder="Filter by status" 
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </Select>
        </Box>
        <Box>
          <Select 
            placeholder="Filter by type" 
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setPage(1);
            }}
          >
            <option value="harassment">Harassment</option>
            <option value="hate_speech">Hate Speech</option>
            <option value="misinformation">Misinformation</option>
            <option value="inappropriate_content">Inappropriate Content</option>
            <option value="impersonation">Impersonation</option>
            <option value="other">Other</option>
          </Select>
        </Box>
        <Box flexGrow={1}>
          <Flex>
            <Input
              placeholder="Search in reports"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IconButton
              ml={2}
              icon={<SearchIcon />}
              aria-label="Search reports"
              onClick={() => console.log('Search functionality to be implemented')}
            />
          </Flex>
        </Box>
      </Flex>

      {/* Reports Table */}
      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Reporter</Th>
                <Th>Type</Th>
                <Th>Content</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th>Severity</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {reports.length > 0 ? (
                reports.map((report) => (
                  <Tr key={report._id}>
                    <Td>
                      {report.isAnonymous 
                        ? 'Anonymous User' 
                        : report.reporterUserId?.name || 'Unknown User'}
                    </Td>
                    <Td>
                      <Badge colorScheme={getTypeBadgeColor(report.reportType)}>
                        {formatReportType(report.reportType)}
                      </Badge>
                    </Td>
                    <Td>{report.contentType}</Td>
                    <Td>{new Date(report.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      <Badge colorScheme={getBadgeColor(report.status)}>
                        {formatReportType(report.status)}
                      </Badge>
                    </Td>
                    <Td>{Math.round(report.severityScore * 100)}</Td>
                    <Td>
                      <Button size="sm" onClick={() => handleViewReport(report._id)}>
                        View Details
                      </Button>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={7} textAlign="center">No reports found</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Pagination */}
      <Flex justifyContent="center" mt={6}>
        <Button
          leftIcon={<ChevronLeftIcon />}
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          mr={2}
        >
          Previous
        </Button>
        <Text alignSelf="center" mx={4}>
          Page {page} of {totalPages}
        </Text>
        <Button
          rightIcon={<ChevronRightIcon />}
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          ml={2}
        >
          Next
        </Button>
      </Flex>

      {/* Report Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Report Details
            {selectedReport && (
              <Badge ml={2} colorScheme={getBadgeColor(selectedReport.status)}>
                {formatReportType(selectedReport.status)}
              </Badge>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedReport && (
              <Tabs>
                <TabList>
                  <Tab>Details</Tab>
                  <Tab>Evidence</Tab>
                  <Tab>Resolution</Tab>
                </TabList>
                <TabPanels>
                  {/* Details Tab */}
                  <TabPanel>
                    <Stack spacing={4}>
                      <Box>
                        <Text fontWeight="bold">Report Type:</Text>
                        <Badge colorScheme={getTypeBadgeColor(selectedReport.reportType)}>
                          {formatReportType(selectedReport.reportType)}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">Content Type:</Text>
                        <Text>{selectedReport.contentType}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">Reported On:</Text>
                        <Text>{new Date(selectedReport.createdAt).toLocaleString()}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">Reporter:</Text>
                        <Text>
                          {selectedReport.isAnonymous 
                            ? `Anonymous (Hash: ${selectedReport.reporterPersonaHash})` 
                            : selectedReport.reporterUserId?.name || 'Unknown User'}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">Reported User:</Text>
                        <Text>
                          {selectedReport.isAnonymous 
                            ? `Content Hash: ${selectedReport.reportedContentHash}` 
                            : selectedReport.reportedUserId?.name || 'Unknown User'}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">Description:</Text>
                        <Text whiteSpace="pre-wrap">{selectedReport.description}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">AI Moderation:</Text>
                        {selectedReport.aiModerated ? (
                          <Stack>
                            <Text>
                              Confidence Score: {selectedReport.aiConfidenceScore?.toFixed(2) || 'N/A'}
                            </Text>
                            {selectedReport.aiCategories?.length > 0 && (
                              <Flex flexWrap="wrap" gap={2}>
                                {selectedReport.aiCategories.map((category, i) => (
                                  <Badge key={i} colorScheme="purple">
                                    {category}
                                  </Badge>
                                ))}
                              </Flex>
                            )}
                          </Stack>
                        ) : (
                          <Text>Not analyzed by AI</Text>
                        )}
                      </Box>
                    </Stack>
                  </TabPanel>

                  {/* Evidence Tab */}
                  <TabPanel>
                    <Stack spacing={4}>
                      {selectedReport.evidence?.screenshots?.length > 0 ? (
                        <Box>
                          <Text fontWeight="bold" mb={2}>Screenshots:</Text>
                          <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap={4}>
                            {selectedReport.evidence.screenshots.map((url, i) => (
                              <Image
                                key={i}
                                src={url}
                                alt={`Evidence ${i + 1}`}
                                borderRadius="md"
                              />
                            ))}
                          </Grid>
                        </Box>
                      ) : (
                        <Text>No screenshots provided</Text>
                      )}

                      {selectedReport.evidence?.links?.length > 0 ? (
                        <Box>
                          <Text fontWeight="bold" mb={2}>Related Links:</Text>
                          <Stack>
                            {selectedReport.evidence.links.map((link, i) => (
                              <Link key={i} href={link} isExternal color="blue.500">
                                {link}
                              </Link>
                            ))}
                          </Stack>
                        </Box>
                      ) : (
                        <Text>No links provided</Text>
                      )}

                      {selectedReport.evidence?.additionalInfo && (
                        <Box>
                          <Text fontWeight="bold">Additional Information:</Text>
                          <Text>{selectedReport.evidence.additionalInfo}</Text>
                        </Box>
                      )}
                    </Stack>
                  </TabPanel>

                  {/* Resolution Tab */}
                  <TabPanel>
                    <Stack spacing={4}>
                      <FormControl>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          value={resolution.status} 
                          onChange={(e) => setResolution({
                            ...resolution,
                            status: e.target.value
                          })}
                        >
                          <option value="pending">Pending</option>
                          <option value="under_review">Under Review</option>
                          <option value="resolved">Resolved</option>
                          <option value="dismissed">Dismissed</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Action</FormLabel>
                        <Select 
                          value={resolution.resolutionAction} 
                          onChange={(e) => setResolution({
                            ...resolution,
                            resolutionAction: e.target.value
                          })}
                        >
                          <option value="">Select Action</option>
                          <option value="warning">Send Warning</option>
                          <option value="content_removal">Remove Content</option>
                          <option value="temporary_ban">Temporary Ban</option>
                          <option value="permanent_ban">Permanent Ban</option>
                          <option value="none">No Action</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Moderation Notes</FormLabel>
                        <Textarea 
                          value={resolution.moderationNotes} 
                          onChange={(e) => setResolution({
                            ...resolution,
                            moderationNotes: e.target.value
                          })}
                          placeholder="Add notes about this resolution"
                        />
                      </FormControl>
                    </Stack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleResolveReport}
              isLoading={loading}
            >
              Save Resolution
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Container>
  );
};

export default ModeratorDashboard; 