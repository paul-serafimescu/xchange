import * as React from 'react';
import { useToken } from '../utils';
import { HTTPRequestFactory } from '../../shared/utils';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import PlusIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import Posting from './Posting';
import IPosting from '../../shared/IPosting';
import './css/Home.scss';

function renderModal(
  creating: boolean,
  handleModalClose: (...args: any[]) => void,
  modalStyle: any,
  createPosting: (title: string, description: string) => Promise<void>) {

    type ButtonEventHandler = React.MouseEventHandler<HTMLButtonElement>;

    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');

    type ChangeEventHandler = React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;

    const handleTitleChange: ChangeEventHandler = event => setTitle(event.target.value);
    const handleDescriptionChange: ChangeEventHandler = event => setDescription(event.target.value);

    const handleModalSubmit: ButtonEventHandler = async event => {
      event.preventDefault();
      await createPosting(title, description);
      handleModalClose();
      setTitle('');
      setDescription('');
    };
  
    const resetModal: ButtonEventHandler = event => {
      event.preventDefault();
      setTitle('');
      setDescription('');
    };

    return (
      <Modal
        open={creating}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h5" component="h2" marginBottom={2}>
            Create New Posting
          </Typography>
          <Box
            component="form"
            sx={{'& .MuiTextField-root': { m: 1, width: '25ch' }}}
          >
            <Box padding={1}>
              <TextField required label="title" onChange={handleTitleChange} value={title} />
              <TextField required label="description" onChange={handleDescriptionChange} value={description} />
            </Box>
            <Button onClick={handleModalSubmit}>
              <Typography>
                Create
              </Typography>
            </Button>
            <Button onClick={resetModal}>
              <Typography>
                Reset
              </Typography>
            </Button>
          </Box>
        </Box>
      </Modal>
    );
}

export const LoggedInView: React.FC = () => {
  const [postings, setPostings] = React.useState<IPosting[]>([]);
  const [creating, setCreationDialog] = React.useState(false);

  type ButtonEventHandler = React.MouseEventHandler<HTMLButtonElement>;

  const removePosting = (id: number) => setPostings(postings.filter(obj => obj.posting_id !== id));

  const addPosting: ButtonEventHandler = event => {
    event.preventDefault();
    setCreationDialog(true);
  };

  const handleModalClose = (...args: any[]) => {
    setCreationDialog(false);
  };

  const createPosting = async (title: string, description: string) => {
    const factory = new HTTPRequestFactory({ authorizationToken: useToken() });

    try {
      const response = await factory.post<{ id: number }>('api/postings', { title: title, description: description });
      
      switch (response.status) {
        case 200:
          postings.push({
            title: title,
            description: description,
            author: undefined,
            posting_date: new Date(),
            posting_id: response.data.id,
          });
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    (async () => {
      const factory = new HTTPRequestFactory({ authorizationToken: useToken() });

      try {
        const postings = await factory.get<IPosting[]>('/api/@me/postings');
        setPostings(postings.data);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  return (
    <>
      <CssBaseline />
      {renderModal(creating, handleModalClose, modalStyle, createPosting)}
      {postings.map(posting => (
        <Posting key={posting.posting_id} {...posting} removePosting={removePosting} />
      ))}
      <Grid container justifyContent="center" spacing={2} marginTop={1}>
        <Grid item>
          <Button onClick={addPosting}>
            <Typography align="center">
              <PlusIcon className="add-button" />
            </Typography>
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export const LoggedOutView: React.FC = () => {
  return (
    <>
      <CssBaseline />
      hi
    </>
  );
};

const Home: React.FC = () => {
  
  const token = useToken();
  const authenticated = Boolean(token);

  return (
    authenticated ? <LoggedInView /> : <LoggedOutView />
  );
};

export default Home;
