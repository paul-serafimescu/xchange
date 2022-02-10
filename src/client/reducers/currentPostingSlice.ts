import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { HTTPRequestFactory } from '../../shared/utils';
import SerializedPosting from '../components/types/PostingTypes';

export interface CurrentPostState extends SerializedPosting {}

const initialState: CurrentPostState = null;

export const loadCurrentPostAPI = createAsyncThunk(
    'currentPost/loadCurrentPostAPI',
    async (id: number) => {
        const factory = new HTTPRequestFactory();

        const response = await factory.get<SerializedPosting>(`/api/postings/${id}`);
        return response.data;
    }
);

export const currentPostSlice = createSlice({
    name: 'currentPost',
    initialState,
    reducers: {
        setCurrentPost: (state, action: PayloadAction<CurrentPostState>) => ({ ...state, ...action.payload }),
    },
    extraReducers: builder => {
        builder.addCase(loadCurrentPostAPI.fulfilled, (state, action) => ({ ...state, ...action.payload }));
    },
});

export const { setCurrentPost } = currentPostSlice.actions;
export const selectCurrentPost = (state: RootState) => state.currentPost;

export default currentPostSlice.reducer;
