import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { SerializedPosting } from '../components/types';

export enum PostingsStatus {
    LOADING = 'LOADING',
    DONE = 'DONE',
}

export interface PostingsState {
    postings: SerializedPosting[];
    status: PostingsStatus;
}

const initialState: PostingsState = {
    postings: [],
    status: PostingsStatus.LOADING,
}

export const postingsSlice = createSlice({
    name: 'postings',
    initialState,
    reducers: {
        setPostings: (_, action: PayloadAction<SerializedPosting[]>) => ({
            postings: action.payload,
            status: PostingsStatus.DONE,
        }),
    },
    extraReducers: builder => {},
});

export const { setPostings, } = postingsSlice.actions;
export const selectAllPostings = (state: RootState) => state.postings;

export default postingsSlice.reducer;
