import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.scss';

import { store } from './store';
import AuthPage from './pages/AuthPage/AuthPage';
import TradingPage from './pages/TradingPage/TradingPage';
import Code404Page from './pages/HttpErrors/Code404Page';
import CalculatorPage from './pages/CalculatorPage/CalculatorPage';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<CalculatorPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="*" element={<Code404Page />} />
      </Routes>
    </BrowserRouter>
    </Provider>
  );
}

export default App;
