import * as React from 'react';
import * as Router from 'react-router-dom';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import createTheme from '@mui/material/styles/createTheme';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import Header from './components/Header';
import Home from './components/Home';
import LoginPage from './components/Login';
import LogoutPage from './components/Logout';
import SideMenu from './components/SideMenu';
import SignupPage from './components/Signup';
import ProfilePage from './components/ProfilePage';
import PostingPage from './components/PostingPage';
import { AuthStatus, loadUser, selectUser } from './reducers';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { useToken } from './utils';

export function ProtectedRoute() {
  const user = useAppSelector(selectUser);

  const isAuthenticated = user.status === AuthStatus.AUTHENTICATED;
  const isLoading = user.status === AuthStatus.LOADING;

  return (
    isAuthenticated ? <Router.Outlet /> : (
      isLoading ? <h1>Loading...</h1> : <Router.Navigate to="/login" />
    )
  );
}

export const AppRoutes: React.FC = () => (
  <Router.Routes>
    <Router.Route path='/' element={<Home />} />
    <Router.Route path='/profile' element={<ProtectedRoute />}>
      <Router.Route path='/profile' element={<ProfilePage />} />
    </Router.Route>
    <Router.Route path='/signup' element={<SignupPage />} />
    <Router.Route path='/login' element={<LoginPage />} />
    <Router.Route path='/logout' element={<ProtectedRoute />}>
      <Router.Route path='/logout' element={<LogoutPage />} />
    </Router.Route>
    <Router.Route path='/postings/:postingID' element={<PostingPage />} />
  </Router.Routes>
);

export const App: React.FC = () => {

  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(loadUser(useToken()));
  }, []);

  const preferDark = useMediaQuery('(prefers-color-scheme: dark)');

  const generateTheme = (dark: boolean) => createTheme({
    palette: {
      mode: dark ? 'dark' : 'light',
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: dark ? '#001333' : 'primary',
            color: dark ? '#ffffff' : 'primary',
            boxShadow: 'none',
          }
        }
      }
    }
  });
  
  const [theme, setTheme] = React.useState(generateTheme(preferDark));

  React.useMemo(() => setTheme(generateTheme(preferDark)), [preferDark]);

  document.body.style.backgroundColor = theme.palette.mode === 'dark' ? '#121212' : '#efefef';

  return (
    <React.Fragment>
      <Router.BrowserRouter>
        <ThemeProvider theme={theme}>
          <Box sx={{ display: 'flex' }}>
            <Header setTheme={setTheme} generateTheme={generateTheme} currentTheme={theme.palette.mode} />
            <SideMenu />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Toolbar />
              <AppRoutes />
            </Box>
          </Box>
        </ThemeProvider>
      </Router.BrowserRouter>
    </React.Fragment>
  );
};

export default App;
