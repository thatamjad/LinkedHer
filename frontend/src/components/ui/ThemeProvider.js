import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme, { anonymousTheme } from '../../theme';
import { useAnonymous } from '../../context/AnonymousContext';
import ModeSwitchAnimation from './ModeSwitchAnimation';

const ThemeProvider = ({ children }) => {
  const { anonymousMode, animationInProgress } = useAnonymous();
  
  // Use the anonymous theme when in anonymous mode, otherwise use the regular theme
  const currentTheme = anonymousMode ? anonymousTheme : theme;
  
  return (
    <MuiThemeProvider theme={currentTheme}>
      <CssBaseline />
      {children}
      <ModeSwitchAnimation />
    </MuiThemeProvider>
  );
};

export default ThemeProvider; 