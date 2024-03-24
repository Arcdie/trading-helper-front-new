export interface IAddNotificationProps {
  isShown: boolean;
  notificationPrice: number;
  setIsShown: React.Dispatch<React.SetStateAction<boolean>>
  setNotificationPrice: React.Dispatch<React.SetStateAction<number>>
};
