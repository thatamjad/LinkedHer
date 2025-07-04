import React, { useState } from 'react';
import { 
  Box, 
  Switch, 
  Typography, 
  Tooltip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  CircularProgress,
  Paper,
  IconButton,
  Slide,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAnonymous } from '../../context/AnonymousContext';
import { useAuth } from '../../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import MaskIcon from '@mui/icons-material/Masks';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ModeToggle = () => {
  const { currentUser } = useAuth();
  const { 
    anonymousMode, 
    activePersona, 
    exitAnonymousMode, 
    personas, 
    loading,
    getTargetLocation
  } = useAnonymous();
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Check if the user is verified (required for anonymous mode)
  const isVerified = currentUser?.verificationStatus === 'VERIFIED';
  
  const handleSwitchChange = () => {
    if (anonymousMode) {
      // Switch back to professional mode
      exitAnonymousMode();
      navigate(getTargetLocation('/'));
    } else {
      // If not verified, show verification required message
      if (!isVerified) {
        setInfoDialogOpen(true);
        return;
      }
      
      // If no personas or multiple personas, show selection dialog
      if (!activePersona || personas.length > 1) {
        setDialogOpen(true);
      } else if (personas.length === 1) {
        // If only one persona, switch directly
        navigate('/anonymous/personas');
      } else {
        // No personas, redirect to create one
        navigate('/anonymous/personas');
      }
    }
  };
  
  const handleInfoClose = () => {
    setInfoDialogOpen(false);
  };
  
  const handleVerificationRedirect = () => {
    setInfoDialogOpen(false);
    navigate('/verification');
  };
  
  const handleDialogClose = () => {
    setDialogOpen(false);
  };
  
  const handlePersonaSelect = () => {
    setDialogOpen(false);
    navigate('/anonymous/personas');
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: isMobile ? 1 : 1.5,
          borderRadius: 100,
          backgroundColor: anonymousMode ? 'rgba(139, 95, 191, 0.1)' : 'rgba(25, 118, 210, 0.05)'
        }}
      >
        <Tooltip title={anonymousMode ? "Active: Anonymous Mode" : "Active: Professional Mode"}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: anonymousMode ? 'secondary.main' : 'primary.main'
          }}>
            {anonymousMode ? <MaskIcon /> : <PersonIcon />}
            {!isMobile && (
              <Typography 
                variant="body2" 
                sx={{ ml: 1, fontWeight: 'medium' }}
              >
                {anonymousMode ? 'Anonymous' : 'Professional'}
              </Typography>
            )}
          </Box>
        </Tooltip>
        
        <Tooltip title="Switch Mode">
          <Box sx={{ mx: 1 }}>
            <Switch
              checked={anonymousMode}
              onChange={handleSwitchChange}
              disabled={loading}
              color={anonymousMode ? 'secondary' : 'primary'}
              size={isMobile ? 'small' : 'medium'}
            />
          </Box>
        </Tooltip>
        
        <Tooltip title="Mode Info">
          <IconButton 
            size="small" 
            onClick={() => setInfoDialogOpen(true)}
            sx={{ color: anonymousMode ? 'secondary.main' : 'primary.main' }}
          >
            <InfoIcon fontSize={isMobile ? 'small' : 'medium'} />
          </IconButton>
        </Tooltip>
      </Paper>
      
      {/* Personas Selection Dialog */}
      <Dialog
        open={dialogOpen}
        TransitionComponent={Transition}
        onClose={handleDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Choose Anonymous Persona</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            You need to select or create an anonymous persona to enter anonymous mode.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handlePersonaSelect} 
            variant="contained" 
            color="secondary"
            startIcon={loading ? <CircularProgress size={20} /> : <MaskIcon />}
            disabled={loading}
          >
            Select Persona
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Verification Info Dialog */}
      <Dialog
        open={infoDialogOpen}
        TransitionComponent={Transition}
        onClose={handleInfoClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {isVerified ? "About Mode Switching" : "Verification Required"}
        </DialogTitle>
        <DialogContent>
          {isVerified ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Your account is verified and you can use both modes.
                </Typography>
              </Box>
              
              <Typography variant="body2" paragraph>
                <strong>Professional Mode:</strong> Your real identity is visible to others.
              </Typography>
              
              <Typography variant="body2" paragraph>
                <strong>Anonymous Mode:</strong> You interact using an anonymous persona that cannot be linked to your professional profile.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BlockIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="body2" color="error">
                  Account verification required for anonymous mode.
                </Typography>
              </Box>
              
              <Typography variant="body2" paragraph>
                To protect our community and prevent abuse, you must verify your professional identity before using anonymous mode.
              </Typography>
              
              <Typography variant="body2">
                Complete verification to unlock all platform features.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInfoClose} color="inherit">
            Close
          </Button>
          {!isVerified && (
            <Button 
              onClick={handleVerificationRedirect} 
              variant="contained" 
              color="primary"
            >
              Verify Now
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ModeToggle; 