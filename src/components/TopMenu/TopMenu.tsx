import { useState } from 'react';

import { ITopMenuProps } from './TopMenu.props';
import { ECandleType } from '../../interfaces/candle-type.enum';
import { EDrawingTool } from '../../interfaces/drawing-tool.enum';

import styles from './TopMenu.module.scss';
import { join } from '../../libs/helper.lib';

import { ReactComponent as SettingsImage } from './images/settings.svg';
import { ReactComponent as FigureLineImage } from './images/figure-line.svg';
import { ReactComponent as FigureLevelImage } from './images/figure-level.svg';

const TopMenu = ({
  activeInstrument,
  activePeriod,

  setActivePeriod,
}: ITopMenuProps) => {
  const [activeDrawingTool, setActiveDrawingTool] = useState<EDrawingTool | false>(false);

  const toggleActiveDrawingTool = (currentDrawingTool: EDrawingTool) => {
    setActiveDrawingTool(
      activeDrawingTool === currentDrawingTool
        ? false : currentDrawingTool
    )
  };

  return <div className={join(styles.TopMenu, 'col-12')}>
    <div className={join(styles.InstrumentName)}>
      <span>{activeInstrument?.name || 'Выберите инструмент'}</span>
    </div>

    <div className={join(styles.Separator, 'vr')}></div>

    <div className={join(styles.ChartPeriods)}>
      { Object.values(ECandleType).map(period =>
        <div
          key={period}
          onClick={() => setActivePeriod(period)}
          className={join(activePeriod === period && styles.active)}
        ><span>{period}</span></div>
        )
      }
    </div>

    <div className={join(styles.Separator, 'vr')}></div>

    <div className={join(styles.ChartDrawing)}>
      <div
        onClick={() => toggleActiveDrawingTool(EDrawingTool.TradingLevel)}
        className={join(activeDrawingTool && activeDrawingTool === EDrawingTool.TradingLevel && styles.active)}
      ><FigureLevelImage /></div>
      <div
        onClick={() => toggleActiveDrawingTool(EDrawingTool.TradingLine)}
        className={join(activeDrawingTool && activeDrawingTool === EDrawingTool.TradingLine && styles.active)}
      ><FigureLineImage /></div>
    </div>

    <div className={join(styles.Separator, 'vr')}></div>

    <div className={join(styles.Settings)}>
      <div><SettingsImage /></div>
    </div>
  </div>;
};

export default TopMenu;
