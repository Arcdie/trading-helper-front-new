import { ECandleType } from './candle-type.enum';

export interface IFigureLevel {
  figure_level_id: number;

  price: number;
  is_long: boolean;
  is_active: boolean;
  timeframe: ECandleType;
  started_at: string;

  created_at: Date;
  updated_at: Date;

  user_id: number;
  instrument_id: number;
};
