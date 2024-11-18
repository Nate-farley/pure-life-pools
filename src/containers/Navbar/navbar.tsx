// @ts-nocheck
import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PlpLogo from "/assets/images/plpLogo.png";
import Image from 'next/image';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';


export default function NavBar() {
  const [value, setValue] = React.useState(0);

  return (
    <AppBar position="absolute" sx={{backgroundColor: "transparent", boxShadow:"none", width:"100%", }}>
  
      <Toolbar disableGutters sx={{display:"flex", flexDirection: "row", alignItems:"center", justifyContent:"space-between", width:"100%", paddingLeft:"15px"}}>
        <Image
        src="/assets/images/plpLogo.png"
        alt='Logo'
        width="80"
        height="50"
        />
        

        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          
            <Button
              variant='text'
              sx={{ fontWeight: 'bold', my: 2, color: 'white', display: 'block' }}
            >
              Home
            </Button>
            <Button
          
          variant='text'
          sx={{ fontWeight: 'bold', my: 2, color: 'white', display: 'block' }}
        >
             Product
            </Button>
             <Button
          
          variant='text'
          sx={{ fontWeight: 'bold', my: 2, color: 'white', display: 'block' }}
            >
            Review 
            </Button>
            <Button
          
          variant='text'
          sx={{ fontWeight: 'bold', my: 2, color: 'white', display: 'block' }}
            >
           Contact US
            </Button>
    
        </Box>
        <Box />
      </Toolbar>
   
  </AppBar>
  );
}

