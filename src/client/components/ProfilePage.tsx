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
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Posting from './Posting';
import IPosting from '../../shared/IPosting';
import ICurrency from '../../shared/ICurrency';
import './css/Home.scss';

function renderModal(
  creating: boolean,
  handleModalClose: (...args: any[]) => void,
  modalStyle: any,
  createPosting: (title: string, description: string, price: number, currency: ICurrency, image: File) => Promise<void>) {

    type ButtonEventHandler = React.MouseEventHandler<HTMLButtonElement>;

    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [price, setPrice] = React.useState('');
    const [image, loadImage] = React.useState<File>(null);
    const [currency, setCurrency] = React.useState<ICurrency>('USD');

    type ChangeEventHandler = React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;

    const handleTitleChange: ChangeEventHandler = event => setTitle(event.target.value);
    const handleDescriptionChange: ChangeEventHandler = event => setDescription(event.target.value);
    const handlePriceChange: ChangeEventHandler = event => {
      const newDigit = event.target.value;
      if (!isNaN(Number(newDigit))) {
        setPrice(newDigit);
      }
    }

    const reset = () => {
      setTitle('');
      setDescription('');
      setPrice('');
      loadImage(null);
      setCurrency('USD');
    };

    const handleModalSubmit: ButtonEventHandler = async event => {
      event.preventDefault();
      await createPosting(title, description, Math.round(Number(price) * 1e2) / 1e2, currency, image);
      handleModalClose();
      reset();
    };
  
    const resetModal: ButtonEventHandler = event => {
      event.preventDefault();
      reset();
    };

    const handleUpload: React.ChangeEventHandler<HTMLInputElement> = event => {
      event.preventDefault();

      if (event.target.files && event.target.files[0]) {
        loadImage(event.target.files[0]);
      }
    };

    const handleCurrencyChange = (event: SelectChangeEvent<ICurrency>) => {
      event.preventDefault();
      setCurrency(event.target.value as ICurrency);
    };

    return (
      <Modal
        open={creating}
        onClose={() => {
          handleModalClose();
          reset();
        }}
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
              <Box>
                <TextField required label="title" onChange={handleTitleChange} value={title} />
                <TextField required label="description" onChange={handleDescriptionChange} value={description} />
                <TextField required label="price" onChange={handlePriceChange} value={price} />
                <Select value={currency} onChange={handleCurrencyChange} style={{ width: '70%', margin: '8px' }}>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="ILS">ILS</MenuItem>
                  <MenuItem value="MXN">MXN</MenuItem>
                </Select>
              </Box>
              {image && (
                <div>
                  <img alt="not found" src={URL.createObjectURL(image)} />
                </div>
              )}
              <Button variant="contained" component="label">
                Upload Image
                <input type="file" accept="image/*" name="image" hidden onChange={handleUpload} />
              </Button>
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

export const CreatePage: React.FC = () => {
  const [postings, setPostings] = React.useState<IPosting[]>([]);
  const [creating, setCreationDialog] = React.useState(false);

  type ButtonEventHandler = React.MouseEventHandler<HTMLButtonElement>;

  const removePosting = (id: number) => setPostings(postings.filter(obj => obj.posting_id !== id));

  const addPosting: ButtonEventHandler = event => {
    event.preventDefault();
    setCreationDialog(true);
  };

  const handleModalClose = () => setCreationDialog(false);

  const createPosting = async (title: string, description: string, price: number, currency: ICurrency, image: File) => {
    const factory = new HTTPRequestFactory({ authorizationToken: useToken() });
    const formData = new FormData();

    if (image) {
      formData.append('image', image, image.name);
    }

    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', String(price));
    formData.append('currency', currency);

    try {
      const response = await factory.post<{ id: number, image: string }>('api/postings', formData);
      
      switch (response.status) {
        case 200:
          postings.push({
            title: title,
            description: description,
            author: undefined,
            posting_date: new Date(),
            posting_id: response.data.id,
            image: response.data.image,
            price: price,
            currency: 'USD',
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

export default CreatePage;
