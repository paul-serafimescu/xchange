import * as React from 'react';
import * as Router from 'react-router-dom';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import ProfileIcon from '@mui/icons-material/AccountCircle';
import { useAppSelector } from '../app/hooks';
import { AuthStatus, selectUser } from '../reducers';

const drawerWidth = 240;

export const SideMenu: React.FC = () => {
  const user = useAppSelector(selectUser);

  const authenticated = user.status === AuthStatus.AUTHENTICATED;

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
        <ListItem button component={Router.Link} to='/'>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary='Home' />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button component={Router.Link} to='/login'>
          <ListItemIcon>
            <LoginIcon />
          </ListItemIcon>
          <ListItemText primary='Sign in' />
        </ListItem>
        {authenticated && <ListItem button component={Router.Link} to='/profile'>
          <ListItemIcon>
            <ProfileIcon />
          </ListItemIcon>
          <ListItemText primary='Your Profile' />
        </ListItem>}
        <ListItem button component={Router.Link} to='/logout'>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary='Sign out' />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default SideMenu;
