import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import useWebSocket from './hooks/useWebSocket';
import useTheme from './hooks/useTheme';

const App = () => {
  const { connect, disconnect } = useWebSocket();
  const { initTheme } = useTheme();

  useEffect(() => {
    initTheme();
    connect();
    return () => disconnect();
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Layout>
  );
};

export default App;