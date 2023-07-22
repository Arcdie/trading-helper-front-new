import React from 'react';
import styles from './App.scss';

import Page from './components/Page/Page';
import TopMenu from './components/TopMenu/TopMenu';
import ChartContainer from './components/ChartContainer/ChartContainer';

import TradingPanel from './components/TradingPanel/TradingPanel';
import MonitoringPanel from './components/MonitoringPanel/MonitoringPanel';

function App() {
  return (
    <div className={styles.App}>
      <Page>
        <TopMenu/>
        <TradingPanel/>
        {/* <MonitoringPanel/> */}
        <ChartContainer/>
      </Page>
    </div>
  );
}

export default App;
