import { useState, useEffect } from 'react';

import styles from './TradingPage.module.scss';

import { join } from '../../../libs/helper.lib';

import TopMenu from '../../TopMenu/TopMenu';
import ChartContainer from '../../ChartContainer/ChartContainer';
import TradingPanel from '../../TradingPanel/TradingPanel';
import MonitoringPanel from '../../MonitoringPanel/MonitoringPanel';

import { ECandleType } from '../../../interfaces/candle-type.enum';
import { IInstrument } from '../../../interfaces/instrument.interface';

const TradingPage = () => {
  const [activePeriod, setActivePeriod] = useState(ECandleType['1H']);
  const [activeInstrument, setActiveInstrument] = useState<IInstrument>();
  const [isActiveTradingPanel, setIsActiveTradingPanel] = useState(false);
  const [isActiveMonitoringPanel, setIsActiveMonitoringPanel] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const setActiveInstrumentWrapper = (instrument: IInstrument) => {
    setActiveInstrument(instrument);
    document.title = instrument.name;
  };

  useEffect(() => {
    const resizeHandler = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    const moveFigureHandler = async ({ key }: KeyboardEvent) => {
      if (!['t', 'l'].includes(key)) {
        return true;
      }

      if (key === 'l') {
        setIsActiveTradingPanel(isActiveTradingPanel => {
          if (isActiveTradingPanel) {
            setIsActiveMonitoringPanel(true);
            return false;
          }

          setIsActiveMonitoringPanel(prev => !prev);
          return isActiveTradingPanel;
        });
      } else if (key === 't') {
        setIsActiveMonitoringPanel(isActiveMonitoringPanel => {
          if (isActiveMonitoringPanel) {
            setIsActiveTradingPanel(true);
            return false;
          }
          
          setIsActiveTradingPanel(prev => !prev);
          return isActiveMonitoringPanel;
        });
      }
    };

    window.addEventListener('resize', resizeHandler);
    window.addEventListener('keydown', moveFigureHandler);

    return () => {
      document.removeEventListener('resize', resizeHandler);
      document.removeEventListener('keydown', moveFigureHandler);
    }
  }, []);

  return (
    <div className={styles.TradingPage}>
      <TopMenu
        activePeriod={activePeriod}
        activeInstrument={activeInstrument}

        setActivePeriod={setActivePeriod}
      />

      { activeInstrument &&
        <ChartContainer
          activePeriod={activePeriod}
          activeInstrument={activeInstrument}
        />
      }

      <div
        style={{ height: windowSize.height }}
        className={join(styles.RightMenu)}
      >
        { isActiveTradingPanel && <TradingPanel/> }
        { isActiveMonitoringPanel &&
          <MonitoringPanel
            activeInstrument={activeInstrument}
            setActiveInstrument={setActiveInstrumentWrapper}
          /> }
      </div>
    </div>
  );
};

export default TradingPage;
