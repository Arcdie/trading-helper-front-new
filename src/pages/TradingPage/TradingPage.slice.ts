import { PayloadAction, createSlice, } from '@reduxjs/toolkit'

import { ECandleType } from '../../interfaces/candle-type.enum';
import { EDrawingTool } from '../../interfaces/drawing-tool.enum';
import { IInstrument } from '../../interfaces/instrument.interface';
import { IFigureLevel } from '../../interfaces/figure-level.interface';
import { INotification } from '../../interfaces/notification.interface';
import { IFavoriteInstrument } from '../../interfaces/favorite-instrument.interface';

export interface TradingPageState {
  activePeriod: ECandleType;
  activeInstrument?: IInstrument;
  activeDrawingTool: EDrawingTool | false;

  instrumentList: IInstrument[];
  figureLevelList: IFigureLevel[];
  notificationList: INotification[];
  favoriteInstrumentList: IFavoriteInstrument[];
};

const initialState: TradingPageState = {
  activeDrawingTool: false,
  activePeriod: ECandleType['1H'],

  instrumentList: [],
  figureLevelList: [],
  notificationList: [],
  favoriteInstrumentList: [],
};

const figureLevelReducers = {
  setFigureLevelList: (state: TradingPageState, action: PayloadAction<IFigureLevel[]>) => {
    state.figureLevelList = action.payload;
  },

  addFigureLevelToList: (state: TradingPageState, action: PayloadAction<IFigureLevel>) => {
    state.figureLevelList.push(action.payload);
  },

  removeFigureLevelFromList: (state: TradingPageState, action: PayloadAction<IFigureLevel>) => {
    state.figureLevelList = state.figureLevelList
      .filter(e => e.figure_level_id !== action.payload.figure_level_id);
  },
};

const favoriteInstrumentReducers = {
  setFavoriteInstrumentList: (state: TradingPageState, action: PayloadAction<IFavoriteInstrument[]>) => {
    state.favoriteInstrumentList = action.payload;
  },

  addFavoriteInstrumentToList: (state: TradingPageState, action: PayloadAction<IFavoriteInstrument>) => {
    state.favoriteInstrumentList.push(action.payload);
  },

  removeFavoriteInstrumentFromList: (state: TradingPageState, action: PayloadAction<IInstrument>) => {
    state.favoriteInstrumentList = state.favoriteInstrumentList
      .filter(e => e.instrument_id !== action.payload.instrument_id);
  },
};

const notificationReducers = {
  setNotificationList: (state: TradingPageState, action: PayloadAction<INotification[]>) => {
    state.notificationList = action.payload;
  },

  addNotificationToList: (state: TradingPageState, action: PayloadAction<INotification>) => {
    state.notificationList.push(action.payload);
  },

  removeNotificationFromList: (state: TradingPageState, action: PayloadAction<INotification>) => {
    state.notificationList = state.notificationList
      .filter(e => e.notification_id !== action.payload.notification_id);
  },
};

export const tradingPageSlice = createSlice({
  name: 'TradingPage',
  initialState,
  reducers: {
    setActivePeriod: (state, action: PayloadAction<ECandleType>) => {
      state.activePeriod = action.payload;
    },

    setActiveInstrument: (state, action: PayloadAction<IInstrument>) => {
      document.title = action.payload.name;
      state.activeInstrument = action.payload;
    },

    setActiveDrawingTool: (state, action: PayloadAction<EDrawingTool | false>) => {
      state.activeDrawingTool = action.payload;
    },

    setInstrumentList: (state, action: PayloadAction<IInstrument[]>) => {
      state.instrumentList = action.payload;
    },

    ...figureLevelReducers,
    ...notificationReducers,
    ...favoriteInstrumentReducers,
  }
});

export const tradingPageActions = tradingPageSlice.actions;
export const tradingPageReducer = tradingPageSlice.reducer;
