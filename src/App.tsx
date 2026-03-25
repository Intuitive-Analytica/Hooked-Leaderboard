import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
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
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
};

export default App;