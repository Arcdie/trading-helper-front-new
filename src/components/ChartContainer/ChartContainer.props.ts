import { ECandleType } from '../../interfaces/candle-type.enum';
import { IInstrument } from '../../interfaces/instrument.interface';

export interface IChartContainerProps {
  activePeriod: ECandleType;
  activeInstrument: IInstrument;
};
