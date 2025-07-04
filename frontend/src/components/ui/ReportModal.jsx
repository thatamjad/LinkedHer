import React, { useState } from 'react';
import axios from 'axios';
import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalFooter, 
  ModalBody, 
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Text,
  VStack,
  useToast,
  RadioGroup,
  Radio,
  Image,
  Input,
  Box,
  Flex,
  FormHelperText
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../context/AuthContext';

/**
 * ReportModal component for reporting content
 * Works for both professional and anonymous mode
 */
const ReportModal = ({ 
  isOpen, 
  onClose, 
  contentType, 
  contentId, 
  reportedUserId, 
  isAnonymous = false,
  reporterPersonaHash = null,
  reportedContentHash = null,
}) => {
  const toast = useToast();
  const { token } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [links, setLinks] = useState(['']);

  // Dropzone for screenshots
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    maxFiles: 3,
    onDrop: (acceptedFiles) => {
      if (screenshots.length + acceptedFiles.length > 3) {
        toast({
          title: "Too many files",
          description: "Maximum of 3 images allowed",
          status: "error",
          duration: 3000,
        });
        return;
      }
      setScreenshots([
        ...screenshots,
        ...acceptedFiles.map(file => Object.assign(file, {
          preview: URL.createObjectURL(file)
        }))
      ]);
    }
  });

  const handleAddLink = () => {
    setLinks([...links, '']);
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const removeScreenshot = (index) => {
    const newScreenshots = [...screenshots];
    URL.revokeObjectURL(newScreenshots[index].preview);
    newScreenshots.splice(index, 1);
    setScreenshots(newScreenshots);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!reportType) {
        toast({
          title: "Error",
          description: "Please select a report type",
          status: "error",
          duration: 3000,
        });
        setIsSubmitting(false);
        return;
      }

      if (!description || description.trim().length < 10) {
        toast({
          title: "Error",
          description: "Please provide a detailed description (minimum 10 characters)",
          status: "error",
          duration: 3000,
        });
        setIsSubmitting(false);
        return;
      }

      // Upload screenshots if any
      let uploadedUrls = [];
      if (screenshots.length > 0) {
        const formData = new FormData();
        screenshots.forEach(file => formData.append('images', file));
        
        const uploadRes = await axios.post('/api/uploads/images', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        uploadedUrls = uploadRes.data.urls;
      }

      // Filter out empty links
      const validLinks = links.filter(link => link.trim() !== '');

      // Create report object
      const reportData = {
        reportType,
        contentType,
        contentId,
        description,
        evidence: {
          screenshots: uploadedUrls,
          links: validLinks,
        },
        isAnonymous,
      };

      // Add professional reporting data
      if (!isAnonymous) {
        reportData.reportedUserId = reportedUserId;
      } 
      // Add anonymous reporting data
      else {
        reportData.reporterPersonaHash = reporterPersonaHash;
        reportData.reportedContentHash = reportedContentHash;
      }

      // Submit report
      const response = await axios.post('/api/reports', reportData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe",
        status: "success",
        duration: 5000,
      });

      // Clean up and close modal
      setReportType('');
      setDescription('');
      setScreenshots([]);
      setLinks(['']);
      onClose();
      
    } catch (error) {
      console.error("Report submission error:", error);
      toast({
        title: "Submission failed",
        description: error.response?.data?.error || "Could not submit your report",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isAnonymous ? "Submit Anonymous Report" : "Submit Report"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="start">
            <Text fontSize="sm">
              Please provide details about why you're reporting this content. 
              All reports are confidential.
            </Text>

            <FormControl isRequired>
              <FormLabel>Report Type</FormLabel>
              <Select 
                placeholder="Select reason for reporting"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="harassment">Harassment</option>
                <option value="hate_speech">Hate Speech</option>
                <option value="misinformation">Misinformation</option>
                <option value="inappropriate_content">Inappropriate Content</option>
                <option value="impersonation">Impersonation</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Please provide detailed information about the issue"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <FormHelperText>
                Be specific about what violates our community guidelines
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Evidence (Optional)</FormLabel>
              
              {/* Screenshot upload area */}
              <Box
                {...getRootProps()}
                p={4}
                border="1px dashed"
                borderColor="gray.300"
                borderRadius="md"
                mb={3}
                cursor="pointer"
              >
                <input {...getInputProps()} />
                <Text textAlign="center">
                  Drag screenshots here or click to select files (max: 3)
                </Text>
              </Box>

              {/* Preview screenshots */}
              {screenshots.length > 0 && (
                <Flex flexWrap="wrap" gap={2} mb={4}>
                  {screenshots.map((file, index) => (
                    <Box key={index} position="relative">
                      <Image
                        src={file.preview}
                        alt={`Screenshot ${index + 1}`}
                        boxSize="100px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                      <Button
                        position="absolute"
                        top="0"
                        right="0"
                        size="xs"
                        onClick={() => removeScreenshot(index)}
                      >
                        X
                      </Button>
                    </Box>
                  ))}
                </Flex>
              )}

              {/* Links section */}
              <Text mt={2} mb={2}>Related links (Optional)</Text>
              {links.map((link, index) => (
                <Input
                  key={index}
                  placeholder="https://"
                  mb={2}
                  value={link}
                  onChange={(e) => handleLinkChange(index, e.target.value)}
                />
              ))}
              {links.length < 3 && (
                <Button size="sm" onClick={handleAddLink}>
                  Add another link
                </Button>
              )}
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="red" 
            isLoading={isSubmitting} 
            onClick={handleSubmit}
          >
            Submit Report
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReportModal; 