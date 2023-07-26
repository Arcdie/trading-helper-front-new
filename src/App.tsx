import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.scss';

import AuthPage from './components/Pages/AuthPage/AuthPage';
import TradingPage from './components/Pages/TradingPage/TradingPage';
import Code404Page from './components/Pages/HttpErrors/Code404Page';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TradingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Code404Page />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
