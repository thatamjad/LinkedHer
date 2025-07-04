import React from 'react';
import { IconButton, useDisclosure, Tooltip } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { useAuth } from '../../context/AuthContext';
import ReportModal from './ReportModal';

/**
 * Report Button component that can be used throughout the app
 * Opens a report modal when clicked
 */
const ReportButton = ({ 
  contentType, // 'post', 'comment', 'profile', or 'message'
  contentId,
  reportedUserId,
  isAnonymous = false,
  reporterPersonaHash = null,
  reportedContentHash = null,
  iconSize = "sm",
  tooltipLabel = "Report",
  buttonProps = {},
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuthenticated } = useAuth();

  // If user is not authenticated, don't show report button
  if (!isAuthenticated) return null;

  return (
    <>
      <Tooltip label={tooltipLabel}>
        <IconButton
          icon={<WarningIcon />}
          variant="ghost"
          colorScheme="red"
          size={iconSize}
          aria-label="Report content"
          onClick={onOpen}
          {...buttonProps}
        />
      </Tooltip>
      
      <ReportModal
        isOpen={isOpen}
        onClose={onClose}
        contentType={contentType}
        contentId={contentId}
        reportedUserId={reportedUserId}
        isAnonymous={isAnonymous}
        reporterPersonaHash={reporterPersonaHash}
        reportedContentHash={reportedContentHash}
      />
    </>
  );
};

export default ReportButton; 