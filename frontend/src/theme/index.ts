import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import type { StyleFunctionProps } from '@chakra-ui/styled-system';

// Color mode config
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

// Custom colors
const colors = {
  brand: {
    50: '#E6F6FF',
    100: '#BAE3FF',
    200: '#7CC4FA',
    300: '#47A3F3',
    400: '#2186EB',
    500: '#0967D2', // Primary brand color
    600: '#0552B5',
    700: '#03449E',
    800: '#01337D',
    900: '#002159',
  },
  accent: {
    50: '#E3F9E5',
    100: '#C1EAC5',
    200: '#A3D9A5',
    300: '#7BC47F',
    400: '#57AE5B',
    500: '#3F9142', // Primary accent color
    600: '#2F8132',
    700: '#207227',
    800: '#0E5814',
    900: '#05400A',
  },
  gray: {
    50: '#F7FAFC',
    100: '#EDF2F7',
    200: '#E2E8F0',
    300: '#CBD5E0',
    400: '#A0AEC0',
    500: '#718096',
    600: '#4A5568',
    700: '#2D3748',
    800: '#1A202C',
    900: '#171923',
  },
};

// Custom fonts
const fonts = {
  heading: '"Inter", sans-serif',
  body: '"Inter", sans-serif',
  mono: '"Fira Code", monospace',
};

// Component style overrides
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'bold',
      borderRadius: 'md',
    },
    variants: {
      primary: (props: StyleFunctionProps) => ({
        bg: mode('brand.500', 'brand.400')(props),
        color: 'white',
        _hover: {
          bg: mode('brand.600', 'brand.300')(props),
          _disabled: {
            bg: mode('brand.500', 'brand.400')(props),
          },
        },
      }),
      secondary: (props: StyleFunctionProps) => ({
        bg: mode('gray.200', 'gray.700')(props),
        color: mode('gray.800', 'gray.100')(props),
        _hover: {
          bg: mode('gray.300', 'gray.600')(props),
          _disabled: {
            bg: mode('gray.200', 'gray.700')(props),
          },
        },
      }),
      accent: (props: StyleFunctionProps) => ({
        bg: mode('accent.500', 'accent.400')(props),
        color: 'white',
        _hover: {
          bg: mode('accent.600', 'accent.300')(props),
          _disabled: {
            bg: mode('accent.500', 'accent.400')(props),
          },
        },
      }),
    },
  },
  Card: {
    baseStyle: (props: StyleFunctionProps) => ({
      container: {
        bg: mode('white', 'gray.800')(props),
        borderRadius: 'lg',
        boxShadow: mode('md', 'dark-lg')(props),
        overflow: 'hidden',
      },
    }),
  },
  Heading: {
    baseStyle: {
      fontWeight: 'bold',
    },
  },
};

// Global styles
const styles = {
  global: (props: StyleFunctionProps) => ({
    body: {
      bg: mode('gray.50', 'gray.900')(props),
      color: mode('gray.800', 'gray.100')(props),
    },
  }),
};

// Create and export theme
const theme = extendTheme({
  config,
  colors,
  fonts,
  components,
  styles,
  shadows: {
    outline: '0 0 0 3px rgba(9, 103, 210, 0.6)',
  },
  layerStyles: {
    card: {
      p: '4',
      borderRadius: 'lg',
      bg: 'white',
      boxShadow: 'md',
    },
    selected: {
      bg: 'brand.50',
      borderColor: 'brand.500',
      borderWidth: '1px',
    },
  },
  textStyles: {
    h1: {
      fontSize: ['2xl', '3xl'],
      fontWeight: 'bold',
      lineHeight: '110%',
      letterSpacing: '-1%',
    },
    h2: {
      fontSize: ['xl', '2xl'],
      fontWeight: 'semibold',
      lineHeight: '110%',
      letterSpacing: '-0.5%',
    },
  },
});

export default theme;