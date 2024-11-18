// @ts-nocheck
import { Link, styled } from '@mui/material';

const ModernLink = styled(Link)(({ theme }) => ({
  position: 'relative',
  color: 'rgba(255, 255, 255, 0.7)',
  textDecoration: 'none',
  cursor: 'pointer',
  padding: '4px 0',
  transition: 'all 0.3s ease',

  '&::after': {
    content: '""',
    position: 'absolute',
    width: '0',
    height: '2px',
    bottom: 0,
    left: 0,
    backgroundColor: '#5C83D6',
    transition: 'all 0.3s ease-in-out',
    opacity: 0,
  },

  '&:hover': {
    color: 'white',
    transform: 'translateY(-2px)',

    '&::after': {
      width: '100%',
      opacity: 1,
    },
  },

  '&:hover::before': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: 'rgba(92, 131, 214, 0.1)',
    filter: 'blur(8px)',
    zIndex: -1,
  },
}));

export default ModernLink;
