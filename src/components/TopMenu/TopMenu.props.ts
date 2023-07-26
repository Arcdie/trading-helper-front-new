import { ECandleType } from '../../interfaces/candle-type.enum';
import { IInstrument } from '../../interfaces/instrument.interface';

export interface ITopMenuProps {
  activePeriod: ECandleType;
  activeInstrument?: IInstrument;

  setActivePeriod: React.Dispatch<React.SetStateAction<ECandleType>>
};
