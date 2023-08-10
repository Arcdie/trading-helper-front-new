import { useState, useEffect } from 'react';

import styles from './TradingPage.module.scss';

import { join,  HelperLib } from '../../libs/helper.lib';

import TopMenu from '../../components/TopMenu/TopMenu';
import ChartContainer from '../../components/ChartContainer/ChartContainer';
import TradingPanel from '../../components/TradingPanel/TradingPanel';
import MonitoringPanel from '../../components/MonitoringPanel/MonitoringPanel';

import { ECandleType } from '../../interfaces/candle-type.enum';
import { IInstrument } from '../../interfaces/instrument.interface';
import { EDrawingTool } from '../../interfaces/drawing-tool.enum';
import { ELocalStorageKey } from '../../interfaces/local-storage-key.enum';

const TradingPage = () => {
  const [activePeriod, setActivePeriod] = useState(ECandleType['1H']);
  const [activeInstrument, setActiveInstrument] = useState<IInstrument>();
  const [isActiveTradingPanel, setIsActiveTradingPanel] = useState(false);
  const [isActiveMonitoringPanel, setIsActiveMonitoringPanel] = useState(true);
  const [activeDrawingTool, setActiveDrawingTool] = useState<EDrawingTool | false>(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const setActiveInstrumentWrapper = (instrument: IInstrument) => {
    setActiveInstrument(instrument);
    HelperLib.saveToLocalStorage(
      ELocalStorageKey.ACTIVE_INSTRUMENT_ID,
      instrument.instrument_id,
    );
    
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
        activeDrawingTool={activeDrawingTool}

        setActivePeriod={setActivePeriod}
        setActiveDrawingTool={setActiveDrawingTool}
      />

      { activeInstrument &&
        <ChartContainer
          activePeriod={activePeriod}
          activeInstrument={activeInstrument}

          getActivePeriod={() => HelperLib.getCurrentState(setActivePeriod)}
          getActiveInstrument={() => HelperLib.getCurrentState(setActiveInstrument)}
          getActiveDrawingTool={() => HelperLib.getCurrentState(setActiveDrawingTool)}

          setActiveDrawingTool={setActiveDrawingTool}
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
