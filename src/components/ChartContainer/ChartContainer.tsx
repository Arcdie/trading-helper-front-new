import { IChartContainerProps } from './ChartContainer.props';

import styles from './ChartContainer.module.scss';
import { join } from '../../libs/helper';

const ChartContainer = ({}: IChartContainerProps) => {
  return <div
    className={join(styles.ChartContainer)}
    style={{ height: window.innerHeight - 40 }}
  >
    <div className={join(styles.CandleData)}>
      <div>ОТКР<span>0.16213</span></div>
      <div>МАКС<span>0.16213</span></div>
      <div>МИН<span>0.16213</span></div>
      <div>ЗАКР<span>0.16213</span></div>
      <span>5%</span>
    </div>
  </div>;
};

export default ChartContainer;
