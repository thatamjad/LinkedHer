import React, { useState, useEffect } from 'react';
import { 
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip,
  Avatar,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Zoom,
  Fade,
  Grow
} from '@mui/material';
import { 
  AccountCircle, 
  MeetingRoom, 
  Add, 
  Masks,
  Security,
  VisibilityOff,
  Fingerprint,
  TransitEnterexit as TransitionIcon
} from '@mui/icons-material';
import { useAnonymous } from '../../context/AnonymousContext';
import { useNavigate } from 'react-router-dom';

const ModeToggle = () => {
  const navigate = useNavigate();
  const { 
    anonymousMode,
    activePersona,
    personas,
    switchPersona,
    exitAnonymousMode,
    createPersona
  } = useAnonymous();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchingTarget, setSwitchingTarget] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState(null);
  const [switchProgress, setSwitchProgress] = useState(0);
  
  // Animation for switching modes
  useEffect(() => {
    let timer;
    if (isSwitching) {
      timer = setInterval(() => {
        setSwitchProgress((prevProgress) => {
          const newProgress = prevProgress + 10;
          if (newProgress >= 100) {
            clearInterval(timer);
            return 100;
          }
          return newProgress;
        });
      }, 50);
    } else {
      setSwitchProgress(0);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSwitching]);
  
  // Complete the switching process after animation
  useEffect(() => {
    if (switchProgress === 100 && isSwitching && switchingTarget !== null) {
      const completeSwitching = async () => {
        try {
          if (switchingTarget === 'exit') {
            exitAnonymousMode();
            navigate('/');
          } else if (switchingTarget === 'new') {
            const result = await createPersona();
            await switchPersona(result.persona.personaId);
            navigate('/anonymous');
          } else {
            await switchPersona(switchingTarget);
            navigate('/anonymous');
          }
        } catch (err) {
          console.error('Error during mode switching:', err);
        } finally {
          setIsSwitching(false);
          setSwitchingTarget(null);
        }
      };
      
      completeSwitching();
    }
  }, [switchProgress, isSwitching, switchingTarget, navigate, exitAnonymousMode, switchPersona, createPersona]);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Show confirmation dialog before switching
  const handleConfirmSwitch = (personaId) => {
    setSelectedPersonaId(personaId);
    setConfirmDialogOpen(true);
    handleClose();
  };
  
  const handleCreatePersona = () => {
    handleClose();
    startSwitching('new');
  };
  
  const handleManagePersonas = () => {
    handleClose();
    navigate('/anonymous/personas');
  };
  
  // Start mode switching with animation
  const startSwitching = (target) => {
    setIsSwitching(true);
    setSwitchingTarget(target);
    setConfirmDialogOpen(false);
  };
  
  const handleSwitchPersona = (personaId) => {
    handleClose();
    startSwitching(personaId);
  };
  
  const handleExitAnonymous = () => {
    handleClose();
    startSwitching('exit');
  };
  
  // Tooltip text based on the current mode
  const tooltipText = anonymousMode 
    ? `Active: ${activePersona?.name || 'Anonymous'}`
    : 'Switch to Anonymous Mode';
  
  // Icon based on the current mode  
  const ModeIcon = anonymousMode ? Masks : AccountCircle;
  
  // Avatar color based on the current mode
  const avatarColor = anonymousMode ? '#9C27B0' : '#8B5FBF';
  
  return (
    <>
      <Tooltip title={tooltipText}>
        <IconButton 
          onClick={handleClick}
          size="large"
          disabled={isSwitching}
          sx={{ 
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: anonymousMode ? 'rotate(360deg)' : 'rotate(0deg)',
            position: 'relative',
          }}
        >
          {isSwitching ? (
            <CircularProgress 
              variant="determinate" 
              value={switchProgress} 
              size={40} 
              color={anonymousMode ? "secondary" : "primary"}
            />
          ) : (
            <Zoom in={!isSwitching} timeout={300}>
              <Avatar 
                sx={{ 
                  bgcolor: avatarColor,
                  width: 40,
                  height: 40,
                  transition: 'background-color 0.3s ease-in-out',
                }}
              >
                <ModeIcon />
              </Avatar>
            </Zoom>
          )}
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 300,
            maxHeight: 500,
            borderRadius: 2,
            mt: 1.5,
            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.15)',
            overflow: 'visible',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 24,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        TransitionComponent={Fade}
        transitionDuration={200}
      >
        <Grow in={Boolean(anchorEl)} timeout={200}>
          <Box>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {anonymousMode ? 'Anonymous Mode Active' : 'Professional Mode Active'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {anonymousMode 
                  ? 'Your identity is hidden from other users'
                  : 'Your professional profile is visible to all users'
                }
              </Typography>
            </Box>
            
            {anonymousMode ? (
              <>
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current Persona
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#9C27B0' }}>
                      <Fingerprint />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {activePersona?.name || 'Anonymous'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {activePersona?.personaId?.slice(-6) || 'Unknown'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <MenuItem onClick={handleManagePersonas}>
                  <ListItemIcon>
                    <Masks fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Manage Personas" />
                </MenuItem>
                
                <MenuItem onClick={handleExitAnonymous}>
                  <ListItemIcon>
                    <MeetingRoom fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Exit Anonymous Mode" />
                </MenuItem>
              </>
            ) : (
              <>
                <Typography variant="body2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
                  Your Personas
                </Typography>
                
                {personas.length > 0 ? (
                  personas.map(persona => (
                    <MenuItem 
                      key={persona.personaId}
                      onClick={() => handleConfirmSwitch(persona.personaId)}
                    >
                      <ListItemIcon>
                        <Masks fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={persona.name} 
                        secondary={`ID: ${persona.personaId.slice(-6)}`}
                      />
                    </MenuItem>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ px: 2, py: 1, color: 'text.secondary', fontStyle: 'italic' }}>
                    No personas created yet
                  </Typography>
                )}
                
                <MenuItem onClick={handleCreatePersona}>
                  <ListItemIcon>
                    <Add fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Create New Persona" />
                </MenuItem>
                
                <Box sx={{ p: 2, mt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Anonymous Mode Features
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VisibilityOff fontSize="small" color="disabled" />
                      <Typography variant="body2">Hidden Identity</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Security fontSize="small" color="disabled" />
                      <Typography variant="body2">Metadata Stripping</Typography>
                    </Box>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Grow>
      </Menu>
      
      {/* Confirmation dialog for switching personas */}
      <Dialog 
        open={confirmDialogOpen} 
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 1
          }
        }}
      >
        <DialogTitle>Switch to Anonymous Mode</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            You are about to switch to anonymous mode. Your activity will no longer be linked to your professional profile.
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mt: 2,
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1
          }}>
            <TransitionIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="body2">
              Switching modes maintains your session but changes your visible identity to others.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialogOpen(false)} 
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleSwitchPersona(selectedPersonaId)} 
            variant="contained" 
            color="primary"
            startIcon={<Masks />}
          >
            Switch Mode
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ModeToggle; 