import React from 'react';
import { Box, Container } from '@mui/material';
import SupportGroupList from '../components/supportGroups/SupportGroupList';

const SupportGroups = () => {
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <SupportGroupList />
      </Box>
    </Container>
  );
};

export default SupportGroups; 