import { makeGetRequest } from '../../libs/axios';

import { HOST_URL } from '../../App.constants';

import { IInstrument } from '../../interfaces/instrument.interface';

const URL_GET_ACTIVE_INSTRUMENTS = HOST_URL + '/api/instruments/active';

export const getActiveInstruments = () =>
  makeGetRequest<IInstrument[]>(URL_GET_ACTIVE_INSTRUMENTS);
