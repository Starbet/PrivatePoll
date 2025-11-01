import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { usePrivatePoll, Poll } from '../hooks/usePrivatePoll';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Header } from '../components/Header';

export function PollDetailPage() {
  const { pollId } = useParams<{ pollId: string }>();
  const { address, isConnected } = useAccount();
  const { getPoll, castVote, hasVoted, revealResults, decryptOwnVote, isLoading } = usePrivatePoll();
  
  const [poll, setPoll] = useState<Poll | null>(null);
  const [userHasVoted, setUserHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState('');
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedVote, setSelectedVote] = useState<boolean | null>(null);

  useEffect(() => {
    loadPoll();
  }, [pollId, address]);

  const loadPoll = async () => {
    if (!pollId || !isConnected) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const pollData = await getPoll(BigInt(pollId));
      setPoll(pollData);

      if (address) {
        const voted = await hasVoted(BigInt(pollId), address);
        setUserHasVoted(voted);
      }
    } catch (error: any) {
      console.error('Error loading poll:', error);
      toast.error('Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (vote: boolean) => {
    setSelectedVote(vote);
    setShowVoteModal(true);
  };

  const confirmVote = async () => {
    if (selectedVote === null || !pollId) return;

    try {
      await castVote(
        BigInt(pollId),
        selectedVote,
        (step) => setProgress(step)
      );
      
      toast.success('Vote submitted successfully!');
      setShowVoteModal(false);
      await loadPoll();
    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error(error.message || 'Failed to submit vote');
    } finally {
      setProgress('');
    }
  };

  const handleRevealResults = async () => {
    if (!pollId) return;

    try {
      await revealResults(
        BigInt(pollId),
        (step) => setProgress(step)
      );
      
      toast.success('Results revealed!');
      await loadPoll();
    } catch (error: any) {
      console.error('Error revealing results:', error);
      toast.error(error.message || 'Failed to reveal results');
    } finally {
      setProgress('');
    }
  };

  const handleDecryptVote = async () => {
    if (!pollId) return;

    try {
      const vote = await decryptOwnVote(
        BigInt(pollId),
        (step) => setProgress(step)
      );
      
      setUserVote(vote);
      toast.success(`Your vote: ${vote ? 'YES' : 'NO'}`);
    } catch (error: any) {
      console.error('Error decrypting vote:', error);
      toast.error(error.message || 'Failed to decrypt vote');
    } finally {
      setProgress('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1877F2] border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Poll Not Found</h3>
            <Link to="/polls" className="text-[#1877F2] hover:underline">
              ← Back to polls
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const now = Date.now() / 1000;
  const isEnded = Number(poll.deadline) <= now;
  const isCreator = address?.toLowerCase() === poll.creator.toLowerCase();
  const yesPercentage = poll.resultsRevealed && poll.totalVotes > 0n
    ? (Number(poll.yesCount) / Number(poll.totalVotes)) * 100
    : 0;
  const noPercentage = poll.resultsRevealed && poll.totalVotes > 0n
    ? (Number(poll.noCount) / Number(poll.totalVotes)) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link to="/polls" className="inline-flex items-center text-gray-600 hover:text-[#1877F2] mb-4 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              {isEnded ? (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                  Ended
                </span>
              ) : (
                <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold">
                  Active
                </span>
              )}
              {isCreator && (
                <span className="px-3 py-1 bg-blue-100 text-[#1877F2] rounded-full text-xs font-semibold">
                  Your Poll
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{poll.question}</h1>
            {poll.description && (
              <p className="text-gray-600 mb-4">{poll.description}</p>
            )}

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {poll.totalVotes.toString()} votes
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isEnded ? 'Ended' : 'Ends'} {formatDistanceToNow(new Date(Number(poll.deadline) * 1000), { addSuffix: true })}
              </div>
            </div>
          </div>

          <div className="p-6">
            {!isEnded && !userHasVoted && (
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Cast Your Vote</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleVote(true)}
                    disabled={isLoading}
                    className="p-4 border-2 border-green-300 rounded-lg hover:bg-green-50 hover:border-green-500 transition-all disabled:opacity-50"
                  >
                    <div className="text-3xl mb-1">👍</div>
                    <div className="text-lg font-bold text-green-600">YES</div>
                  </button>
                  <button
                    onClick={() => handleVote(false)}
                    disabled={isLoading}
                    className="p-4 border-2 border-red-300 rounded-lg hover:bg-red-50 hover:border-red-500 transition-all disabled:opacity-50"
                  >
                    <div className="text-3xl mb-1">👎</div>
                    <div className="text-lg font-bold text-red-600">NO</div>
                  </button>
                </div>
              </div>
            )}

            {userHasVoted && !isEnded && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-[#1877F2] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">You've voted!</p>
                    <p className="text-sm text-gray-600">Your vote is encrypted. Results after deadline.</p>
                  </div>
                </div>
                {userVote !== null && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-sm text-gray-900">
                      Your vote: <span className="font-bold">{userVote ? 'YES 👍' : 'NO 👎'}</span>
                    </p>
                  </div>
                )}
                {userVote === null && (
                  <button
                    onClick={handleDecryptVote}
                    disabled={isLoading}
                    className="mt-3 text-sm text-[#1877F2] hover:underline font-medium disabled:opacity-50"
                  >
                    Decrypt my vote →
                  </button>
                )}
              </div>
            )}

            {poll.resultsRevealed ? (
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Results</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-green-600">YES 👍</span>
                      <span className="font-bold text-green-600">{poll.yesCount.toString()} ({yesPercentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${yesPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-red-600">NO 👎</span>
                      <span className="font-bold text-red-600">{poll.noCount.toString()} ({noPercentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 transition-all duration-500"
                        style={{ width: `${noPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : isEnded ? (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-900 mb-3">
                  <span className="font-semibold">Poll ended.</span> Results need to be revealed.
                </p>
                <button
                  onClick={handleRevealResults}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#1877F2] text-white rounded-md font-semibold hover:bg-[#166FE5] disabled:opacity-50 transition-colors"
                >
                  Reveal Results
                </button>
              </div>
            ) : (
              <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-gray-600 text-sm">
                  Results encrypted until deadline
                </p>
              </div>
            )}

            {progress && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#1877F2] border-t-transparent mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">{progress}</span>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <div className="text-xs text-gray-500">
                Created {formatDistanceToNow(new Date(Number(poll.createdAt) * 1000), { addSuffix: true })} by {poll.creator.slice(0, 6)}...{poll.creator.slice(-4)}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showVoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Confirm Your Vote</h3>
            <p className="text-gray-600 mb-6">
              You are voting <span className="font-bold text-[#1877F2]">{selectedVote ? 'YES 👍' : 'NO 👎'}</span>. 
              Your vote will be encrypted and cannot be changed.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowVoteModal(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmVote}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-[#1877F2] text-white rounded-md font-semibold hover:bg-[#166FE5] disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Submitting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
