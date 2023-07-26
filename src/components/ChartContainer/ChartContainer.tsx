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

const ChartContainer = ({
  activePeriod,
  activeInstrument,
}: IChartContainerProps) => {
  const chartRef = useRef<IChartApi>();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartDataRef = useRef({
    minValue: 0,
    maxValue: 0,
    maxTopPriceValue: 0,
    maxBottomPriceValue: 0,
  });

  const [chartVersion, setChartVersion] = useState(1);
  const chartContainerHeight = window.innerHeight - 40;

  useEffect(() => {
    const resizeHandler = () => {
      if (chartRef.current) {
        chartRef.current.applyOptions({
          width: window.innerWidth,
          height: window.innerHeight - 40,
        });
      }
    };

    const keyPressedHandler = ({ key }: KeyboardEvent) => {
      if (key !== 'r') {
        return true;
      }

      setChartVersion(prev => prev + 1);
    };

    window.addEventListener('resize', resizeHandler);
    window.addEventListener('keydown', keyPressedHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      document.removeEventListener('keydown', keyPressedHandler);
      chartRef.current && chartRef.current.remove();
    };
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.remove();
    }

    chartRef.current = createChart((chartContainerRef.current as HTMLDivElement), {
      width: chartContainerRef.current?.clientWidth,
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
    });

    const mainSeries = chartRef.current.addCandlestickSeries({
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

        if (res && res.priceRange) {
          // let wereChanges = false;
          chartDataRef.current.minValue = res.priceRange.minValue;
          chartDataRef.current.maxValue = res.priceRange.maxValue;

          if (chartDataRef.current.maxTopPriceValue !== res.priceRange.maxValue) {
            // wereChanges = true;
            chartDataRef.current.maxTopPriceValue = res.priceRange.maxValue;
          }

          if (chartDataRef.current.maxBottomPriceValue !== res.priceRange.minValue) {
            // wereChanges = true;
            chartDataRef.current.maxBottomPriceValue = res.priceRange.minValue;
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
        ref={chartContainerRef}
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
