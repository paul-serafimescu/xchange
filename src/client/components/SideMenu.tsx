import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import { Divider, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Toolbar from '@mui/material/Toolbar';

const drawerWidth = 240;

export const SideMenu: React.FC = () => {
  return (
    <Drawer
      variant='permanent'
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <List>
        <ListItem button component={RouterLink} to='/'>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary='Home' />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button component={RouterLink} to='/login'>
          <ListItemIcon>
            <LoginIcon />
          </ListItemIcon>
          <ListItemText primary='Login' />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default SideMenu;
