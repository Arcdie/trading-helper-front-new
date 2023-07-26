import { ITradingPanelProps } from './TradingPanel.props';

import styles from './TradingPanel.module.scss';
import { join } from '../../libs/helper.lib';

const TradingPanel = ({}: ITradingPanelProps) => {
  return <div className={join(styles.TradingPanel )}>
    <div className={join(styles.TradingSides, 'col-10')}>
      <div className={join(styles.Long, 'col-6')}>
        <p>Купить</p>
        <span>0.16056</span>
      </div>

      <div className={join(styles.Short, 'col-6')}>
        <p>Продать</p>
        <span>0.16056</span>
      </div>
    </div>

    <div className={join(styles.SumTrade, 'col-10')}>
      <input className='form-control' type='text' placeholder='$' value='10' />
    </div>

    <div className={join(styles.Limits, 'col-11')}>
      <div className={join(styles.TakeProfit, 'col-6')}>
        <div className={join(styles.LimitName, 'form-check')}>
          <input id='checkTakeProfit' type="checkbox" className='form-check-input' />
          <label htmlFor="checkTakeProfit" className='form-check-label'>Тейк-профит</label>
        </div>

        <div className={join(styles.LimitValues, 'col-12')}>
          <div className='col-10'>
            <input className='form-control' type='text' placeholder='0.15495' />
            <span style={{right: -24}}>$</span>
          </div>
          <div className='col-10'>
            <input className='form-control' type='text' placeholder='0.00' />
            <span style={{right: -26}}>%</span>
          </div>
          <div className='col-10'>
            <input className='form-control' type='text' placeholder='3' />
            <span style={{right: -22}}>:</span>
          </div>
        </div>
      </div>

      <div className={join(styles.StopLoss, 'col-6')}>
        <div className={join(styles.LimitName, 'form-check')}>
          <input id='checkStopLoss' type="checkbox" className='form-check-input' />
          <label htmlFor="checkStopLoss" className='form-check-label'>Стоп-лосс</label>
        </div>

        <div className={join(styles.LimitValues, 'col-12')}>
        <div className='col-10'><input className='form-control' type='text' placeholder='0.15495' /></div>
          <div className='col-10'><input className='form-control' type='text' placeholder='0.00' /></div>
          <div className='col-10'><input className='form-control' type='text' placeholder='3' /></div>
        </div>
      </div>
    </div>
  </div>;
};

export default TradingPanel;
