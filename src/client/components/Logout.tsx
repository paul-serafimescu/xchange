import * as React from 'react';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAppDispatch } from '../app/hooks';
import { logoutUser } from '../reducers';
import { logout } from '../utils';

export const Logout: React.FC = () => {
  const dispatch = useAppDispatch();
  
  React.useEffect(() => {
    dispatch(logoutUser());
    logout();
  }, []);

  return (
    <Container component="main">
      <CssBaseline />
      <Box
        sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4">
          Logged Out.
        </Typography>
      </Box>
    </Container>
  );
};

export default Logout;
