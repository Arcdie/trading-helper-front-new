import { useEffect, useState } from 'react';

import { join, HelperLib } from '../../libs/helper.lib';

import { getActiveInstruments } from './MonitoringPanel.api';

import { IMonitoringPanelProps } from './MonitoringPanel.props';
import { IInstrument } from '../../interfaces/instrument.interface';
import { ELocalStorageKey } from '../../interfaces/local-storage-key.enum';

import styles from './MonitoringPanel.module.scss';
import { ReactComponent as StarImage } from './images/star.svg';

const MonitoringPanel = ({
  activeInstrument,
  setActiveInstrument,
}: IMonitoringPanelProps) => {
  const [instrumentList, setInstrumentList] = useState<IInstrument[]>([]);
  const [shownInstrumentList, setShownInstrumentList] = useState<IInstrument[]>([]);
  const [favoriteInstrumentList, setFavoriteInstrumentList] = useState<string[]>([]);

  const updateFavoriteInstrumentList = (favoriteInstrument: string) => {
    setFavoriteInstrumentList(
      favoriteInstrumentList.includes(favoriteInstrument)
        ? favoriteInstrumentList.filter(e => e !== favoriteInstrument)
        : [...favoriteInstrumentList, favoriteInstrument],
    );
  };

  const filterShownInstrumentList = (searchingInstrumentValue: string) => {
    const value = searchingInstrumentValue.trim().toLowerCase();

    setShownInstrumentList(
      !value
        ? instrumentList
        : shownInstrumentList.filter(instrument => instrument.name.toLocaleLowerCase().includes(value)),
    );
  };

  useEffect(() => {
    const setData = async () => {
      const instruments = await getActiveInstruments();
     
      if (instruments && instruments.length) {
        setInstrumentList(instruments);
        setShownInstrumentList(instruments);

        const storedActiveInstrumentId = HelperLib
          .getFromLocalStorage<number>(ELocalStorageKey.ACTIVE_INSTRUMENT_ID);

        if (!storedActiveInstrumentId) {
          HelperLib.removeFromLocalStorage(ELocalStorageKey.ACTIVE_INSTRUMENT_ID);
        } else {
          const targetInstrument = instruments.find(e => e.instrument_id === storedActiveInstrumentId);
          targetInstrument && setActiveInstrument(targetInstrument);
        }
      }
    }

    setData();
  }, []);

  return <div className={join(styles.MonitoringPanel)}>
    <div className={join(styles.SearchInstruments)}>
      <input
        type='text'
        placeholder='Поиск'
        className={join('form-control')}
        onChange={(e) => {
          filterShownInstrumentList(e.target.value);
        }}
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
        { shownInstrumentList.map(instrument => <div
              key={instrument.instrument_id}
              onClick={() => setActiveInstrument(instrument)}
              className={join(
                styles.Instrument,
                favoriteInstrumentList.includes(instrument.name) && styles.favorite,
                activeInstrument?.name === instrument.name && styles.active,
              )}
            >
              <div className={join(styles.InstrumentName, 'col-5')}>
                <StarImage
                  className={join('col-1')}
                  onClick={() => updateFavoriteInstrumentList(instrument.name)}
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
