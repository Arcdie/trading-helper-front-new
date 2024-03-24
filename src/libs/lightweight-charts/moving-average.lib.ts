import { IChartApi, ISeriesApi, Time } from 'lightweight-charts';

import { ITransformedCandle } from './base-chart.lib';

export type AvailablePeriod = 20 | 50 | 200;

enum EAvailableColor {
  BLUE_COLOR = '#2196F3',
  GREEN_COLOR = '#4CAF50',
  DARK_BLUE_COLOR = '#0800FF',
}

export class MovingAverageLib {
  private chart: IChartApi;
  private period: AvailablePeriod;
  private mainSeries: ISeriesApi<'Line'>;

  constructor(chart: IChartApi, period: AvailablePeriod) {
    this.chart = chart;
    this.period = period;

    this.mainSeries = this.getMainSeries();
  }

  getSeriesColor() {
    let returnValue;

    switch (this.period) {
      case 20: returnValue = EAvailableColor.DARK_BLUE_COLOR; break;
      case 50: returnValue = EAvailableColor.BLUE_COLOR; break;
      case 200: returnValue = EAvailableColor.GREEN_COLOR; break;
      default: throw new Error('Unknown period');
    }

    return returnValue;
  }

  getMainSeries() {
    return this.chart.addLineSeries({
      color: this.getSeriesColor(),
      priceLineSource: 0,
      priceLineVisible: false,
      lastValueVisible: false,
      lineWidth: 1,
    });
  }

  drawInMainSeries(candles: ITransformedCandle[], isUpdate = false) {
    let data = this.calculateData(candles);

    if (!isUpdate) {
      data = data.slice(this.period, data.length);
      this.mainSeries.setData(data);
    } else {
      this.mainSeries.update(data[0]);
    }
  }

  calculateData(candles: ITransformedCandle[]) {
    const workingData: number[] = [];
    const resultData: { time: Time; value: number; }[] = [];

    candles.forEach((candle, index) => {
      workingData.push(candle.close);

      const currentData = workingData.slice(index - (this.period - 1));
      const sum = currentData.reduce((i, close) => i + close, 0);
      const average = sum / currentData.length;

      resultData.push({
        time: candle.timeUnix as Time,
        value: average,
      });
    });

    return resultData;
  }
}
