import { useEffect, useRef, useState } from 'react';

import { join } from '../../libs/helper.lib';
import { BaseChartLib } from '../../libs/lightweight-charts/base-chart.lib';
import { VolumeChartLib } from '../../libs/lightweight-charts/volume-chart.lib';

import { getCandles } from './ChartContainer.api';

import { IChartContainerProps } from './ChartContainer.props';
import { ECandleType } from '../../interfaces/candle-type.enum';
import { EDrawingTool } from '../../interfaces/drawing-tool.enum';

import styles from './ChartContainer.module.scss';
import { MomentLib } from '../../libs/moment.lib';

const ChartContainer = ({
  activePeriod,
  activeInstrument,

  getActivePeriod,
  getActiveInstrument,
  getActiveDrawingTool,

  setActiveDrawingTool,
}: IChartContainerProps) => {
  const baseChart = new BaseChartLib(activePeriod, activeInstrument);
  const volumeChart = new VolumeChartLib(activePeriod);

  const [rulerData, setRulerData] = useState({ value: 0, x: -9999, y: 0 });
  const [choosenCandle, setChoosenCandleData] = useState({ open: 0, close: 0, high: 0, low: 0, percent: 0 });

  // todo: invent decision for TopMenu.height
  const chartContainerHeight = window.innerHeight - 40;

  const localRenewChart = async () => {
    baseChart.removeChart();
    volumeChart.removeChart();

    const activePeriod = await getActivePeriod();
    const activeInstrument = await getActiveInstrument();

    if (!activeInstrument) {
      return;
    }

    baseChart.renewChart({ height: baseChart.calculateHeight(chartContainerHeight) });
    volumeChart.renewChart({ height: volumeChart.calculateHeight(chartContainerHeight) });

    const candles = await getCandles({
      period: activePeriod,
      instrumentId: activeInstrument.instrument_id,
    });

    if (!candles) return;

    baseChart.addCandles(candles);
    baseChart.drawInMainSeries();
    volumeChart.drawInMainSeries(baseChart.getCandles());

    setTimeout(() => {
      const difference = (volumeChart.getPriceScaleWidth() || 0) - (baseChart.getPriceScaleWidth() || 0);
      volumeChart.updateChartOptions({ width: volumeChart.getChartWidth() + difference });
    }, 0);

    baseChart.subscribeClick(async params => {
      const activeDrawingTool = await getActiveDrawingTool();

      if (!activeDrawingTool) {
        return true;
      }

      if (activeDrawingTool === EDrawingTool.TradingLevel) {
        baseChart.addFigureLevel(params);
      }

      setActiveDrawingTool(false);
    });

    if (activePeriod !== ECandleType['1D']) {
      let isHistoryEnd = false;
      let isStartedLoading = false;

      baseChart.subscribeVisibleLogicalRangeChange(async range => {
        if (isStartedLoading || isHistoryEnd) {
          return;
        }

        if (range && baseChart.isOffChart(range)) {
          isStartedLoading = true;
          const startTimeOfChart = baseChart.getStartTimeOfChart();
          const endTime = MomentLib.toUTC(new Date(startTimeOfChart * 1000));

          const candles = await getCandles({
            period: activePeriod,
            instrumentId: activeInstrument.instrument_id,
            endTime,
          });

          isStartedLoading = false;

          if (!candles) {
            isHistoryEnd = true;
            return;
          }

          baseChart.addCandles(candles);
          baseChart.drawInMainSeries();
          volumeChart.drawInMainSeries(baseChart.getCandles());
        }
      });
    }

    baseChart.subscribeCrosshairMove(param => {
      if (param.time) {
        const candleData = baseChart.getCandleData(param);

        if (candleData) {
          const difference = Math.abs(candleData.close - candleData.open);
          const percent = 100 / (candleData.open / difference);

          setChoosenCandleData({
            open: candleData.open,
            close: candleData.close,
            high: candleData.high,
            low: candleData.low,
            percent: parseFloat(percent.toFixed(1)),
          });
        }
      }

      if (param.point) {
        const coordinateToPrice = baseChart.coordinateToPrice(param.point.y);
        const instrumentPrice = activeInstrument.price;
        const difference = Math.abs(instrumentPrice - coordinateToPrice);
        const percent = 100 / (instrumentPrice / difference);

        setRulerData({
          value: parseFloat(percent.toFixed(1)),
          x: param.point.x + 13,
          y: param.point.y - 32,
        });
      }

      if (param.point && param.time) {
        baseChart.subscribeVisibleLogicalRangeChange(range => {
          range && volumeChart.setVisibleLogicalRange(range);
        });
      }
    });

    volumeChart.subscribeCrosshairMove(param => {
      if (param.point && param.time) {
        volumeChart.subscribeVisibleLogicalRangeChange(range => {
          range && baseChart.setVisibleLogicalRange(range);
        });
      }
    });    
  };

  useEffect(() => {
    const resizeHandler = () => {
      const chartContainerHeight = window.innerHeight - 40;
      const difference = (volumeChart.getPriceScaleWidth() || 0) - (baseChart.getPriceScaleWidth() || 0);

      baseChart && baseChart.updateChartOptions({
        width: window.innerWidth,
        height: baseChart.calculateHeight(chartContainerHeight),
      });

      volumeChart && volumeChart.updateChartOptions({
        width: window.innerWidth + difference,
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
      window.removeEventListener('keydown', keyPressedHandler);
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
      <div>ОТКР<span>{choosenCandle.open}</span></div>
      <div>МАКС<span>{choosenCandle.high}</span></div>
      <div>МИН<span>{choosenCandle.low}</span></div>
      <div>ЗАКР<span>{choosenCandle.close}</span></div>
      <span>{choosenCandle.percent}%</span>
    </div>

    <div className={join(styles.ChartList)}>
      <div
        id='BaseChart'
        className={join(styles.BaseChart)}
      >
        <span
          className={join(styles.Ruler)}
          style={{
            top: rulerData.y,
            left: rulerData.x,
          }}
        >{rulerData.value}%</span>
      </div>

      <div
        id='VolumeChart'
        className={join(styles.VolumeChart)}>
      </div>
    </div>
  </div>;
};

export default ChartContainer;
