import React, { useState, useEffect } from 'react';
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
  Image,
  Input,
  Box,
  Flex,
  FormHelperText
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../context/AuthContext';
import { useReport } from '../../context/ReportContext';

/**
 * Global Report Modal that works with the ReportContext
 * Can be placed once in the app layout and controlled via context
 */
const ReportFormModal = () => {
  const toast = useToast();
  const { token } = useAuth();
  const { 
    isReportModalOpen, 
    reportConfig, 
    closeReportModal, 
    submitReport,
    loading
  } = useReport();
  
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [links, setLinks] = useState(['']);

  // Reset form when modal opens with new config
  useEffect(() => {
    if (isReportModalOpen) {
      setReportType('');
      setDescription('');
      setScreenshots([]);
      setLinks(['']);
    }
  }, [isReportModalOpen, reportConfig]);

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
      if (!reportType) {
        toast({
          title: "Error",
          description: "Please select a report type",
          status: "error",
          duration: 3000,
        });
        return;
      }

      if (!description || description.trim().length < 10) {
        toast({
          title: "Error",
          description: "Please provide a detailed description (minimum 10 characters)",
          status: "error",
          duration: 3000,
        });
        return;
      }

      // Upload screenshots if any
      let uploadedUrls = [];
      if (screenshots.length > 0) {
        const formData = new FormData();
        screenshots.forEach(file => formData.append('images', file));
        
        const uploadRes = await fetch('/api/uploads/images', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        const uploadData = await uploadRes.json();
        uploadedUrls = uploadData.urls;
      }

      // Filter out empty links
      const validLinks = links.filter(link => link.trim() !== '');

      // Create report object
      const reportData = {
        reportType,
        contentType: reportConfig.contentType,
        contentId: reportConfig.contentId,
        description,
        evidence: {
          screenshots: uploadedUrls,
          links: validLinks,
        },
        isAnonymous: reportConfig.isAnonymous,
      };

      // Add professional reporting data
      if (!reportConfig.isAnonymous) {
        reportData.reportedUserId = reportConfig.reportedUserId;
      } 
      // Add anonymous reporting data
      else {
        reportData.reporterPersonaHash = reportConfig.reporterPersonaHash;
        reportData.reportedContentHash = reportConfig.reportedContentHash;
      }

      // Submit report via context
      await submitReport(reportData);

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe",
        status: "success",
        duration: 5000,
      });

      // Close modal via context
      closeReportModal();
      
    } catch (error) {
      console.error("Report submission error:", error);
      toast({
        title: "Submission failed",
        description: error.response?.data?.error || "Could not submit your report",
        status: "error",
        duration: 5000,
      });
    }
  };

  return (
    <Modal isOpen={isReportModalOpen} onClose={closeReportModal} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {reportConfig?.isAnonymous 
            ? "Submit Anonymous Report" 
            : "Submit Report"}
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
          <Button variant="ghost" mr={3} onClick={closeReportModal}>
            Cancel
          </Button>
          <Button 
            colorScheme="red" 
            isLoading={loading} 
            onClick={handleSubmit}
          >
            Submit Report
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReportFormModal; 