import {
  IChartApi,
  ISeriesApi,
  createChart,
  DeepPartial,
  LogicalRange,
  UTCTimestamp,
  ChartOptions,
  MouseEventParams,
} from 'lightweight-charts';

import { MomentLib } from '../moment.lib';
import { baseChartSettings } from './base-chart.lib';

import { ITransformedCandle } from './base-chart.lib';
import { ECandleType } from '../../interfaces/candle-type.enum';

const VOLUME_CHART_CONTAINER_ID = 'VolumeChart';

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

  subscribeCrosshairMove(callback: (params: MouseEventParams) => void) {    
    this.chart?.subscribeCrosshairMove(params => callback(params));
  }

  subscribeVisibleLogicalRangeChange(callback: (range: LogicalRange | null) => void) {
    this.chart?.timeScale().subscribeVisibleLogicalRangeChange(range => callback(range))
  }

  setVisibleLogicalRange(range: LogicalRange) {
    this.chart?.timeScale().setVisibleLogicalRange(range);
  }

  getChartWidth() {
    return this.chart?.options().width || 0;
  }

  getPriceScaleWidth() {
    return this.chart?.priceScale('right').width();
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

  drawInMainSeries(candles: ITransformedCandle[], isUpdate = false) {
    const data = candles
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
