import { useEffect } from 'react';

import { useActions,  useAppSelector } from '../../hooks/redux';

import { ECandleType } from '../../interfaces/candle-type.enum';
import { EDrawingTool } from '../../interfaces/drawing-tool.enum';
import { EServiceTool } from '../../interfaces/service-tool.enum';

import { join } from '../../libs/helper.lib';

import { ReactComponent as SettingsImage } from './images/settings.svg';
import { ReactComponent as FigureLineImage } from './images/figure-line.svg';
import { ReactComponent as FigureLevelImage } from './images/figure-level.svg';

import styles from './TopMenu.module.scss';

const TopMenu = () => {
  const {
    setActivePeriod,
    setActiveDrawingTool,
    setActiveServiceTool,
  } = useActions();

  const {
    activePeriod,
    activeInstrument,
    activeDrawingTool,
    activeServiceTool,
  } = useAppSelector(state => state.tradingPage);

  const toggleActiveDrawingTool = (currentDrawingTool: EDrawingTool) => {
    setActiveDrawingTool(
      activeDrawingTool === currentDrawingTool
        ? false : currentDrawingTool
    )
  };

  const toggleActiveServiceTool = (currentServiceTool: EServiceTool) => {
    setActiveServiceTool(
      activeServiceTool === currentServiceTool
        ? false : currentServiceTool
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

    <div className={join(styles.Tools)}>
      <div
        title='Добавить оповещение'
        className={join(activeServiceTool && activeServiceTool === EServiceTool.Notification && styles.active)}
        onClick={() => toggleActiveServiceTool(EServiceTool.Notification)}
      >
        <span>N</span>
      </div>
    </div>

    <div className={join(styles.Separator, 'vr')}></div>

    <div className={join(styles.Settings)}>
      <div><SettingsImage /></div>
    </div>
  </div>;
};

export default TopMenu;
