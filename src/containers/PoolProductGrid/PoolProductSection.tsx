import { Box, Typography, Stack, Button, Container } from '@mui/material';
import PoolProductGrid from './index';

const PoolProductsSection = ({ router }) => {
  return (
    <Box 
      sx={{ 
        backgroundColor: '#FAFAFA',
        py: { xs: 6, sm: 8, md: 10 },
        px: { xs: 2, sm: 4, md: 6, lg: 8 }
      }}
    >
      <Container maxWidth="lg">
        {/* Title Section */}
        <Box 
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 1, sm: 0 },
            mb: { xs: 3, sm: 4 }
          }}
        >
          <Typography
            component="span"
            sx={{ 
              fontWeight: '600',
              fontSize: { xs: 24, sm: 26, md: 30 },
              color: '#5C83D6',
              mr: 1
            }}
          >
            Fiber Glass Pools
          </Typography>
          <Typography
            component="span"
            sx={{ 
              fontWeight: '600',
              fontSize: { xs: 24, sm: 26, md: 30 },
              color: '#133240'
            }}
          >
            from our suppliers
          </Typography>
        </Box>

        {/* Description and Button */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={{ xs: 2, md: 4 }}
          mb={{ xs: 4, sm: 6 }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#585858',
              maxWidth: { xs: '100%', md: 600 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Have questions about pricing, products or service? Fill out the form
            and our friendly team can get back to you within 24 hours.
          </Typography>

          <Button
            onClick={() => router?.push('/pools')}
            variant="outlined"
            size="small"
            sx={{
              backgroundColor: 'white',
              borderColor: '#133240',
              textTransform: 'none',
              color: '#133240',
              whiteSpace: 'nowrap',
              minWidth: 'fit-content',
              px: 3,
              '&:hover': {
                borderColor: '#133240',
                backgroundColor: 'rgba(19, 50, 64, 0.04)'
              }
            }}
          >
            See More Fiber Glass Pools
          </Button>
        </Stack>

        {/* Product Grid */}
        <PoolProductGrid />
      </Container>
    </Box>
  );
};

export default PoolProductsSection;