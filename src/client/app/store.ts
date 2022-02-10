import {
    configureStore,
    ThunkAction, 
    Action
} from '@reduxjs/toolkit';
import userReducer from '../reducers/userSlice';
import postingsReducer from '../reducers/postingsSlice';
import currentPostReducer from '../reducers/currentPostingSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        postings: postingsReducer,
        currentPost: currentPostReducer,
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;

export default store;
