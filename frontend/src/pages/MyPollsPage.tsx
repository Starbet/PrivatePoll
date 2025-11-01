import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { usePrivatePoll, Poll } from '../hooks/usePrivatePoll';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Header } from '../components/Header';

export function MyPollsPage() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const { getCreatorPolls, getVoterPolls, getPoll } = usePrivatePoll();
  const [createdPolls, setCreatedPolls] = useState<Poll[]>([]);
  const [votedPolls, setVotedPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'created' | 'voted'>('created');

  useEffect(() => {
    loadMyPolls();
  }, [address, isConnected]);

  const loadMyPolls = async () => {
    if (!address || !isConnected) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const createdIds = await getCreatorPolls(address);
      const createdPromises = createdIds.map(id => getPoll(id));
      const created = await Promise.all(createdPromises);
      setCreatedPolls(created.reverse());

      const votedIds = await getVoterPolls(address);
      const votedPromises = votedIds.map(id => getPoll(id));
      const voted = await Promise.all(votedPromises);
      setVotedPolls(voted.reverse());
    } catch (error: any) {
      console.error('Error loading polls:', error);
      toast.error('Failed to load your polls');
    } finally {
      setLoading(false);
    }
  };

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

  const displayPolls = activeTab === 'created' ? createdPolls : votedPolls;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!isConnected ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
            <p className="text-gray-600">Please connect your wallet to view your polls</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Polls Created</p>
                    <p className="text-3xl font-bold text-gray-900">{createdPolls.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#1877F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Votes Cast</p>
                    <p className="text-3xl font-bold text-gray-900">{votedPolls.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md mb-4">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('created')}
                  className={`flex-1 px-4 py-3 font-semibold transition-colors ${
                    activeTab === 'created'
                      ? 'text-[#1877F2] border-b-2 border-[#1877F2]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Created ({createdPolls.length})
                </button>
                <button
                  onClick={() => setActiveTab('voted')}
                  className={`flex-1 px-4 py-3 font-semibold transition-colors ${
                    activeTab === 'voted'
                      ? 'text-[#1877F2] border-b-2 border-[#1877F2]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Voted ({votedPolls.length})
                </button>
              </div>
            </div>

            {loading && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1877F2] border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Loading your polls...</p>
              </div>
            )}

            {!loading && (
              <>
                {displayPolls.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {activeTab === 'created' ? 'No Polls Created' : 'No Votes Cast'}
                    </h3>
                    <p className="text-gray-600">
                      {activeTab === 'created' 
                        ? 'Create your first poll to get started!' 
                        : 'Browse polls and cast your vote!'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayPolls.map((poll) => {
                      const timeStatus = getTimeStatus(poll.deadline);
                      const isEnded = Number(poll.deadline) <= Date.now() / 1000;
                      
                      return (
                        <div
                          key={poll.id.toString()}
                          onClick={() => navigate(`/poll/${poll.id}`)}
                          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-4"
                        >
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

                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {poll.question}
                          </h3>

                          {poll.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {poll.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(Number(poll.createdAt) * 1000), { addSuffix: true })}
                            </div>
                            {isEnded && poll.resultsRevealed && (
                              <span className="text-xs font-semibold text-[#1877F2]">
                                View Results →
                              </span>
                            )}
                            {!isEnded && activeTab === 'created' && (
                              <span className="text-xs font-semibold text-green-600">
                                Active →
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
          </>
        )}
      </main>
    </div>
  );
}
