import { ECandleType } from '../../interfaces/candle-type.enum';
import { EDrawingTool } from '../../interfaces/drawing-tool.enum';
import { IInstrument } from '../../interfaces/instrument.interface';

export interface IChartContainerProps {
  activePeriod: ECandleType;
  activeInstrument: IInstrument;
  
  getActivePeriod: () => Promise<ECandleType>;
  getActiveDrawingTool: () => Promise<EDrawingTool | false>;
  getActiveInstrument: () => Promise<IInstrument | undefined>;

  setActiveDrawingTool: React.Dispatch<React.SetStateAction<EDrawingTool | false>>
};
