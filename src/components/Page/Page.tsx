import { IPageProps } from './Page.prop';

import styles from './Page.module.scss';

const Page = ({ children }: IPageProps) => {
  return <div className={styles.Page}>{children}</div>;
};

export default Page;
