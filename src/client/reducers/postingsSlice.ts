import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import IPosting from '../../shared/IPosting';

// TODO: rest of this stuff

export enum PostingsStatus {
    LOADING = 'LOADING',
    DONE = 'DONE',
}

export interface PostingsState {
    postings: IPosting[];
    status: PostingsStatus;
}

const initialState: PostingsState = {
    postings: [],
    status: PostingsStatus.LOADING,
}

export const loadPostings = createAsyncThunk(
    'postings/loadPostings',
    async () => {}, // TODO: wrap this middleware logic up
);

export const postingsSlice = createSlice({
    name: 'postings',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(loadPostings.fulfilled, (state, action) => {
            // TODO: state reducer
        });
    }
});
