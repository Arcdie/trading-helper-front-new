import { ITopMenuProps } from './TopMenu.props';

import styles from './TopMenu.module.scss';
import { join } from '../../libs/helper';

const TopMenu = ({}: ITopMenuProps) => {
  return <div className={join(styles.TopMenu, 'col-12')}>
    <div className={join(styles.InstrumentName)}>
      <span>ADAUSDTPERP</span>
    </div>

    <div className={join(styles.Separator, 'vr')}></div>

    <div className={join(styles.ChartPeriods)}>
      <div><span>5M</span></div>
      <div><span>1Ч</span></div>
      <div><span>1Д</span></div>
    </div>

    <div className={join(styles.Separator, 'vr')}></div>

    <div className={join(styles.ChartDrawing)}>
      <div>
        <img src="/images/figure-level.svg" alt="figure-level" />
      </div>
      <div>
        <img src="/images/figure-line.svg" alt="figure-line" />
      </div>
    </div>

    <div className={join(styles.Separator, 'vr')}></div>

    <div className={join(styles.Settings)}>
      <div>
        <img src="/images/settings.svg" alt="settings" />
      </div>
    </div>
  </div>;
};

export default TopMenu;
