export interface INotification {
  notification_id: number;

  price: number;
  is_long: boolean;

  created_at: Date;
  updated_at: Date;

  user_id: number;
  instrument_id: number;
};
