import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Divider, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  AlertTitle,
  FormHelperText
} from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import apiClient from '../../services/apiClient';

const VerificationCard = styled(Paper)`
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  border-left: 4px solid #2C3E50;
`;

const UploadButton = styled(Button)`
  background-color: #2C3E50;
  &:hover {
    background-color: #1a2530;
  }
  margin-top: 16px;
`;

const FileInput = styled('input')`
  display: none;
`;

const UploadBox = styled(Box)`
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  margin-top: 16px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: #2C3E50;
    background-color: rgba(44, 62, 80, 0.05);
  }
`;

const StatusIcon = styled(Box)`
  display: flex;
  align-items: center;
  margin-top: 8px;
  color: ${props => {
    if (props.status === 'approved') return '#27AE60';
    if (props.status === 'pending_review') return '#F39C12';
    if (props.status === 'rejected') return '#E74C3C';
    return 'inherit';
  }};
  
  svg {
    margin-right: 8px;
  }
`;

const IdVerification = ({ isVerified, verificationData, onVerificationComplete }) => {
  const [idType, setIdType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  
  const handleIdTypeChange = (e) => {
    setIdType(e.target.value);
    setError(null);
  };
  
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a JPG, PNG, or PDF file.');
      return;
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return;
    }
    
    setSelectedFile(file);
    setError(null);
  };
  
  const handleUploadBoxClick = () => {
    fileInputRef.current.click();
  };
  
  const uploadIdDocument = async (e) => {
    e.preventDefault();
    
    if (!idType) {
      setError('Please select an ID type');
      return;
    }
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('idDocument', selectedFile);
      formData.append('idType', idType);
      
      await apiClient.post('/verification/id/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess(true);
      
      // If onVerificationComplete is provided, call it to refresh verification status
      if (onVerificationComplete) {
        onVerificationComplete();
      }
    } catch (err) {
      console.error('ID verification error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to upload ID document. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Determine status display information
  const getStatusInfo = () => {
    const status = verificationData?.status || 'pending_review';
    
    if (isVerified) {
      return {
        icon: <CheckCircleIcon />,
        text: 'Your ID has been verified',
        color: '#27AE60'
      };
    } else if (status === 'pending_review') {
      return {
        icon: <CloudUploadIcon style={{ color: '#F39C12' }} />,
        text: 'Your ID document is pending review',
        color: '#F39C12'
      };
    } else if (status === 'rejected') {
      return {
        icon: <BadgeIcon style={{ color: '#E74C3C' }} />,
        text: 'Your ID document was rejected. Please upload a different document.',
        color: '#E74C3C'
      };
    }
    
    return { icon: <BadgeIcon />, text: 'Upload your ID document', color: 'inherit' };
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <VerificationCard elevation={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" color="#2C3E50" style={{ display: 'flex', alignItems: 'center' }}>
          <BadgeIcon style={{ marginRight: '8px' }} />
          ID Verification
        </Typography>
        {isVerified && (
          <Typography variant="body2" style={{ color: '#27AE60', fontWeight: 'bold' }}>
            Verified
          </Typography>
        )}
      </Box>
      
      <Divider style={{ margin: '16px 0' }} />
      
      <Typography variant="body2" color="text.secondary">
        Upload a government-issued ID to verify your identity. This is the most secure
        form of verification and contributes significantly to your verification score.
        We prioritize your privacy and remove all metadata from your ID document.
      </Typography>
      
      {isVerified || verificationData?.status ? (
        <Box mt={2}>
          <StatusIcon status={isVerified ? 'approved' : verificationData?.status}>
            {statusInfo.icon}
            <Typography variant="body2">
              {statusInfo.text}
            </Typography>
          </StatusIcon>
          
          {verificationData?.type && (
            <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius="8px">
              <Typography variant="body2">
                <strong>ID Type:</strong> {verificationData.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Typography>
              {verificationData.uploadedAt && (
                <Typography variant="body2" mt={1}>
                  <strong>Uploaded on:</strong> {new Date(verificationData.uploadedAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      ) : success ? (
        <Alert severity="success" sx={{ mt: 2 }}>
          <AlertTitle>ID Document Submitted</AlertTitle>
          Your ID document has been successfully uploaded and is pending review. This process typically takes 1-2 business days.
        </Alert>
      ) : (
        <form onSubmit={uploadIdDocument}>
          <FormControl fullWidth margin="normal" error={!!error && !idType}>
            <InputLabel id="id-type-label">ID Type</InputLabel>
            <Select
              labelId="id-type-label"
              value={idType}
              onChange={handleIdTypeChange}
              label="ID Type"
              disabled={loading}
            >
              <MenuItem value="passport">Passport</MenuItem>
              <MenuItem value="drivers_license">Driver's License</MenuItem>
              <MenuItem value="national_id">National ID Card</MenuItem>
              <MenuItem value="other">Other Government-Issued ID</MenuItem>
            </Select>
            {!!error && !idType && (
              <FormHelperText>Please select an ID type</FormHelperText>
            )}
          </FormControl>
          
          <FileInput
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          
          <UploadBox onClick={handleUploadBoxClick}>
            {selectedFile ? (
              <Typography variant="body1" color="primary">
                {selectedFile.name}
              </Typography>
            ) : (
              <>
                <CloudUploadIcon style={{ fontSize: 48, color: '#2C3E50', marginBottom: 8 }} />
                <Typography variant="body1">
                  Click to select or drop your ID document here
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  JPG, PNG or PDF (max 5MB)
                </Typography>
              </>
            )}
          </UploadBox>
          
          {error && (
            <Typography variant="body2" color="error" mt={2}>
              {error}
            </Typography>
          )}
          
          <UploadButton
            variant="contained"
            type="submit"
            disabled={loading || !selectedFile || !idType}
            fullWidth
            startIcon={<CloudUploadIcon />}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Upload ID Document'}
          </UploadButton>
        </form>
      )}
      
      <Typography variant="caption" color="text.secondary" mt={2} display="block">
        Your privacy is important to us. All metadata is stripped from your ID document 
        and it will only be used for verification purposes.
      </Typography>
    </VerificationCard>
  );
};

export default IdVerification; 