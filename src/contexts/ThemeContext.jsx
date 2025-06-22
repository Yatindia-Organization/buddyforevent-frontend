import React, { createContext, useContext, useEffect, useState } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const muiTheme = createTheme({
    palette: {
      mode: theme,
    },
    typography: {
      fontFamily: 'var(--font-base)',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            backgroundColor: 'var(--color-bg)',
          },
          body: {
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--color-card-bg)',
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: 'var(--color-text)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            color: 'var(--color-text)',
            borderColor: 'var(--color-text-secondary)',
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            color: 'var(--color-text)',
            '&.Mui-selected': {
              color: 'var(--color-text)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
          // "Proceed" and other primary contained buttons
          containedPrimary: {
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            '&:hover': {
              backgroundColor: 'var(--color-primary-hover)',
            },
          },
          // if you use outlined primary
          outlinedPrimary: {
            borderColor: 'var(--color-primary)',
            color: 'var(--color-primary)',
            '&:hover': {
              backgroundColor: 'var(--color-card-bg)',
            },
          },
          // text variant primary
          textPrimary: {
            color: 'var(--color-primary)',
          },
        },
      },
      // …other overrides…
    },
  });

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
