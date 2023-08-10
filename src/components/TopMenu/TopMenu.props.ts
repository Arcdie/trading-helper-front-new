import { ECandleType } from '../../interfaces/candle-type.enum';
import { EDrawingTool } from '../../interfaces/drawing-tool.enum';
import { IInstrument } from '../../interfaces/instrument.interface';

export interface ITopMenuProps {
  activePeriod: ECandleType;
  activeInstrument?: IInstrument;
  activeDrawingTool: EDrawingTool | false;

  setActivePeriod: React.Dispatch<React.SetStateAction<ECandleType>>
  setActiveDrawingTool: React.Dispatch<React.SetStateAction<EDrawingTool | false>>
};
