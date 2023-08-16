import { AxiosLib } from '../../libs/axios.lib';

import { HOST_URL } from '../../App.constants';
import { getHeadersWithAuthorizationToken } from '../../App.constants'; // todo: do okay

const URL_GET_FAVORITE_INSTRUMENTS = HOST_URL + '/api/instruments/favorite';

const {
  makeGetRequest,
} = AxiosLib;

// export const getFavoriteInstruments = () => makeGetRequest<IFa[]>(URL_GET_CANDLES, data);
