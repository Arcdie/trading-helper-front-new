import { IInstrument } from '../../interfaces/instrument.interface';

export interface IMonitoringPanelProps {
  activeInstrument?: IInstrument;
  setActiveInstrument(instrument: IInstrument): void;
};
