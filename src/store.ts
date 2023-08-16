import {configureStore} from '@reduxjs/toolkit';

import { tradingPageReducer } from './pages/TradingPage/TradingPage.slice';
// import {setupListeners} from '@reduxjs/toolkit/query';

export const store = configureStore({
  reducer: {
    tradingPage: tradingPageReducer,
    // [githubApi.reducerPath]: githubApi.reducer,
    // github: githubReducer
  },
});

// setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
