import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useState } from 'react';

export function Header() {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const formatBalance = (value: string) => {
    const num = parseFloat(value);
    return num.toFixed(4);
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      alert('Address copied!');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowWalletModal(false);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-300 sticky top-0 z-50 shadow-sm">
        {/* Wallet Display - Mobile Only, Above Nav */}
        {isConnected && address && (
          <div className="md:hidden border-b border-gray-200 px-4 py-2">
            <button 
              onClick={() => setShowWalletModal(true)}
              className="w-full flex items-center justify-between hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {address.slice(2, 4).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {balance ? formatBalance(balance.formatted) : '0.0000'} {balance?.symbol || 'SEP'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                </div>
              </div>
              <svg 
                className="w-4 h-4 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Show Connect Button if not connected on mobile */}
        {!isConnected && (
          <div className="md:hidden border-b border-gray-200 px-4 py-2">
            <ConnectButton />
          </div>
        )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Left: Logo and Navigation */}
          <div className="flex items-center space-x-2">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 mr-4">
              <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-[#1877F2] hidden sm:block">
                PrivatePoll
              </span>
            </Link>
            
            {/* Navigation */}
            <nav className="flex items-center space-x-1">
              <Link
                to="/"
                className={`px-4 sm:px-8 py-2 rounded-lg font-medium transition-colors relative ${
                  isActive('/')
                    ? 'text-[#1877F2]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-xs hidden sm:block">Home</span>
                </div>
                {isActive('/') && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1877F2] rounded-t"></div>
                )}
              </Link>
              
              <Link
                to="/polls"
                className={`px-4 sm:px-8 py-2 rounded-lg font-medium transition-colors relative ${
                  isActive('/polls')
                    ? 'text-[#1877F2]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span className="text-xs hidden sm:block">Browse</span>
                </div>
                {isActive('/polls') && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1877F2] rounded-t"></div>
                )}
              </Link>
              
              <Link
                to="/create"
                className={`px-4 sm:px-8 py-2 rounded-lg font-medium transition-colors relative ${
                  isActive('/create')
                    ? 'text-[#1877F2]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs hidden sm:block">Create</span>
                </div>
                {isActive('/create') && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1877F2] rounded-t"></div>
                )}
              </Link>
              
              <Link
                to="/my-polls"
                className={`px-4 sm:px-8 py-2 rounded-lg font-medium transition-colors relative ${
                  isActive('/my-polls')
                    ? 'text-[#1877F2]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-xs hidden sm:block">My Polls</span>
                </div>
                {isActive('/my-polls') && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1877F2] rounded-t"></div>
                )}
              </Link>
            </nav>
          </div>

          {/* Right: Wallet Display - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {isConnected && address ? (
              <button 
                onClick={() => setShowWalletModal(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900">
                  {balance ? formatBalance(balance.formatted) : '0.0000'} {balance?.symbol || 'SEP'}
                </span>
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {address.slice(2, 4).toUpperCase()}
                  </span>
                </div>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
      </div>
      </header>

      {/* Wallet Modal Popup */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={() => setShowWalletModal(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowWalletModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">
                  {address?.slice(2, 4).toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </h3>
              <p className="text-sm text-gray-600">
                {balance ? formatBalance(balance.formatted) : '0.0000'} {balance?.symbol || 'SEP'}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={copyAddress}
                className="w-full flex items-center justify-center space-x-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold text-gray-900">Copy Address</span>
              </button>

              <button
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center space-x-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-semibold text-gray-900">Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
