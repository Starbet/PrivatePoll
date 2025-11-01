import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { wagmiConfig, chains } from './config/wagmi';
import { PollLandingPage } from './pages/PollLandingPage';
import { PollBrowsePage } from './pages/PollBrowsePage';
import { PollCreatePage } from './pages/PollCreatePage';
import { PollDetailPage } from './pages/PollDetailPage';
import { MyPollsPage } from './pages/MyPollsPage';
import { ChainGuard } from './components/ChainGuard';

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

function AppContent() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
          },
        }}
      />
      
      <ChainGuard>
        <Router>
          <Routes>
            <Route path="/" element={<PollLandingPage />} />
            <Route path="/polls" element={<PollBrowsePage />} />
            <Route path="/create" element={<PollCreatePage />} />
            <Route path="/poll/:pollId" element={<PollDetailPage />} />
            <Route path="/my-polls" element={<MyPollsPage />} />
          </Routes>
        </Router>
      </ChainGuard>
    </>
  );
}

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          chains={chains}
          modalSize="compact"
        >
          <AppContent />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;
