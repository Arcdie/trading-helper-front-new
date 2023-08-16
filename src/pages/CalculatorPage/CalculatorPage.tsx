import { useState, useEffect } from 'react';

import { join, HelperLib } from '../../libs/helper.lib';

import { ECalculatorPageLocalStorageKey } from './calculator-page-local-storage-key.enum';

import styles from './CalculatorPage.module.scss';

const getPrecision = (price: number) => {
  const dividedPrice = price.toString().split('.');
  return !dividedPrice[1] ? 0 : dividedPrice[1].length;
}

const calculateSumLoss = (sumDeposit: number, allowedLossPercentPerDeposit: number) => {
  let allowedSumLoss = (sumDeposit * (allowedLossPercentPerDeposit / 100));

  if (Number.isNaN(allowedSumLoss)) {
    allowedSumLoss = 0;
  }
  
  if (getPrecision(allowedSumLoss) !== 0) {
    allowedSumLoss = parseFloat(allowedSumLoss.toFixed(2));
  }

  return allowedSumLoss;
};

const CalculatorPage = () => {
  const [quantity, setQuantity] = useState(0);
  
  const [sumDeposit, setSumDeposit] = useState(
    HelperLib.getFromLocalStorage(ECalculatorPageLocalStorageKey.SUM_DEPOSIT) || 100
  );

  const [stopLossPrice, setStopLossPrice] = useState(
    HelperLib.getFromLocalStorage(ECalculatorPageLocalStorageKey.STOPLOSS_PRICE) || 0
  );

  const [instrumentPrice, setInstrumentPrice] = useState(
    HelperLib.getFromLocalStorage(ECalculatorPageLocalStorageKey.INSTRUMENT_PRICE) || 0
  );

  const [allowedLossPercentPerDeposit, setAllowedLossPercentPerDeposit] = useState(
    HelperLib.getFromLocalStorage(ECalculatorPageLocalStorageKey.ALLOWED_LOSS_PERCENT_PER_DEPOSIT) || 1
  );

  const [sumDepositText, setSumDepositText] = useState(sumDeposit.toString());
  const [stopLossPriceText, setStopLossPriceText] = useState(stopLossPrice.toString());
  const [instrumentPriceText, setInstrumentPriceText] = useState(instrumentPrice.toString());
  const [allowedLossPercentPerDepositText, setAllowedLossPercentPerDepositText] = useState(allowedLossPercentPerDeposit.toString());

  const [allowedSumLoss, setAllowedSumLoss] = useState(calculateSumLoss(sumDeposit, allowedLossPercentPerDeposit));

  useEffect(() => {
    const instrumentPrice = parseFloat(instrumentPriceText.replace(',', '.'));

    if (!Number.isNaN(instrumentPrice)) {
      setInstrumentPrice(instrumentPrice);
      HelperLib.saveToLocalStorage(ECalculatorPageLocalStorageKey.INSTRUMENT_PRICE, instrumentPrice);
    }
  }, [instrumentPriceText]);

  useEffect(() => {
    const stopLossPrice = parseFloat(stopLossPriceText.replace(',', '.'));
    if (!Number.isNaN(stopLossPrice)) {
      setStopLossPrice(stopLossPrice);
      HelperLib.saveToLocalStorage(ECalculatorPageLocalStorageKey.STOPLOSS_PRICE, stopLossPrice);
    }
  }, [stopLossPriceText]);

  useEffect(() => {
    const sumDeposit = parseFloat(sumDepositText.replace(',', '.'));
    if (!Number.isNaN(sumDeposit)) {
      setSumDeposit(sumDeposit);
      HelperLib.saveToLocalStorage(ECalculatorPageLocalStorageKey.SUM_DEPOSIT, sumDeposit);
    }
  }, [sumDepositText]);

  useEffect(() => {
    const allowedLossPercentPerDeposit = parseFloat(allowedLossPercentPerDepositText.replace(',', '.'));
    if (!Number.isNaN(allowedLossPercentPerDeposit)) {
      setAllowedLossPercentPerDeposit(allowedLossPercentPerDeposit);
      HelperLib.saveToLocalStorage(ECalculatorPageLocalStorageKey.ALLOWED_LOSS_PERCENT_PER_DEPOSIT, allowedLossPercentPerDeposit);
    }
  }, [allowedLossPercentPerDepositText]);

  useEffect(() => {
    setAllowedSumLoss(calculateSumLoss(sumDeposit, allowedLossPercentPerDeposit));
  }, [sumDeposit, allowedLossPercentPerDeposit]);

  useEffect(() => {
    if (!sumDeposit || !stopLossPrice || !instrumentPrice || !allowedLossPercentPerDeposit) {
      return;
    }

    const getLoss = (stopLossPrice: number, instrumentPrice: number, quantity: number) =>
      (stopLossPrice - instrumentPrice) * quantity;

    let newQuantity = sumDeposit / instrumentPrice;
    let loss = Math.abs(getLoss(stopLossPrice, instrumentPrice, newQuantity));
    const coefficient = loss / allowedSumLoss;

    if (coefficient > 0) {
      newQuantity /= coefficient;
    }

    setQuantity(newQuantity);
  }, [sumDeposit, stopLossPrice, instrumentPrice, allowedLossPercentPerDeposit]);

  return (
    <div className={styles.CalculatorPage} style={{ height: window.innerHeight }}>
      <div className={join('col-5', styles.CalculatorContainer)}>
        <div className={join('col-5')}>
          <div className={join('mb-3')}>
            <label htmlFor='instrumentPrice' className="form-label">Цена инструмента</label>
            <input
              type='text'
              id="instrumentPrice"
              className={join('form-control')}
              value={ instrumentPriceText }
              onChange={e => setInstrumentPriceText(e.target.value)}
            />
          </div>

          <div className={join('mb-3')}>
            <label htmlFor='stopLossPrice' className="form-label">Стоп цена</label>
            <input
              type='text'
              id="stopLossPrice"
              className={join('form-control')}
              value={ stopLossPriceText }
              onChange={e => setStopLossPriceText(e.target.value)}
            />
          </div>

          <div className={join('mb-3')}>
            <label htmlFor='sumDeposit' className="form-label">Депозит</label>
            <input
              type='text'
              id="sumDeposit"
              className={join('form-control')}
              value={ sumDepositText }
              onChange={e => setSumDepositText(e.target.value)}
            />
          </div>

          <div className={join('mb-3')}>
            <label
              htmlFor='allowedLossPercentPerDeposit'
              className="form-label"
            >% от депозита ({ allowedSumLoss }$)
            </label>
            <input
              type='text'
              id="allowedLossPercentPerDeposit"
              className={join('form-control')}
              value={ allowedLossPercentPerDepositText }
              onChange={e => setAllowedLossPercentPerDepositText(e.target.value)}
            />
          </div>
        </div>

        <div className={join('col-2', styles.Divider)}>
          <div className={'vr'}></div>
        </div>

        <div className={join('col-5')}>
          <div className={join('mb-3')}>
            <label htmlFor='quantity' className="form-label">Количество лотов</label>
            <input
              disabled
              type='text'
              id="quantity"
              className={join('form-control')}
              value={ quantity }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
