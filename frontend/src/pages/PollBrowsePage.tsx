import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { usePrivatePoll, Poll } from '../hooks/usePrivatePoll';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Header } from '../components/Header';

export function PollBrowsePage() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const { getPollCount, getPoll } = usePrivatePoll();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('active');

  useEffect(() => {
    loadPolls();
  }, [isConnected]);

  const loadPolls = async () => {
    if (!isConnected) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const count = await getPollCount();
      const pollPromises: Promise<Poll>[] = [];
      
      for (let i = 1n; i <= count; i++) {
        pollPromises.push(getPoll(i));
      }
      
      const loadedPolls = await Promise.all(pollPromises);
      setPolls(loadedPolls.reverse()); // Show newest first
    } catch (error: any) {
      console.error('Error loading polls:', error);
      toast.error('Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const filteredPolls = polls.filter(poll => {
    const now = Date.now() / 1000;
    const isActive = poll.isActive && Number(poll.deadline) > now;
    
    if (filter === 'active') return isActive;
    if (filter === 'ended') return !isActive || Number(poll.deadline) <= now;
    return true;
  });

  const getTimeStatus = (deadline: bigint) => {
    const now = Date.now() / 1000;
    const deadlineSeconds = Number(deadline);
    
    if (deadlineSeconds <= now) {
      return { text: 'Ended', color: 'text-gray-500', bg: 'bg-gray-100' };
    }
    
    const hoursLeft = (deadlineSeconds - now) / 3600;
    if (hoursLeft < 1) {
      return { text: 'Ending soon', color: 'text-red-600', bg: 'bg-red-100' };
    } else if (hoursLeft < 24) {
      return { text: `${Math.floor(hoursLeft)}h left`, color: 'text-orange-600', bg: 'bg-orange-100' };
    } else {
      const daysLeft = Math.floor(hoursLeft / 24);
      return { text: `${daysLeft}d left`, color: 'text-green-600', bg: 'bg-green-100' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setFilter('active')}
              className={`flex-1 px-4 py-3 font-semibold transition-colors ${
                filter === 'active'
                  ? 'text-[#1877F2] border-b-2 border-[#1877F2]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('ended')}
              className={`flex-1 px-4 py-3 font-semibold transition-colors ${
                filter === 'ended'
                  ? 'text-[#1877F2] border-b-2 border-[#1877F2]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Ended
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-4 py-3 font-semibold transition-colors ${
                filter === 'all'
                  ? 'text-[#1877F2] border-b-2 border-[#1877F2]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1877F2] border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading polls...</p>
          </div>
        )}

        {/* Not Connected */}
        {!isConnected && !loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
            <p className="text-gray-600">Please connect your wallet to view and vote on polls</p>
          </div>
        )}

        {/* Polls Grid */}
        {!loading && isConnected && (
          <>
            {filteredPolls.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Polls Found</h3>
                <p className="text-gray-600 mb-6">Be the first to create a poll!</p>
                <Link
                  to="/create"
                  className="inline-block px-6 py-3 bg-[#1877F2] text-white rounded-md font-semibold hover:bg-[#166FE5] transition-colors"
                >
                  Create Poll
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPolls.map((poll) => {
                  const timeStatus = getTimeStatus(poll.deadline);
                  const isEnded = Number(poll.deadline) <= Date.now() / 1000;
                  
                  return (
                    <div
                      key={poll.id.toString()}
                      onClick={() => navigate(`/poll/${poll.id}`)}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-4"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${timeStatus.bg} ${timeStatus.color}`}>
                          {timeStatus.text}
                        </span>
                        <div className="flex items-center text-gray-500 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {poll.totalVotes.toString()} votes
                        </div>
                      </div>

                      {/* Question */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {poll.question}
                      </h3>

                      {/* Description */}
                      {poll.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {poll.description}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(Number(poll.createdAt) * 1000), { addSuffix: true })}
                        </div>
                        {isEnded && poll.resultsRevealed && (
                          <span className="text-xs font-semibold text-[#1877F2]">
                            View Results →
                          </span>
                        )}
                        {!isEnded && (
                          <span className="text-xs font-semibold text-green-600">
                            Vote Now →
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
