import { Box, Typography, Grid } from "@mui/material";
import { useState, useEffect, useMemo } from "react";

interface PoolImage {
    success: boolean;
    filename: string;
    url: string;
  }
  
  const PoolProductGrid = () => {
    const [poolImages, setPoolImages] = useState<PoolImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCached, setIsCached] = useState(false);
  
    useEffect(() => {
      const fetchPoolImages = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          const response = await fetch('/api/scrape', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: 'https://www.lathampool.com/fiberglass-pool-shapes/',
              className: 'product-card__image__inner'
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch pool images');
          }
  
          const data = await response.json();
          setPoolImages(data.results);
          setIsCached(data.fromCache || false);
        } catch (error) {
          console.error('Error fetching pool images:', error);
          setError(error instanceof Error ? error.message : 'Failed to fetch images');
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchPoolImages();
    }, []);
  
  
    const poolPairs = useMemo(() => {
      const pairs = [];
      for (let i = 0; i < poolImages.length; i += 2) {
        if (poolImages[i + 1]) {
          pairs.push({
            shape: poolImages[i],
            actual: poolImages[i + 1]
          });
        }
      }

      return pairs.slice(0, 12);
    }, [poolImages]);
  
    if (isLoading) {
      return (
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <Typography>Loading pools...</Typography>
        </Box>
      );
    }
  
    const extractPoolName = (filename: string) => {
      // Look for pattern: _PoolName-angle
      const match = filename.match(/._([^_]+)-angle/);
      return match ? match[1] : 'Unknown Pool';
    };
    
    return (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {poolPairs.map((pair, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '100%', // Force square aspect ratio
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
                  src={pair.shape.url}
                  alt="Pool shape"
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
                <Box
                  component="img"
                  src={pair.actual.url}
                  alt="Actual pool"
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
                
                {/* Title overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '12px 16px',
                    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: '#2F2F2F',
                      fontWeight: 500,
                      fontSize: '1rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {extractPoolName(pair.shape.filename)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      );
  };

  export default PoolProductGrid