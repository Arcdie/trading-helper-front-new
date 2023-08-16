import { AxiosLib } from '../../libs/axios.lib';

import { HOST_URL } from '../../App.constants';
import { getHeadersWithAuthorizationToken } from '../../App.constants'; // todo: do okay

import { IInstrument } from '../../interfaces/instrument.interface';
import { IFavoriteInstrument } from '../../interfaces/favorite-instrument.interface';

const URL_GET_ACTIVE_INSTRUMENTS = HOST_URL + '/api/instruments/active';
const URL_GET_FAVORITE_INSTRUMENTS = HOST_URL + '/api/favorite-instruments';
const URL_ADD_FAVORITE_INSTRUMENT = HOST_URL + '/api/favorite-instruments';
const URL_REMOVE_FAVORITE_INSTRUMENT = HOST_URL + '/api/favorite-instruments';

const {
  makeGetRequest,
  makePostRequest,
  makeDeleteRequest,
} = AxiosLib;

export const getActiveInstruments = () =>
  makeGetRequest<IInstrument[]>(URL_GET_ACTIVE_INSTRUMENTS);

  export const getFavoriteInstruments = (data: {} = {}) =>
  makeGetRequest<IFavoriteInstrument[]>(URL_GET_FAVORITE_INSTRUMENTS, data, getHeadersWithAuthorizationToken());

export const addFavoriteInstrument = (data: { instrumentId: number }) =>
  makePostRequest<IFavoriteInstrument>(URL_ADD_FAVORITE_INSTRUMENT, data, getHeadersWithAuthorizationToken());

export const removeFavoriteInstrument = (data: { instrumentId: number; }) =>
  makeDeleteRequest<boolean>(URL_REMOVE_FAVORITE_INSTRUMENT, data, getHeadersWithAuthorizationToken());
