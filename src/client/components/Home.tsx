import * as React from 'react';
import * as Router from 'react-router-dom';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { IPostingSearch } from './types';
import Searchbar from './Searchbar';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setCurrentPost, setPostings, selectAllPostings } from '../reducers';

export interface IPostingResultProps extends IPostingSearch {}

export const PostingResult: React.FC<IPostingResultProps> = props => {
  const { posting_id, author, title, image } = props;

  const navigate = Router.useNavigate();
  const dispatch = useAppDispatch();

  const viewPosting: React.MouseEventHandler<HTMLDivElement> = event => {
    event.preventDefault();

    dispatch(setCurrentPost(props));
    navigate(`/postings/${posting_id}`);
  };

  return (
    <ListItem>
      <ListItemAvatar>
        <Avatar alt="help" src={`/assets/uploads/${image}`} />
      </ListItemAvatar>
      <ListItemButton divider onClick={viewPosting}>
        <ListItemText primary={`${title}`} />
      </ListItemButton>
    </ListItem>
  );
}

const Home: React.FC = () => {
  const loadedPosts = useAppSelector(selectAllPostings);
  const [results, setResults] = React.useState<IPostingSearch[]>(loadedPosts.postings);
  const dispatch = useAppDispatch();

  return (
    <React.Fragment>
      <Searchbar onResults={results => {
        setResults(results);
        dispatch(setPostings(results));
      }} />
      {results.length > 0 && <Paper style={{
        padding: '1.5vh',
        marginTop: '5vh'
      }}>
        <List>
          {results.map(result => (
            <PostingResult
              key={result.posting_id}
              {...result}
            />
          ))}
        </List>
      </Paper>}
    </React.Fragment>
  );
};

export default Home;
