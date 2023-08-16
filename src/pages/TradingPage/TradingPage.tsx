import { useState, useEffect } from 'react';

import { useActions, useAppSelector } from '../../hooks/redux';

import { join, HelperLib } from '../../libs/helper.lib';

import { getActiveInstruments, getFavoriteInstruments } from './TradingPage.api';

import TopMenu from '../../components/TopMenu/TopMenu';
import ChartContainer from '../../components/ChartContainer/ChartContainer';
import TradingPanel from '../../components/TradingPanel/TradingPanel';
import MonitoringPanel from '../../components/MonitoringPanel/MonitoringPanel';

import { ELocalStorageKey } from '../../interfaces/local-storage-key.enum';

import styles from './TradingPage.module.scss';

const TradingPage = () => {
  const {
    setActiveInstrument,
    setInstrumentList,
    setFavoriteInstrumentList,
  } = useActions();

  const activeInstrument = useAppSelector(state => state.tradingPage.activeInstrument);

  const [isActiveTradingPanel, setIsActiveTradingPanel] = useState(false);
  const [isActiveMonitoringPanel, setIsActiveMonitoringPanel] = useState(Boolean(activeInstrument));
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

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

  useEffect(() => {
    const setData = async () => {
      const instruments = await getActiveInstruments();
      const favoriteInstruments = await getFavoriteInstruments();
     
      if (instruments && instruments.length) {
        setInstrumentList(instruments);

        const storedActiveInstrumentId = HelperLib
          .getFromLocalStorage<number>(ELocalStorageKey.ACTIVE_INSTRUMENT_ID);

        if (!storedActiveInstrumentId) {
          HelperLib.removeFromLocalStorage(ELocalStorageKey.ACTIVE_INSTRUMENT_ID);
        } else {
          const targetInstrument = instruments.find(e => e.instrument_id === storedActiveInstrumentId);
          targetInstrument && setActiveInstrument(targetInstrument);
        }
      }

      if (favoriteInstruments && favoriteInstruments.length) {
        setFavoriteInstrumentList(favoriteInstruments);
      }
    }

    setData();
  }, []);

  return (
    <div className={styles.TradingPage}>
      <TopMenu/>
      { activeInstrument && <ChartContainer/> }

      <div
        style={{ height: windowSize.height }}
        className={join(styles.RightMenu)}
      >
        { isActiveTradingPanel && <TradingPanel/> }
        { isActiveMonitoringPanel && <MonitoringPanel/> }
      </div>
    </div>
  );
};

export default TradingPage;
