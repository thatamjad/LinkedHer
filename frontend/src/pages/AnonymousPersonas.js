import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  Grid, 
  Avatar, 
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Divider,
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAnonymous } from '../context/AnonymousContext';
import { Add, Edit, Delete, Masks, PersonOff, Security } from '@mui/icons-material';

// This is a placeholder component that will be expanded in the next phase
const AnonymousPersonas = () => {
  const { 
    personas, 
    loading, 
    error, 
    createPersona, 
    deletePersona, 
    switchPersona, 
    activePersona,
    updatePersona 
  } = useAnonymous();
  
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [editDialog, setEditDialog] = useState({ open: false, persona: null });
  const [createDialog, setCreateDialog] = useState(false);
  const [formData, setFormData] = useState({ displayName: '', avatarUrl: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [securityInfo, setSecurityInfo] = useState(false);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Open create persona dialog
  const openCreateDialog = () => {
    setFormData({ displayName: '', avatarUrl: '' });
    setCreateDialog(true);
  };
  
  // Close create persona dialog
  const closeCreateDialog = () => {
    setCreateDialog(false);
  };
  
  // Open edit persona dialog
  const openEditDialog = (persona) => {
    setFormData({
      displayName: persona.displayName,
      avatarUrl: persona.avatarUrl || ''
    });
    setEditDialog({ open: true, persona });
  };
  
  // Close edit persona dialog
  const closeEditDialog = () => {
    setEditDialog({ open: false, persona: null });
  };
  
  // Create a new persona
  const handleCreatePersona = async () => {
    try {
      setIsCreating(true);
      const result = await createPersona(formData);
      setSnackbar({
        open: true,
        message: 'Anonymous persona created successfully',
        severity: 'success'
      });
      closeCreateDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to create anonymous persona',
        severity: 'error'
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  // Update existing persona
  const handleUpdatePersona = async () => {
    if (!editDialog.persona) return;
    
    try {
      setIsCreating(true);
      await updatePersona(editDialog.persona.personaId, formData);
      setSnackbar({
        open: true,
        message: 'Persona updated successfully',
        severity: 'success'
      });
      closeEditDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update persona',
        severity: 'error'
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  // Delete a persona
  const handleDeletePersona = async (personaId) => {
    if (window.confirm('Are you sure you want to delete this persona? This action cannot be undone.')) {
      try {
        await deletePersona(personaId);
        setSnackbar({
          open: true,
          message: 'Persona deleted successfully',
          severity: 'success'
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.message || 'Failed to delete persona',
          severity: 'error'
        });
      }
    }
  };
  
  // Switch to a persona
  const handleSwitchPersona = async (personaId) => {
    try {
      await switchPersona(personaId);
      setSnackbar({
        open: true,
        message: 'Switched to anonymous mode',
        severity: 'success'
      });
      navigate('/anonymous');
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to switch persona',
        severity: 'error'
      });
    }
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
          <Masks sx={{ mr: 1, color: 'secondary.main' }} />
          Anonymous Personas
        </Typography>
        
        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<Add />}
          onClick={openCreateDialog}
          disabled={isCreating || loading}
        >
          Create New Persona
        </Button>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'rgba(139, 95, 191, 0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Security color="secondary" sx={{ mr: 1, mt: 0.5 }} />
          <Box>
            <Typography variant="h6" gutterBottom>
              About Anonymous Mode
            </Typography>
            
            <Typography variant="body2" paragraph>
              Anonymous personas allow you to interact on the platform without revealing your professional identity.
              Each persona has its own cryptographic identity that cannot be traced back to your professional account.
            </Typography>
            
            <Button 
              variant="outlined" 
              color="secondary" 
              size="small" 
              onClick={() => setSecurityInfo(!securityInfo)}
              sx={{ mb: 1 }}
            >
              {securityInfo ? 'Hide Security Details' : 'Show Security Details'}
            </Button>
            
            {securityInfo && (
              <Box sx={{ mt: 2, bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  How We Protect Your Anonymous Identity:
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2">
                      Zero-knowledge proofs verify you're a legitimate user without revealing who you are
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Separate database partitions with encrypted links between identities
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Metadata stripping from all uploads in anonymous mode
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Different network paths for anonymous vs. professional requests
                    </Typography>
                  </li>
                </ul>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading && !isCreating ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {personas.map((persona) => (
            <Grid item xs={12} sm={6} md={4} key={persona.personaId}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  border: activePersona?.personaId === persona.personaId ? '2px solid #8B5FBF' : 'none',
                  bgcolor: activePersona?.personaId === persona.personaId ? 'rgba(139, 95, 191, 0.05)' : 'background.paper'
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      src={persona.avatarUrl} 
                      sx={{ 
                        width: 64, 
                        height: 64, 
                        mr: 2,
                        bgcolor: !persona.avatarUrl ? '#8B5FBF' : 'inherit'
                      }}
                    >
                      {!persona.avatarUrl && persona.displayName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {persona.displayName}
                      </Typography>
                      {activePersona?.personaId === persona.personaId && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'secondary.main', 
                            fontWeight: 'bold'
                          }}
                        >
                          Active Persona
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Created: {new Date(persona.createdAt).toLocaleDateString()}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    ID: {persona.personaId?.substring(0, 12)}...
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                  <Button 
                    variant="outlined"
                    color="secondary"
                    size="small" 
                    onClick={() => handleSwitchPersona(persona.personaId)}
                    disabled={activePersona?.personaId === persona.personaId}
                    startIcon={<Masks />}
                  >
                    Switch To
                  </Button>
                  
                  <Box>
                    <Tooltip title="Edit Persona">
                      <IconButton 
                        size="small" 
                        onClick={() => openEditDialog(persona)}
                        sx={{ mr: 1 }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete Persona">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeletePersona(persona.personaId)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
          
          {personas.length === 0 && !loading && (
            <Grid item xs={12}>
              <Box sx={{ 
                p: 4, 
                textAlign: 'center', 
                bgcolor: 'background.paper', 
                borderRadius: 2,
                border: '1px dashed rgba(0, 0, 0, 0.12)'
              }}>
                <PersonOff sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Anonymous Personas Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Create your first anonymous persona to start using anonymous mode.
                </Typography>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  startIcon={<Add />}
                  onClick={openCreateDialog}
                >
                  Create Your First Persona
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
      
      {/* Create Persona Dialog */}
      <Dialog open={createDialog} onClose={closeCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Anonymous Persona</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph sx={{ mt: 1 }}>
            Your anonymous persona will be used for all interactions in anonymous mode.
            Choose a display name that doesn't reveal your real identity.
          </Typography>
          
          <TextField
            fullWidth
            label="Display Name"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            margin="normal"
            required
            helperText="Choose a name that doesn't reveal your identity"
          />
          
          <TextField
            fullWidth
            label="Avatar URL (Optional)"
            name="avatarUrl"
            value={formData.avatarUrl}
            onChange={handleInputChange}
            margin="normal"
            helperText="Leave blank to use a generated avatar based on your display name"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleCreatePersona} 
            color="secondary" 
            variant="contained"
            disabled={!formData.displayName || isCreating}
          >
            {isCreating ? <CircularProgress size={24} /> : 'Create Persona'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Persona Dialog */}
      <Dialog open={editDialog.open} onClose={closeEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Anonymous Persona</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Display Name"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Avatar URL (Optional)"
            name="avatarUrl"
            value={formData.avatarUrl}
            onChange={handleInputChange}
            margin="normal"
            helperText="Leave blank to use a generated avatar based on your display name"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdatePersona} 
            color="primary" 
            variant="contained"
            disabled={!formData.displayName || isCreating}
          >
            {isCreating ? <CircularProgress size={24} /> : 'Update Persona'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AnonymousPersonas; 