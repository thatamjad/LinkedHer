import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  LinearProgress,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TablePagination
} from '@mui/material';
import { useReport } from '../context/ReportContext';

const ModerationDashboard = () => {
  const {
    loading,
    error,
    fetchReports,
    updateReport,
  } = useReport();
  
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 10, total: 0 });
  const [filters, setFilters] = useState({ status: '', reportType: '', sortBy: 'createdAt', sortOrder: 'desc' });
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionAction, setResolutionAction] = useState('');

  const loadReports = useCallback(async () => {
    try {
      const data = await fetchReports({ 
        page: pagination.page + 1, 
        limit: pagination.rowsPerPage, 
        ...filters 
      });
      setReports(data.data);
      setPagination(prev => ({ ...prev, total: data.pagination.total }));
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  }, [fetchReports, pagination.page, pagination.rowsPerPage, filters]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleRowsPerPageChange = (event) => {
    setPagination(prev => ({ ...prev, rowsPerPage: parseInt(event.target.value, 10), page: 0 }));
  };
  
  const handleOpenModal = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
    setResolutionNotes('');
    setResolutionAction('');
  };
  
  const handleResolveReport = async () => {
    if (!selectedReport) return;
    try {
      await updateReport(selectedReport._id, {
        status: resolutionAction === 'dismiss' ? 'dismissed' : 'resolved',
        moderationNotes: resolutionNotes,
        resolutionAction,
      });
      handleCloseModal();
      loadReports();
    } catch (err) {
      console.error("Failed to resolve report:", err);
    }
  };

  const statusChip = (status) => {
    const color = {
      pending: 'warning',
      under_review: 'info',
      resolved: 'success',
      dismissed: 'default',
    }[status];
    return <Chip label={status.replace('_', ' ')} color={color} size="small" />;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Moderation Dashboard</Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select name="status" value={filters.status} label="Status" onChange={handleFilterChange}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="dismissed">Dismissed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Report Type</InputLabel>
              <Select name="reportType" value={filters.reportType} label="Report Type" onChange={handleFilterChange}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="harassment">Harassment</MenuItem>
                <MenuItem value="hate_speech">Hate Speech</MenuItem>
                <MenuItem value="misinformation">Misinformation</MenuItem>
                <MenuItem value="inappropriate_content">Inappropriate Content</MenuItem>
                <MenuItem value="impersonation">Impersonation</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select name="sortBy" value={filters.sortBy} label="Sort By" onChange={handleFilterChange}>
                <MenuItem value="createdAt">Date</MenuItem>
                <MenuItem value="severityScore">Severity</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow>}
            {!loading && reports.map((report) => (
              <TableRow key={report._id}>
                <TableCell>{report.reportType.replace('_', ' ')}</TableCell>
                <TableCell>{report.description.substring(0, 50)}...</TableCell>
                <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{statusChip(report.status)}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <LinearProgress
                      variant="determinate"
                      value={report.severityScore * 100}
                      color={report.severityScore > 0.7 ? 'error' : report.severityScore > 0.4 ? 'warning' : 'success'}
                      sx={{ width: 100, mr: 1 }}
                    />
                    {Math.round(report.severityScore * 100)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => handleOpenModal(report)}>Review</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.rowsPerPage}
          page={pagination.page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </TableContainer>
      
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>Review Report</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Typography variant="h6">{selectedReport.reportType}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>{new Date(selectedReport.createdAt).toLocaleString()}</Typography>
              <Typography paragraph>{selectedReport.description}</Typography>
              <TextField
                label="Moderation Notes"
                multiline
                rows={4}
                fullWidth
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                sx={{ mt: 2 }}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Action</InputLabel>
                <Select value={resolutionAction} label="Action" onChange={(e) => setResolutionAction(e.target.value)}>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="content_removal">Content Removal</MenuItem>
                  <MenuItem value="temporary_ban">Temporary Ban</MenuItem>
                  <MenuItem value="permanent_ban">Permanent Ban</MenuItem>
                  <MenuItem value="dismiss">Dismiss</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleResolveReport} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default ModerationDashboard;