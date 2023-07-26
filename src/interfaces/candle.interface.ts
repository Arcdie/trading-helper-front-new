export interface ICandle {
  candle_id: number;
  instrument_id: number;
  data: [number, number, number, number];
  volume: number;
  time: Date;
  created_at: Date;
}
