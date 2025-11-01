import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Header } from '../components/Header';

export function PollLandingPage() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Vote in Complete Privacy
            </h2>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Create encrypted polls where votes remain private until the deadline. 
              Powered by Fully Homomorphic Encryption.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              {isConnected ? (
                <>
                  <Link
                    to="/polls"
                    className="px-6 py-3 bg-[#1877F2] text-white rounded-md font-semibold hover:bg-[#166FE5] transition-colors"
                  >
                    Browse Polls
                  </Link>
                  <Link
                    to="/create"
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Create Poll
                  </Link>
                </>
              ) : (
                <div className="text-gray-500">
                  Connect your wallet to get started
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-[#1877F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Encrypted Votes</h3>
            <p className="text-gray-600 text-sm">
              Your vote is encrypted using FHE technology. Nobody can see how you voted until results are revealed.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Verifiable Results</h3>
            <p className="text-gray-600 text-sm">
              All votes are recorded on-chain. Results are transparent and verifiable after the deadline.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Instant Creation</h3>
            <p className="text-gray-600 text-sm">
              Create a poll in seconds. Set your question, deadline, and start collecting encrypted votes.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-[#1877F2] rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold text-white">
                1
              </div>
              <h4 className="font-semibold mb-1 text-gray-900">Create Poll</h4>
              <p className="text-gray-600 text-sm">Set your question and deadline</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-[#1877F2] rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold text-white">
                2
              </div>
              <h4 className="font-semibold mb-1 text-gray-900">Share Link</h4>
              <p className="text-gray-600 text-sm">Invite people to vote</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-[#1877F2] rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold text-white">
                3
              </div>
              <h4 className="font-semibold mb-1 text-gray-900">Encrypted Voting</h4>
              <p className="text-gray-600 text-sm">Votes stay private on-chain</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-[#1877F2] rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold text-white">
                4
              </div>
              <h4 className="font-semibold mb-1 text-gray-900">Reveal Results</h4>
              <p className="text-gray-600 text-sm">See totals after deadline</p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-300 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>Built with Zama FHE • Powered by Ethereum Sepolia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
