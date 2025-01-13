// @ts-nocheck
import ModernLink from '@/components/ModernLink';
import { useTheme } from '@emotion/react';
import { Instagram, Google } from '@mui/icons-material';
import {
  Box,
  Grid,
  Typography,
  Container,
  Stack,
  TextField,
  Divider,
  IconButton,
} from '@mui/material';
import { useRouter } from 'next/router';

const Footer = () => {
  const router = useRouter()
  const theme = useTheme();

  const menuItems = {
    Products: ['Pools'],
    Support: ['FAQ', 'Contact', 'Location'],
    Company: ['About', 'Leave a Review'],
  };

  const getHref = item => {
    switch (item.toLowerCase()) {
      case "location":
        router.push('https://maps.app.goo.gl/md8GxJmSxDZSJ7Kq9')
        break;
      case "leave a review":
        router.push('https://maps.app.goo.gl/md8GxJmSxDZSJ7Kq9')
        break; 
      default:
        return item;
    }
  }

  return (
    <Box sx={{ bgcolor: '#262626', color: 'white', py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={30}>
          {/* Contact Form Section */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
              We will reach out to you.
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="US+1 (555) 000-0000"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
                '& .MuiFormHelperText-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
              helperText="Leave a US based phone number and we will reach out to you."
            />
          </Grid>

          {/* Menu Sections */}
          {Object.entries(menuItems).map(([category, items]) => (
            <Grid item xs={12} sm={6} md={2} key={category}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 500,
                  position: 'relative',
                }}
              >
                {category}
              </Typography>
              <Stack spacing={1.5}>
                {' '}
                {/* Increased spacing between items */}
                {items.map((item) => (
                  <ModernLink key={item} onClick={() => getHref(item.toLowerCase())} underline="none">
                    {item}
                  </ModernLink>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        {/* Divider and Social Icons */}
        <Divider
          sx={{ mt: 6, mb: 4, borderColor: 'rgba(255, 255, 255, 0.12)' }}
        />

        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          alignItems="center"
        >
          <IconButton
          onClick={() => router.push('/')}
            aria-label="Instagram"
            sx={{
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            <Instagram />
          </IconButton>
          <IconButton
            onClick={() => router.push('/')}
            aria-label="Google"
            sx={{
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            <Google />
          </IconButton>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
