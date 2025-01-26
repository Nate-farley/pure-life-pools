// @ts-nocheck
'use client'
import ModernLink from '@/components/ModernLink';
import { useTheme } from '@emotion/react';
import { Instagram, Google, Facebook } from '@mui/icons-material';
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
    "Quick Links": ["Google Maps"],
    Products: ['Pools'],
    Support: ['FAQ', 'Contact', 'Location', 'Privacy Policy'],
    Company: ['About', 'Leave a Review'],
  };

  const getHref = item => {
    switch (item.toLowerCase()) {
      case "location":
      case "leave a review":
        router.push('https://maps.app.goo.gl/md8GxJmSxDZSJ7Kq9')
        break; 
      case "privacy policy":
        router.push('/privacy_policy')
        break;
      default:
        return item;
    }
  }

  return (
    <Box sx={{ bgcolor: '#262626', color: 'white', py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About Us Section */}
          <Grid item xs={12} md={4}>
            
         
            <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
  Palm Bay's premier fiberglass pool installer serving Brevard County with custom pool designs, professional installation, and expert service since 2015.
</Typography>  
<Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
  <strong>Hours:</strong> Monday - Friday: 10AM - 5PM
</Typography>''
<Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
  <strong>Service Area:</strong> Palm Bay, Melbourne, Vero Beach, and surrounding Brevard County
</Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  mb: 1 
                }}
              >
                <strong>Address:</strong> 105 Ring Avenue NE, Palm Bay, FL 32907
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  mb: 1 
                }}
              >
                <strong>Phone:</strong> +1 (321) 831-3115
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)'
                }}
              >
                <strong>Email:</strong> info@purelifepools.com
              </Typography>
            </Box>
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
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            © {new Date().getFullYear()} Pure Life Pools. All rights reserved.
          </Typography>
          
          <Stack direction="row" spacing={2}>
          <IconButton
onClick={() => window.open('https://www.facebook.com/people/Pure-Life-Pools/61568311550769/?mibextid=LQQJ4d', '_blank', 'noopener,noreferrer')}
              aria-label="Google"
              sx={{
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              <Facebook />
            </IconButton>

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
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
