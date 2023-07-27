import {
  IChartApi,
  ISeriesApi,
  createChart,
  DeepPartial,
  UTCTimestamp,
  ChartOptions,
  AutoscaleInfoProvider,
} from 'lightweight-charts';

import { HelperLib } from './helper.lib';
import { MomentLib } from './moment.lib';

import { ICandle } from '../interfaces/candle.interface';
import { ECandleType } from '../interfaces/candle-type.enum';
import { IInstrument } from '../interfaces/instrument.interface';

const BASE_CHART_CONTAINER_ID = 'BaseChart';
const VOLUME_CHART_CONTAINER_ID = 'VolumeChart';

const baseChartSettings = {
  heightPercent: 80,
};

const volumeChartSettings = {
  // heightPercent: 100 - baseChartSettings.heightPercent,
};

export class VolumeChartLib {
  private period: ECandleType;

  private chart?: IChartApi;
  private mainSeries?: ISeriesApi<'Histogram'>;

  constructor(period: ECandleType) {
    this.period = period;    
  }
  
  getChartContainer() {
    const container = document.getElementById(VOLUME_CHART_CONTAINER_ID);

    if (!container) {
      throw new Error(`No #${VOLUME_CHART_CONTAINER_ID} in dom`);
    }
    
    return container;
  }

  updateChartOptions(options: DeepPartial<ChartOptions>) {
    this.chart?.applyOptions(options)
  }

  removeChart() {
    this.chart?.remove();
  }

  renewChart(options: DeepPartial<ChartOptions> = {}) {
    this.createChart(options);
    this.addMainSeries();
  }

  createChart(options: DeepPartial<ChartOptions> = {}) {
    const container = this.getChartContainer();

    this.chart = createChart(container, {
      width: container.clientWidth,

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
        timeVisible: [ECandleType['5M'], ECandleType['1H']].includes(this.period),
      },

      // rightPriceScale: {
      //   width: 60,
      // },

      ...options,
    });
  }

  addMainSeries() {
    this.mainSeries = this.chart?.addHistogramSeries({
      color: 'rgba(12, 50, 153, .5)',

      priceFormat: {
        type: 'volume',
      },
    });
  }

  drawInChart(candles: ICandle[], isUpdate = false) {
    const data = 
      (BaseChartLib.transformRawCandleData(candles))
      .map(e => ({
        value: e.volume,
        time: (this.period !== ECandleType['1D'] ?
          e.timeUnix : MomentLib.toYearMonthDayFormat(e.timeDate)) as UTCTimestamp,
      }));

    if (!isUpdate) {
      this.mainSeries?.setData(data);
    } else {
      this.mainSeries?.update(data[0]);
    }
  }

  calculateHeight(containerHeight: number) {
    const heightPercent = 100 - baseChartSettings.heightPercent;
    return containerHeight * (heightPercent / 100);
  }
}

export class BaseChartLib {
  private period: ECandleType;
  private instrument: IInstrument;
  private chart?: IChartApi;
  private mainSeries?: ISeriesApi<'Candlestick'>;

  private minValue: number = 0;
  private maxValue: number = 0;
  private maxTopPriceValue: number = 0;
  private maxBottomPriceValue: number = 0;

  constructor(period: ECandleType, instrument: IInstrument) {
    this.period = period;
    this.instrument = instrument;
  }

  getChartContainer() {
    const container = document.getElementById(BASE_CHART_CONTAINER_ID);

    if (!container) {
      throw new Error(`No #${BASE_CHART_CONTAINER_ID} in dom`);
    }
    
    return container;
  }

  updateChartOptions(options: DeepPartial<ChartOptions>) {
    this.chart?.applyOptions(options)
  }

  removeChart() {
    this.chart?.remove();
  }

  renewChart(options: DeepPartial<ChartOptions> = {}) {
    this.createChart(options);
    this.addMainSeries();
  }

  createChart(options: DeepPartial<ChartOptions> = {}) {
    const container = this.getChartContainer();

    this.chart = createChart(container, {
      width: container.clientWidth,

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
        timeVisible: [ECandleType['5M'], ECandleType['1H']].includes(this.period),
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

      ...options,
    });
  }

  addMainSeries() {
    const _this = this;

    this.mainSeries = this.chart?.addCandlestickSeries({
      upColor: '#000FFF',
      downColor: 'rgba(0, 0, 0, 0)',
      borderDownColor: '#000FFF',
      wickColor: '#000000',

      priceFormat: {
        minMove: this.instrument.tick_size,
        precision: BaseChartLib.getPrecision(this.instrument.price),
      },

      autoscaleInfoProvider: (original: AutoscaleInfoProvider) => {
        const res = original(() => null);

        if (res && res.priceRange) {
          // let wereChanges = false;
          _this.minValue = res.priceRange.minValue;
          _this.maxValue = res.priceRange.maxValue;

          if (_this.maxTopPriceValue !== res.priceRange.maxValue) {
            // wereChanges = true;
            _this.maxTopPriceValue = res.priceRange.maxValue;
          }

          if (_this.maxBottomPriceValue !== res.priceRange.minValue) {
            // wereChanges = true;
            _this.maxBottomPriceValue = res.priceRange.minValue;
          }

          // if (wereChanges) {
          //   this.changePriceRangeForExtraSeries();
          // }
        }

        return res;
      },
    });
  }

  drawInChart(candles: ICandle[], isUpdate = false) {
    const data = 
      (BaseChartLib.transformRawCandleData(candles))
      .map(e => ({
        ...e,
        time: (this.period !== ECandleType['1D'] ?
          e.timeUnix : MomentLib.toYearMonthDayFormat(e.timeDate)) as UTCTimestamp,
      }));

    // this.changePriceRangeForExtraSeries();

    if (!isUpdate) {
      this.mainSeries?.setData(data);
    } else {
      this.mainSeries?.update(data[0]);
    }
  }

  calculateHeight(containerHeight: number) {
    return containerHeight * (baseChartSettings.heightPercent / 100);
  }

  static getPrecision(price: number) {
    const dividedPrice = price.toString().split('.');
    return !dividedPrice[1] ? 0 : dividedPrice[1].length; 
  }
  
  static transformRawCandleData(candles: ICandle[]) {
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
          timeDate: new Date(timeUnix * 1000),
        };
      })
      .sort((a, b) => a.timeUnix < b.timeUnix ? -1 : 1);
  }
}
