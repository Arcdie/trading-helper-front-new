import { makeGetRequest } from '../../libs/axios';

import { HOST_URL } from '../../App.constants';

import { ECandleType } from '../../interfaces/candle-type.enum';
import { ICandle } from '../../interfaces/candle.interface';

const URL_GET_CANDLES = HOST_URL + '/api/candles';

export const getCandles = (
  instrumentId: number,
  period: ECandleType,
  startTime?: Date,
  endTime?: Date,
) =>
  makeGetRequest<ICandle[]>(URL_GET_CANDLES, {
    period,
    instrumentId,
    startTime,
    endTime,
  });