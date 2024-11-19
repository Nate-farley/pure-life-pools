import { Box, Stack, Typography, Button, Container } from '@mui/material';

const FoundedSection = () => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          py: { xs: 6, sm: 8, md: 15 },
          px: { xs: 2, sm: 4, md: 6 }
        }}
      >
        {/* Founded Title */}
        <Stack 
          direction="row" 
          alignItems="center" 
          mb={{ xs: 3, md: 4 }}
          sx={{
            flexWrap: { xs: 'wrap', sm: 'nowrap' }
          }}
        >
          <Box
            sx={{
              backgroundColor: 'black',
              width: { xs: 60, sm: 100 },
              height: 2,
              borderWidth: 2,
              mr: 2,
              display: { xs: 'none', sm: 'block' }
            }}
          />
          <Typography 
            sx={{ 
              color: '#133240',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }} 
            fontWeight="bold" 
            variant="h6"
          >
            FOUNDED IN 2015
          </Typography>
        </Stack>

        {/* Main Content */}
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          alignItems={{ xs: 'flex-start', md: 'flex-end' }}
          spacing={{ xs: 3, md: 4 }}
          mb={{ xs: 4, md: 5 }}
        >
          <Typography
            fontWeight="bold"
            sx={{
              color: '#133240',
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
              width: { xs: '100%', md: '60%' },
              lineHeight: { xs: 1.2, md: 1.1 }
            }}
          >
            Specializing in pools, pavers, ponds and hardscaping.
          </Typography>
          <Typography 
            color="textSecondary" 
            fontWeight="500"
            sx={{
              fontSize: { xs: '1rem', sm: '1.1rem' },
              width: { xs: '100%', md: '40%' }
            }}
          >
            We help you create your dream space at your home while ensuring high
            quality work.
          </Typography>
        </Stack>

        {/* Button Container */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: { xs: 'center', md: 'flex-end' },
            width: '100%'
          }}
        >
          <Button
            variant="contained"
            disableElevation
            disableRipple
            sx={{
              borderRadius: 20,
              textTransform: 'none',
              backgroundColor: '#133240',
              px: { xs: 4, sm: 6 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              '&:hover': {
                backgroundColor: '#1a4559'
              }
            }}
          >
            Hire Us
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default FoundedSection;