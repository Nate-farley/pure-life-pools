import { Box, Typography, Grid } from '@mui/material';
import { useMemo } from 'react';

const PoolProductGrid = () => {
  const poolImages = useMemo(() => {
    const productImages = [
      'aruba',
    //  'astoria_collection',
     // 'axiom_12',
     // 'axiom_12_deluxe',
      // 'axiom_14',
      // 'axiom_16',
      // 'barcelona',
      // 'bay_isle',
      // 'bermuda',
      // 'cambridge',
      // 'cancun',
      // 'cancun_deluxe',
      // 'cape_cod',
       'caribbean',
      // 'claremont',
      // 'corinthian_12',
      // 'corinthian_14',
      // 'corinthian_16',
      // 'coronado',
      // 'delray',
      // 'enchantment_9.17',
      // 'enchantment_9.21',
      // 'enchantment_9.24',
      // 'fiji',
      // 'genesis',
      // 'jamaica',
       'java',
      // 'key_west',
      // 'kingston',
      // 'laguna',
      // 'laguna_deluxe',
      // 'lake_shore',
      // 'milan',
      // 'monaco',
      // 'olympia_12',
      // 'olympia_14',
      // 'olympia_16',
      // 'pleasant_cove',
      // 'providence_14',
      // 'st_lucia',
      // 'st_thomas',
      // 'synergy',
       'tuscan_11.20',
      // 'tuscan_13.24',
      // 'tuscan_14.27',
      // 'tuscan_14.30',
      // 'tuscan_14.40',
      // 'valencia',
      // 'vista_isle',
    ];

    return productImages.map(name => ({
      name: name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      angleImage: `/assets/images/product_images/${name}_angle.jpg`,
      viewImage: `/assets/images/product_images/${name}_view.jpg`
    }));
  }, []);

  return (
    <Box 
      component="section" 
      aria-label="Pool Products Grid"
    >
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {poolImages.map((pool, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                paddingTop: '100%',
                borderRadius: 1,
                border: '1px solid #eee',
                overflow: 'hidden',
                '&:hover .actual-pool': {
                  opacity: 1,
                },
              }}
            >
              {/* Base image (pool shape) */}
              <Box
                component="img"
                loading="lazy"
                src={pool.angleImage}
                alt={`${pool.name} angle view`}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {/* Hover image (actual pool) */}
              {!pool.name.toLowerCase().includes('corinthian') && 
               !pool.name.toLowerCase().includes('cove') && (
                <Box
                  component="img"
                  loading="lazy"
                  src={pool.viewImage}
                  alt={`${pool.name} installed view`}
                  className="actual-pool"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0,
                    transition: 'opacity 0.3s ease-in-out',
                    '&:hover': {
                      opacity: 1,
                    },
                  }}
                />
              )}

              {/* Title overlay */}
              <Box
                component="header"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  padding: '12px 16px',
                  borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                  zIndex: 2,
                }}
              >
                <Typography
                  component="h3"
                  variant="subtitle1"
                  sx={{
                    color: '#2F2F2F',
                    fontWeight: 500,
                    fontSize: '1rem',
                    lineHeight: 1.2,
                  }}
                >
                  {pool.name}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PoolProductGrid;