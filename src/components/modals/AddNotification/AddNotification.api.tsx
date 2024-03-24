import { AxiosLib } from '../../../libs/axios.lib';

import { HOST_URL } from '../../../App.constants';
import { getHeadersWithAuthorizationToken } from '../../../App.constants'; // todo: do okay

import { INotification } from '../../../interfaces/notification.interface';

const URL_ADD_NOTIFICATION = HOST_URL + '/api/notifications';;

const { makePostRequest } = AxiosLib;

export const addNotification = (data: {
  instrumentId: number;
  price: number;
  isLong: boolean;
  comment?: string;
}) =>
  makePostRequest<INotification>(URL_ADD_NOTIFICATION, data, getHeadersWithAuthorizationToken());
