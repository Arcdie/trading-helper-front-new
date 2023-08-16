import { useEffect, useState, useRef } from 'react';

import { useActions, useAppSelector } from '../../hooks/redux';

import { join } from '../../libs/helper.lib';
import { MomentLib } from '../../libs/moment.lib';
import { BaseChartLib } from '../../libs/lightweight-charts/base-chart.lib';
import { VolumeChartLib } from '../../libs/lightweight-charts/volume-chart.lib';

import {
  getCandles,
  getFigureLevels,
  addFigureLevel,
  removeFigureLevel,
} from './ChartContainer.api';

import { ECandleType } from '../../interfaces/candle-type.enum';
import { EDrawingTool } from '../../interfaces/drawing-tool.enum';
import { IInstrument } from '../../interfaces/instrument.interface';
import { IFigureLevel } from '../../interfaces/figure-level.interface';

import styles from './ChartContainer.module.scss';

const ChartContainer = () => {
  const {
    setActiveDrawingTool,
    setFigureLevelList,
    setNotificationList,
    addFigureLevelToList,
    addNotificationToList,
    removeFigureLevelFromList,
    removeNotificationFromList,
  } = useActions();

  const {
    activePeriod,
    figureLevelList,
    activeDrawingTool,
  } = useAppSelector(state => state.tradingPage);

  const activeInstrument = useAppSelector(state => state.tradingPage.activeInstrument) as IInstrument;

  // const addNotificaitonRef = useRef(null);
  const activeFigureLevelRef = useRef<IFigureLevel>();
  const figureLevelListRef = useRef<IFigureLevel[]>([]);
  const activeDrawingToolRef = useRef(activeDrawingTool); // todo: костыль

  let baseChart = new BaseChartLib(activePeriod, activeInstrument);
  let volumeChart = new VolumeChartLib(activePeriod);

  const [rulerData, setRulerData] = useState({ value: 0, x: -9999, y: 0 });
  const [addNotificationData, setAddNotificationData] = useState({ x: 0, y: -9999 });
  const [choosenCandle, setChoosenCandleData] = useState({ open: 0, close: 0, high: 0, low: 0, percent: 0 });

  // todo: invent decision for TopMenu.height
  const chartContainerHeight = window.innerHeight - 40;

  const localRemoveFigureLevel = async () => {
    if (!activeFigureLevelRef.current) {
      return true;
    }

    const resultRemove = await removeFigureLevel({
      figureLevelId: activeFigureLevelRef.current.figure_level_id,
    });

    if (resultRemove) {
      baseChart.removeExtraSeries(activeFigureLevelRef.current.figure_level_id.toString());
      removeFigureLevelFromList(activeFigureLevelRef.current);
      activeFigureLevelRef.current = undefined;
    }
  };

  const localRenewChart = async () => {
    const drawFigureLevels = () => {
      figureLevelListRef.current.forEach(figureLevel => {
        const figureLevelOptions = baseChart.addFigureLevel(
          figureLevel.price,
          new Date(figureLevel.started_at),
        );

        if (!figureLevelOptions) {
          return true;
        }

        figureLevelOptions.draw(
          figureLevel.timeframe,
          figureLevel.figure_level_id.toString()
        );
      });
    };

    baseChart.removeChart();
    volumeChart.removeChart();

    baseChart = new BaseChartLib(activePeriod, activeInstrument);
    volumeChart = new VolumeChartLib(activePeriod);

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
      const priceScaleWidth = (baseChart.getPriceScaleWidth() || 0);
      const difference = (volumeChart.getPriceScaleWidth() || 0) - priceScaleWidth;
      volumeChart.updateChartOptions({ width: volumeChart.getChartWidth() + difference });

      setAddNotificationData(prev => ({
        x: window.innerWidth - priceScaleWidth - 20,
        y: prev.y,
      }));
    }, 100);

    drawFigureLevels();

    baseChart.subscribeClick(async params => {
      if (!params.point || !params.time) {
        return true;
      }

      console.log('params.point', params.point);

      let choosenFigureLevel: IFigureLevel | undefined = undefined;
      const price = baseChart.coordinateToPrice(params.point.y);

      const nearestLongFigureLevel = figureLevelListRef.current
        .filter(e => e.price >= price)
        .sort((a, b) => a.price > b.price ? 1 : -1)[0];

      const nearestShortFigureLevels = figureLevelListRef.current
        .filter(e => e.price < price)
        .sort((a, b) => a.price < b.price ? 1 : -1)[0];

      if (nearestLongFigureLevel && !nearestShortFigureLevels) {
        choosenFigureLevel = nearestLongFigureLevel;
      } else if (nearestShortFigureLevels && !nearestLongFigureLevel) {
        choosenFigureLevel = nearestShortFigureLevels;
      } else if (nearestLongFigureLevel && nearestShortFigureLevels) {
        const difLong = Math.abs(nearestLongFigureLevel.price - price);
        const difShort = Math.abs(nearestShortFigureLevels.price - price);
        choosenFigureLevel = difLong < difShort
          ? nearestLongFigureLevel : nearestShortFigureLevels;
      }

      if (choosenFigureLevel) {
        activeFigureLevelRef.current = choosenFigureLevel;
      }

      if (activeDrawingToolRef.current === EDrawingTool.TradingLevel) {
        const price = baseChart.coordinateToPrice(params.point.y);
        const time = (typeof params.time === 'number')
          ? new Date(params.time * 1000) : new Date(params.time as string);

        const figureLevelOptions = baseChart.addFigureLevel(price, time);

        if (!figureLevelOptions) {
          return true;
        }

        const result = await addFigureLevel({
          timeframe: activePeriod,
          price: figureLevelOptions.price,
          startedAt: figureLevelOptions.startedAt,
          instrumentId: activeInstrument.instrument_id,
          isLong: figureLevelOptions.price >= activeInstrument.price,
        });

        if (result) {
          figureLevelOptions.draw(
            activePeriod,
            result.figure_level_id.toString(),
          );

          addFigureLevelToList(result);
          activeFigureLevelRef.current = result;
        }

        setActiveDrawingTool(false);
      }

      if (activeDrawingToolRef.current === EDrawingTool.TradingLine) {
        setActiveDrawingTool(false);
      }
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

          figureLevelListRef.current.forEach(figureLevel => {
            baseChart.removeExtraSeries(figureLevel.figure_level_id.toString());
          });

          drawFigureLevels();
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

        setAddNotificationData(prev => ({
          x: prev.x,
          y: (param.point?.y || 0) - (20 / 2),
        }));
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

  // should be first effect
  useEffect(() => {
    const setFigureLevelsData = async () => {
      const figureLevels = await getFigureLevels({ instrumentId: activeInstrument.instrument_id });
      figureLevels && setFigureLevelList(figureLevels);
    }

    setFigureLevelsData();
  }, [activeInstrument]);

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
      switch (key) {
        case 'r': await localRenewChart(); break;
        case 'Backspace': await localRemoveFigureLevel(); break;
        default: return true;
      }
    };

    localRenewChart();

    window.addEventListener('resize', resizeHandler);
    window.addEventListener('keydown', keyPressedHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('keydown', keyPressedHandler);

      baseChart.removeChart();
      volumeChart.removeChart();
    };
  }, [activePeriod, activeInstrument]);

  useEffect(() => {
    figureLevelListRef.current = figureLevelList;
  }, [figureLevelList]);

  useEffect(() => {
    activeDrawingToolRef.current = activeDrawingTool;
  }, [activeDrawingTool]);

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

        <div
          // ref={addNotificaitonRef}
          className={join(styles.AddNotification)}
          style={{
            top: addNotificationData.y,
            left: addNotificationData.x,
          }}
        ><span>+</span></div>
      </div>

      <div
        id='VolumeChart'
        className={join(styles.VolumeChart)}>
      </div>
    </div>
  </div>;
};

export default ChartContainer;
