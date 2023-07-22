import { IMonitoringPanelProps } from './MonitoringPanel.props';

import styles from './MonitoringPanel.module.scss';
import { join } from '../../libs/helper';

const MonitoringPanel = ({}: IMonitoringPanelProps) => {
  return <div
    className={join(styles.MonitoringPanel, 'col-3')}
    style={{ height: window.innerHeight }}
  >
    <div className={join(styles.SearchInstruments)}>
      <input type='text' placeholder='Поиск' className={join('form-control')} />
    </div>

    <div className={join(styles.InstrumentsContainer)}>
      <div className={join(styles.Headlines)}>
        <span className={join(styles.InstrumentName,'col-5')}>Инструмент</span>
        <span className={join('col-2')}>5M</span>
        <span className={join('col-2')}>1H</span>
        <span className={join('col-2')}>1D</span>
      </div>

      <div className={join(styles.InstrumentList)}>
        { [...Array(50)
            .keys()].map(i => <div key={i} className={join(styles.Instrument)}>
            <div className={join(styles.InstrumentName, 'col-5')}>
              <img src='/images/star.svg' alt="star" />
              <span>ADAUSDTPERP</span>
            </div>
            <span className={join(styles.green, 'col-2')}>0.32%</span>
            <span className={join(styles.green, 'col-2')}>0.32%</span>
            <span className={join(styles.red, 'col-2')}>-0.32%</span>
          </div>)
        }
      </div>
    </div>
  </div>;
};

export default MonitoringPanel;
