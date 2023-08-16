import { useState } from 'react';

import { useActions, useAppSelector } from '../../hooks/redux';

import { join, HelperLib } from '../../libs/helper.lib';

import {
  addFavoriteInstrument,
  removeFavoriteInstrument,
} from '../../pages/TradingPage/TradingPage.api';

import { IInstrument } from '../../interfaces/instrument.interface';
import { ELocalStorageKey } from '../../interfaces/local-storage-key.enum';

import styles from './MonitoringPanel.module.scss';
import { ReactComponent as StarImage } from './images/star.svg';

const MonitoringPanel = () => {
  const {
    setActiveInstrument,
    addFavoriteInstrumentToList,
    removeFavoriteInstrumentFromList,
  } = useActions();

  const {
    instrumentList,
    activeInstrument,
    favoriteInstrumentList,
  } = useAppSelector(state => state.tradingPage);

  const [shownInstrumentList, setShownInstrumentList] = useState<IInstrument[]>(instrumentList);
  
  const updateFavoriteInstrumentList = async (instrument: IInstrument) => {
    const doesExist = favoriteInstrumentList.some(e => e.instrument_id === instrument.instrument_id);

    if (doesExist) {
      const resultRemove = await removeFavoriteInstrument({
        instrumentId: instrument.instrument_id,
      });
  
      resultRemove && removeFavoriteInstrumentFromList(instrument);
    } else {
      const resultAdd = await addFavoriteInstrument({
        instrumentId: instrument.instrument_id,
      });
  
      resultAdd && addFavoriteInstrumentToList(resultAdd);
    }
  };

  const filterShownInstrumentList = (searchingInstrumentValue: string) => {
    const value = searchingInstrumentValue.trim().toLowerCase();

    setShownInstrumentList(
      !value
        ? instrumentList
        : shownInstrumentList.filter(instrument => instrument.name.toLocaleLowerCase().includes(value)),
    );
  };

  const setActiveInstrumentWrapper = (instrument: IInstrument) => {
    setActiveInstrument(instrument);

    HelperLib.saveToLocalStorage(
      ELocalStorageKey.ACTIVE_INSTRUMENT_ID,
      instrument.instrument_id,
    );
  };

  return <div className={join(styles.MonitoringPanel)}>
    <div className={join(styles.SearchInstruments)}>
      <input
        type='text'
        placeholder='Поиск'
        className={join('form-control')}
        onChange={(e) => filterShownInstrumentList(e.target.value)}
      />
    </div>

    <div className={join(styles.InstrumentsContainer)}>
      <div className={join(styles.Headlines)}>
        <span className={join(styles.InstrumentName,'col-5')}>Инструмент</span>
        <span className={join('col-2')}>5M</span>
        <span className={join('col-2')}>1H</span>
        <span className={join('col-2')}>1D</span>
      </div>

      <div className={join(styles.InstrumentList)}>
        { shownInstrumentList
          .slice()
          .sort((a, b) => favoriteInstrumentList.some(e => b.instrument_id === e.instrument_id) ? 1 : -1)
          .map(instrument => <div
              key={instrument.instrument_id}
              onClick={() => setActiveInstrumentWrapper(instrument)}
              className={join(
                styles.Instrument,
                favoriteInstrumentList.some(e => e.instrument_id === instrument.instrument_id) && styles.favorite,
                activeInstrument?.name === instrument.name && styles.active,
              )}
            >
              <div className={join(styles.InstrumentName, 'col-5')}>
                <StarImage
                  className={join('col-1')}
                  onClick={() => updateFavoriteInstrumentList(instrument)}
                />
                <span>{instrument.name}</span>
              </div>
              <span className={join('col-2')}>0%</span>
              <span className={join('col-2')}>0%</span>
              <span className={join('col-2')}>0%</span>
            </div>)
        }
      </div>
    </div>
  </div>;
};

export default MonitoringPanel;
