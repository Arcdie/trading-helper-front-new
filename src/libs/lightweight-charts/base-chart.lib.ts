import {
  IChartApi,
  ISeriesApi,
  createChart,
  DeepPartial,
  UTCTimestamp,
  ChartOptions,
  LogicalRange,
  AutoscaleInfo,
  CandlestickData,
  MouseEventParams,
  LineStyleOptions,
  SeriesOptionsCommon,
} from 'lightweight-charts';

import { HelperLib } from '../helper.lib';
import { MomentLib } from '../moment.lib';
import { AvailablePeriod, MovingAverageLib } from './moving-average.lib';

import { EColor } from '../../interfaces/color.enum';
import { ICandle } from '../../interfaces/candle.interface';
import { ECandleType } from '../../interfaces/candle-type.enum';
import { IInstrument } from '../../interfaces/instrument.interface';

const BASE_CHART_CONTAINER_ID = 'BaseChart';

export interface ITransformedCandle {
  open: number;
  close: number;
  low: number;
  high: number;
  volume: number;
  timeUnix: number;
  timeDate: Date;
};

export const baseChartSettings = {
  heightPercent: 80,
};

export class BaseChartLib {
  private period: ECandleType;
  private instrument: IInstrument;
  private candles: ITransformedCandle[] = [];

  private chart?: IChartApi;
  private mainSeries?: ISeriesApi<'Candlestick'>;
  private extraSeries: {
    seriesId: string;
    series: ISeriesApi<'Line'>;
  }[] = [];

  private minValue: number = 0;
  private maxValue: number = 0;
  private maxTopPriceValue: number = 0;
  private maxBottomPriceValue: number = 0;

  constructor(period: ECandleType, instrument: IInstrument) {
    this.period = period;
    this.instrument = instrument;
  }

  getCandles() {
    return this.candles;
  }

  addCandles(candles: ICandle[]) {
    this.candles.unshift(
      ...BaseChartLib.transformRawCandleData(candles),
    );
  }

  getMovingAverageInstance(period: AvailablePeriod) {
    return new MovingAverageLib(this.chart!, period);
  }

  getStartTimeOfChart() {
    return this.candles[0].timeUnix;
  }

  getCandleData(param: MouseEventParams) {
    return param.seriesData.get(this.mainSeries!) as CandlestickData | undefined;
  }  

  subscribeClick(callback: (params: MouseEventParams) => void) {
    this.chart?.subscribeClick(params => callback(params));
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

  getPriceScaleWidth() {
    return this.chart?.priceScale('right').width();
  }

  isOffChart(range: LogicalRange) {
    const barsInfo = this.mainSeries?.barsInLogicalRange(range);
    return (barsInfo && barsInfo.barsBefore < -20);
  }

  coordinateToPrice(y: number) {
    return this.mainSeries?.coordinateToPrice(y) as number;
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

      ...options,
    });
  }

  addMainSeries() {
    this.mainSeries = this.chart?.addCandlestickSeries({
      upColor: '#000FFF',
      downColor: 'rgba(0, 0, 0, 0)',
      borderDownColor: '#000FFF',
      wickColor: '#000000',

      priceFormat: {
        minMove: this.instrument.tick_size,
        precision: BaseChartLib.getPrecision(this.instrument.price),
      },

      autoscaleInfoProvider: (original: () => AutoscaleInfo) => {
        const res = original();

        if (res && res.priceRange) {
          let isChanged = false;

          this.minValue = res.priceRange.minValue;
          this.maxValue = res.priceRange.maxValue;

          if (this.maxTopPriceValue !== res.priceRange.maxValue) {
            isChanged = true;
            this.maxTopPriceValue = res.priceRange.maxValue;
          }

          if (this.maxBottomPriceValue !== res.priceRange.minValue) {
            isChanged = true;
            this.maxBottomPriceValue = res.priceRange.minValue;
          }

          if (isChanged) {
            this.changePriceRangeForExtraSeries();
          }
        }

        return res;
      },
    });
  }

  getColorForFigureLevel(period: ECandleType) {
    let color = EColor.DARK_BLUE_COLOR;

    switch (period) {
      case ECandleType['5M']: color = EColor.DARK_BLUE_COLOR; break;
      case ECandleType['1H']: color = EColor.BLUE_COLOR; break;
      case ECandleType['1D']: color = EColor.GREEN_COLOR; break;
      default: alert('Unknown period'); break;
    }

    return color;
  }

  addFigureLevel(price: number, startedAt: Date) {
    if (!this.chart || !this.mainSeries) {
      return false;
    }

    const startedAtUnix = HelperLib.getUnix(startedAt);
    const lastCandle = this.candles.at(-1);
    const targetCandle = (this.period !== ECandleType['1D']
      ? this.candles.find(c => c.timeUnix === startedAtUnix)
      : (() => {
        const paramDate = new Date(startedAt).getTime();
        return this.candles.find(c => new Date(c.timeDate).getTime() === paramDate);
      })()) || this.candles[0];

    if (!targetCandle || !lastCandle) {
      return false;
    }

    return {
      price,
      startedAt: targetCandle.timeDate,
      draw: (color: string, seriesId: string) => {
        const newExtraSeries = this.addExtraSeries({ color }, seriesId);
    
        newExtraSeries && this.drawInExtraSeries(
          newExtraSeries,
          [targetCandle, lastCandle].map(candle => ({
            price,
            timeUnix: candle.timeUnix,
            timeDate: candle.timeDate,
          }))
        );

        this.changePriceRangeForExtraSeries();
      },
    };
  }

  addNotification(price: number, startedAt: Date) {
    return this.addFigureLevel(price, startedAt);
  }

  addExtraSeries(
    options: DeepPartial<LineStyleOptions & SeriesOptionsCommon> = {},
    seriesId: string = HelperLib.generateUniqueId(),
  ) {
    if (!this.chart) {
      return false;
    }

    const newExtraSeries = this.chart.addLineSeries({
      priceLineSource: 0,
      priceLineVisible: false,
      lastValueVisible: false,
      lineWidth: 1,

      priceFormat: {
        minMove: this.instrument.tick_size,
        precision: BaseChartLib.getPrecision(this.instrument.price),
      },

      ...options,
    });

    this.extraSeries.push({
      seriesId,
      series: newExtraSeries,
    });

    return newExtraSeries;
  }

  removeExtraSeries(seriesId: string) {
    const targetSeries = this.extraSeries.find(s => s.seriesId === seriesId);
    
    if (this.chart && targetSeries) {
      this.chart.removeSeries(targetSeries.series);
      this.extraSeries = this.extraSeries.filter(s => s.seriesId !== seriesId);
    }
  }

  drawInMainSeries(isUpdate = false) {
    const data = this.candles
      .map(e => ({
        ...e,
        time: (this.period !== ECandleType['1D'] ?
          e.timeUnix : MomentLib.toYearMonthDayFormat(e.timeDate)) as UTCTimestamp,
      }));

    if (!isUpdate) {
      this.mainSeries?.setData(data);
    } else {
      this.mainSeries?.update(data[0]);
    }
  }

  drawInExtraSeries(series: ISeriesApi<'Line'>, data: { price: number; timeUnix: number; timeDate: Date }[]) {
    series.setData(data.map(e => ({
      value: e.price,
      time: (this.period !== ECandleType['1D'] ?
        e.timeUnix : MomentLib.toYearMonthDayFormat(e.timeDate)) as UTCTimestamp,
    })));
  }

  calculateHeight(containerHeight: number) {
    return containerHeight * (baseChartSettings.heightPercent / 100);
  }

  private changePriceRangeForExtraSeries() {
    this.extraSeries.forEach(series => {
      series.series.applyOptions({
        autoscaleInfoProvider: () => ({
          priceRange: {
            minValue: this.minValue,
            maxValue: this.maxValue,
          },
        }),
      });
    });
  }

  static getPrecision(price: number) {
    const dividedPrice = price.toString().split('.');
    return !dividedPrice[1] ? 0 : dividedPrice[1].length; 
  }
  
  static transformRawCandleData(candles: ICandle[]): ITransformedCandle[] {  
    return candles
      .map(candle => {
        const timeUnix = HelperLib.getUnix(candle.time);
  
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
