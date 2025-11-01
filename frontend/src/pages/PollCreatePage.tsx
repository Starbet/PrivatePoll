import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { usePrivatePoll } from '../hooks/usePrivatePoll';
import toast from 'react-hot-toast';
import { Header } from '../components/Header';

export function PollCreatePage() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const { createPoll, isLoading } = usePrivatePoll();
  
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('24');
  const [progress, setProgress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    try {
      const pollId = await createPoll(
        question,
        description,
        Number(duration),
        (step) => setProgress(step)
      );
      
      toast.success('Poll created successfully!');
      navigate(`/poll/${pollId}`);
    } catch (error: any) {
      console.error('Error creating poll:', error);
      toast.error(error.message || 'Failed to create poll');
    } finally {
      setProgress('');
    }
  };

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
            <p className="text-gray-600">Please connect your wallet to create a poll</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 space-y-4">
              {/* Question */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  What's your poll about?
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a yes/no question..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1877F2] focus:border-transparent transition-all"
                  disabled={isLoading}
                  maxLength={200}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {question.length}/200 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Add details (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide more context..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1877F2] focus:border-transparent transition-all resize-none"
                  disabled={isLoading}
                  maxLength={500}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {description.length}/500 characters
                </p>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Poll duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1877F2] focus:border-transparent transition-all"
                  disabled={isLoading}
                >
                  <option value="1">1 hour</option>
                  <option value="6">6 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">24 hours (1 day)</option>
                  <option value="48">48 hours (2 days)</option>
                  <option value="72">72 hours (3 days)</option>
                  <option value="168">1 week</option>
                  <option value="336">2 weeks</option>
                  <option value="720">1 month</option>
                </select>
              </div>

              {/* Progress */}
              {progress && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#1877F2] border-t-transparent mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">{progress}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end items-center space-x-2 border-t border-gray-200">
              <Link
                to="/polls"
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md font-medium transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading || !question.trim()}
                className="px-6 py-2 bg-[#1877F2] text-white rounded-md font-semibold hover:bg-[#166FE5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating...' : 'Post'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
