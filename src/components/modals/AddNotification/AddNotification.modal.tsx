import { useEffect, useState } from 'react';
import { Modal, Button} from 'react-bootstrap';

import { useActions, useAppSelector } from '../../../hooks/redux';

import { join } from '../../../libs/helper.lib';

import { addNotification } from './AddNotification.api';

import { IAddNotificationProps } from './AddNotification.props';

import { IInstrument } from '../../../interfaces/instrument.interface';

import styles from './AddNotification.module.scss';

const AddNotificationModal = ({
  isShown,
  notificationPrice,

  setIsShown,
  setNotificationPrice,
}: IAddNotificationProps) => {
  const [notificationComment, setNotificationComment] = useState('');
  const [notificationPriceText, setNotificationPriceText] = useState(notificationPrice.toString());
  const activeInstrument = useAppSelector(state => state.tradingPage.activeInstrument) as IInstrument;

  const { addNotificationToList } = useActions();

  const localAddNotification = async () => {
    if (!notificationPrice || Number.isNaN(notificationPrice)) {
      return false;
    }

    const result = await addNotification({
      instrumentId: activeInstrument.instrument_id,
      price: notificationPrice,
      isLong: activeInstrument.price < notificationPrice,
      comment: notificationComment,
    });

    if (!result) {
      return false;
    }

    setIsShown(false);
    addNotificationToList(result);
  };

  useEffect(() => {
    const notificationPrice = parseFloat(notificationPriceText.replace(',', '.'));
    if (!Number.isNaN(notificationPrice)) {
      setNotificationPrice(notificationPrice);
    }
  }, [notificationPriceText]);

  return (
    <Modal show={isShown} onHide={() =>setIsShown(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Добавить оповещение</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className={join('col-12')}>
          <div className={join('mb-3')}>
            <label htmlFor='notificationPrice' className="form-label">Цена инструмента</label>
            <input
              type='text'
              id="notificationPrice"
              className={join('form-control')}
              value={ notificationPrice }
              onChange={e => setNotificationPriceText(e.target.value)}
            />
          </div>

          <div className={join('mb-3')}>
            <label htmlFor='notificationComment' className="form-label">Комментарий</label>
            <textarea
              id="notificationComment"
              className={join('form-control')}
              value={ notificationComment }
              onChange={e => setNotificationComment(e.target.value)}
            />
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button
        variant='primary'
        onClick={() => localAddNotification()}
      >Добавить</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddNotificationModal;
