import { useEffect } from 'react';

import { join } from '../../libs/helper.lib';
import { BaseChartLib, VolumeChartLib } from '../../libs/lightweight-charts.lib';

import { getCandles } from './ChartContainer.api';

import { IChartContainerProps } from './ChartContainer.props';

import styles from './ChartContainer.module.scss';

const ChartContainer = ({
  activePeriod,
  activeInstrument,
}: IChartContainerProps) => {
  const baseChart = new BaseChartLib(activePeriod, activeInstrument);
  const volumeChart = new VolumeChartLib(activePeriod);

  // todo: invent decision for TopMenu.height
  const chartContainerHeight = window.innerHeight - 40;

  const localRenewChart = async () => {
    baseChart.renewChart({ height: baseChart.calculateHeight(chartContainerHeight) });
    volumeChart.renewChart({ height: volumeChart.calculateHeight(chartContainerHeight) });

    const candles = await getCandles(activeInstrument.instrument_id, activePeriod);

    if (!candles) return;
    baseChart.drawInChart(candles);
    volumeChart.drawInChart(candles);
  };

  useEffect(() => {
    const resizeHandler = () => {
      const chartContainerHeight = window.innerHeight - 40;

      baseChart.updateChartOptions({
        width: window.innerWidth,
        height: baseChart.calculateHeight(chartContainerHeight),
      });

      volumeChart.updateChartOptions({
        width: window.innerWidth,
        height: volumeChart.calculateHeight(chartContainerHeight),
      });
    };

    const keyPressedHandler = async ({ key }: KeyboardEvent) => {
      if (key !== 'r') {
        return true;
      }

      await localRenewChart();
    };

    window.addEventListener('resize', resizeHandler);
    window.addEventListener('keydown', keyPressedHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      document.removeEventListener('keydown', keyPressedHandler);
    };
  }, []);

  useEffect(() => {
    localRenewChart();

    return () => {
      baseChart.removeChart();
      volumeChart.removeChart();
    };
  }, [activePeriod, activeInstrument]);

  return <div
    className={join(styles.ChartContainer)}
    style={{ height: chartContainerHeight }}
  >
    <div className={join(styles.CandleData)}>
      <div>ОТКР<span>0</span></div>
      <div>МАКС<span>0</span></div>
      <div>МИН<span>0</span></div>
      <div>ЗАКР<span>0</span></div>
      <span>0%</span>
    </div>

    <div className={join(styles.ChartList)}>
      <div
        id='BaseChart'
        className={join(styles.BaseChart)}
      ></div>

      <div
        id='VolumeChart'
        className={join(styles.VolumeChart)}>
      </div>
    </div>
  </div>;
};

export default ChartContainer;
