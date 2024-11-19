import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Image from 'next/image';

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 100;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AppBar 
      position="fixed" 
      sx={{
        backgroundColor: '#133240', // Your dark blue brand color
        boxShadow: scrolled ? '0px 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
        transition: 'all 0.3s ease-in-out',
        width: "100%",
        zIndex: 9999,
        // Special handling for the video section
        background: scrolled 
          ? '#133240'
          : 'linear-gradient(180deg, rgba(19,50,64,0.6) 0%, rgba(19,50,64,0.2) 100%)',
      }}
    >
      <Toolbar 
        disableGutters 
        sx={{
          display: "flex", 
          flexDirection: "row", 
          alignItems: "center", 
          justifyContent: "space-between", 
          width: "100%", 
        //  paddingX: "24px",
          minHeight: "70px",
          paddingX: 5
        }}
      >
        <Image
          src="/assets/images/plpLogo.png"
          alt='Logo'
          width="80"
          height="50"
        />

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
          {['Home', 'Product', 'Review', 'Contact US'].map((page) => (
            <Button
              key={page}
              variant='text'
              sx={{
                fontWeight: 'bold',
                color: 'white',
                display: 'block',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#5C83D6', // Your blue accent color
                },
                transition: 'color 0.3s ease-in-out',
              }}
            >
              {page}
            </Button>
          ))}
        </Box>

        <Box sx={{ width: 200}} />
      </Toolbar>
    </AppBar>
  );
}