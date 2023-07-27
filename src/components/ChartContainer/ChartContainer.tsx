import { useEffect, useRef, useState } from 'react';
import { createChart, AutoscaleInfoProvider, IChartApi, UTCTimestamp } from 'lightweight-charts';

import { MomentLib } from '../../libs/moment.lib';
import { join, HelperLib } from '../../libs/helper.lib';
import { LightweightChartLib } from '../../libs/lightweight-charts.lib';

import { getCandles } from './ChartContainer.api';

import { IChartContainerProps } from './ChartContainer.props';
import { ICandle } from '../../interfaces/candle.interface';
import { ECandleType } from '../../interfaces/candle-type.enum';

import styles from './ChartContainer.module.scss';

const getPrecision = (price: number) => {
  const dividedPrice = price.toString().split('.');
  return !dividedPrice[1] ? 0 : dividedPrice[1].length; 
}

const transformRawCandleData = (candles: ICandle[]) => {
  const userTimezone = -(new Date().getTimezoneOffset());

  return candles
    .map(candle => {
      const timeUnix = HelperLib.getUnix(candle.time) + (userTimezone * 60);

      return {
        open: candle.data[0],
        close: candle.data[1],
        low: candle.data[2],
        high: candle.data[3],
        volume: candle.volume,

        timeUnix,
        timeDate: MomentLib.toYearMonthDayFormat(new Date(timeUnix * 1000)),
      };
    })
    .sort((a, b) => a.timeUnix < b.timeUnix ? -1 : 1);
}

interface IBaseChart {
  chart: IChartApi;
  chartData: {
    minValue: number;
    maxValue: number;
    maxTopPriceValue: number;
    maxBottomPriceValue: number;
  };
}

const ChartContainer = ({
  activePeriod,
  activeInstrument,
}: IChartContainerProps) => {
  const baseChartRef = useRef<IBaseChart>();
  const baseChartContainerRef = useRef(null);

  // const [chartVersion, setChartVersion] = useState(1);
  const chartContainerHeight = window.innerHeight - 40;

  useEffect(() => {
    const resizeHandler = () => {
      if (baseChartRef.current) {
        const { chart } = baseChartRef.current;
        chart!.applyOptions({
          width: window.innerWidth,
          height: window.innerHeight - 40,
        });
      }
    };

    const keyPressedHandler = ({ key }: KeyboardEvent) => {
      if (key !== 'r') {
        return true;
      }

      // setChartVersion(prev => prev + 1);
    };

    window.addEventListener('resize', resizeHandler);
    window.addEventListener('keydown', keyPressedHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      document.removeEventListener('keydown', keyPressedHandler);
      // baseChartRef.current && baseChartRef.current.chart.remove();
    };
  }, []);

  useEffect(() => {
    baseChartRef.current?.chart.remove();
    const container = baseChartContainerRef.current! as HTMLDivElement;

    baseChartRef.current = {
      chart: createChart(container, {
        width: container.clientWidth,
        height: chartContainerHeight,
        layout: {
          background: {
            color: 'white',
          },
        },
  
        crosshair: {
          mode: 0,
        },
  
        timeScale: {
          rightOffset: 12,
          secondsVisible: false,
          timeVisible: [ECandleType['5M'], ECandleType['1H']].includes(activePeriod),
        },
  
        handleScale: {
          axisPressedMouseMove: {
            time: true,
            price: false,
          },
        },
  
        // rightPriceScale: {
        //   width: 60,
        // },
      }),

      chartData: {
        minValue: 0,
        maxValue: 0,
        maxTopPriceValue: 0,
        maxBottomPriceValue: 0,
      },
    };
  
    const mainSeries = baseChartRef.current.chart.addCandlestickSeries({
      upColor: '#000FFF',
      downColor: 'rgba(0, 0, 0, 0)',
      borderDownColor: '#000FFF',
      wickColor: '#000000',

      priceFormat: {
        minMove: activeInstrument.tick_size,
        precision: getPrecision(activeInstrument.price),
      },

      autoscaleInfoProvider: (original: AutoscaleInfoProvider) => {
        const res = original(() => null);

        if (res && res.priceRange && baseChartRef.current) {
          // let wereChanges = false;
          baseChartRef.current.chartData.minValue = res.priceRange.minValue;
          baseChartRef.current.chartData.maxValue = res.priceRange.maxValue;

          if (baseChartRef.current.chartData.maxTopPriceValue !== res.priceRange.maxValue) {
            // wereChanges = true;
            baseChartRef.current.chartData.maxTopPriceValue = res.priceRange.maxValue;
          }

          if (baseChartRef.current.chartData.maxBottomPriceValue !== res.priceRange.minValue) {
            // wereChanges = true;
            baseChartRef.current.chartData.maxBottomPriceValue = res.priceRange.minValue;
          }

          // if (wereChanges) {
          //   this.changePriceRangeForExtraSeries();
          // }
        }

        return res;
      },
    });

    getCandles(
      activeInstrument.instrument_id,
      activePeriod,
    )
      .then(candles => {
        if (!candles) return;

        const data = transformRawCandleData(candles);
        mainSeries.setData(data.map(d => ({
          ...d,
          time: (activePeriod !== ECandleType['1D'] ? d.timeUnix : d.timeDate) as UTCTimestamp,
        })));
      });
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
        ref={baseChartContainerRef}
        className={join(styles.BaseChart)}
      ></div>

      <div
        // ref={chartContainerRef}
        className={join(styles.VolumeChart)}>
      </div>
    </div>
  </div>;
};

export default ChartContainer;
