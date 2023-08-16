import { useEffect } from 'react';

import { useActions,  useAppSelector } from '../../hooks/redux';

import { ECandleType } from '../../interfaces/candle-type.enum';
import { EDrawingTool } from '../../interfaces/drawing-tool.enum';

import { join } from '../../libs/helper.lib';

import { ReactComponent as SettingsImage } from './images/settings.svg';
import { ReactComponent as FigureLineImage } from './images/figure-line.svg';
import { ReactComponent as FigureLevelImage } from './images/figure-level.svg';

import styles from './TopMenu.module.scss';

const TopMenu = () => {
  const { setActivePeriod, setActiveDrawingTool } = useActions();
  const activePeriod = useAppSelector(state => state.tradingPage.activePeriod);
  const activeInstrument = useAppSelector(state => state.tradingPage.activeInstrument);
  const activeDrawingTool = useAppSelector(state => state.tradingPage.activeDrawingTool);

  const toggleActiveDrawingTool = (currentDrawingTool: EDrawingTool) => {
    setActiveDrawingTool(
      activeDrawingTool === currentDrawingTool
        ? false : currentDrawingTool
    )
  };

  useEffect(() => {
    const keyPressedHandler = ({ key }: KeyboardEvent) => {
      let newActivePeriod: ECandleType;

      switch (key) {
        case 'q': newActivePeriod = ECandleType['5M']; break;
        case 'w': newActivePeriod = ECandleType['1H']; break;
        case 'e': newActivePeriod = ECandleType['1D']; break;
        default: return true;
      }

      setActivePeriod(newActivePeriod);
    };

    window.addEventListener('keydown', keyPressedHandler);
    return () => document.removeEventListener('keydown', keyPressedHandler);
  }, []);

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
