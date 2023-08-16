import { AxiosLib } from '../../libs/axios.lib';

import { HOST_URL } from '../../App.constants';
import { getHeadersWithAuthorizationToken } from '../../App.constants'; // todo: do okay

import { ECandleType } from '../../interfaces/candle-type.enum';
import { ICandle } from '../../interfaces/candle.interface';
import { IFigureLevel } from '../../interfaces/figure-level.interface';
import { INotification } from '../../interfaces/notification.interface';

const URL_GET_CANDLES = HOST_URL + '/api/candles';
const URL_GET_FIGURE_LEVELS = HOST_URL + '/api/figure-levels';
const URL_ADD_FIGURE_LEVEL = URL_GET_FIGURE_LEVELS;
const URL_REMOVE_FIGURE_LEVEL = URL_GET_FIGURE_LEVELS;
const URL_GET_NOTIFICATIONS = HOST_URL + '/api/notifications';
const URL_ADD_NOTIFICATION = URL_GET_NOTIFICATIONS;
const URL_REMOVE_NOTIFICATION = URL_GET_NOTIFICATIONS;

const {
  makeGetRequest,
  makePostRequest,
  makeDeleteRequest,
} = AxiosLib;

export const getCandles = (data: {
  period: ECandleType,
  instrumentId: number,
  startTime?: string,
  endTime?: string,
}) => makeGetRequest<ICandle[]>(URL_GET_CANDLES, data);

// FigureLevels
export const getFigureLevels = (data: { instrumentId: number; }) =>
  makeGetRequest<IFigureLevel[]>(URL_GET_FIGURE_LEVELS, data, getHeadersWithAuthorizationToken());

export const addFigureLevel = (data: {
  instrumentId: number;
  price: number;
  isLong: boolean;
  timeframe: ECandleType;
  startedAt: Date;
}) =>
  makePostRequest<IFigureLevel>(URL_ADD_FIGURE_LEVEL, data, getHeadersWithAuthorizationToken());

export const removeFigureLevel = (data: { figureLevelId: number; }) =>
  makeDeleteRequest<boolean>(`${URL_REMOVE_FIGURE_LEVEL}/${data.figureLevelId}`, {}, getHeadersWithAuthorizationToken());

// Notifications
export const getNotifications = (data: { instrumentId: number; }) =>
  makeGetRequest<INotification[]>(URL_GET_NOTIFICATIONS, data, getHeadersWithAuthorizationToken());

export const addNotification = (data: {
  instrumentId: number;
  price: number;
  isLong: boolean;
}) =>
  makePostRequest<INotification>(URL_ADD_NOTIFICATION, data, getHeadersWithAuthorizationToken());

export const removeNotification = (data: { notificationId: number; }) =>
  makeDeleteRequest<boolean>(`${URL_REMOVE_NOTIFICATION}/${data.notificationId}`, {}, getHeadersWithAuthorizationToken());
