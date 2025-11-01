import { useState } from 'react';
import { usePublicClient, useWalletClient, useAccount } from 'wagmi';
import PrivatePollABI from '../abi/PrivatePoll.json';
import { initializeFHE, encryptVote, decryptVote } from '../utils/fhe';

const CONTRACT_ADDRESS = import.meta.env.VITE_PRIVATEPOLL_CONTRACT_ADDRESS;

export interface Poll {
  id: bigint;
  creator: string;
  question: string;
  description: string;
  createdAt: bigint;
  deadline: bigint;
  isActive: boolean;
  totalVotes: bigint;
  yesCount: bigint;
  noCount: bigint;
  resultsRevealed: boolean;
}

export interface Vote {
  pollId: bigint;
  voter: string;
  timestamp: bigint;
  hasVoted: boolean;
  decryptedVote?: boolean; // true = yes, false = no
}

export function usePrivatePoll() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  // Create Poll
  const createPoll = async (
    question: string,
    description: string,
    durationHours: number,
    onProgress?: (step: string) => void
  ): Promise<bigint> => {
    if (!walletClient || !address) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    try {
      onProgress?.('Creating poll...');
      const duration = BigInt(durationHours * 3600);
      
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: PrivatePollABI.abi,
        functionName: 'createPoll',
        args: [question, description, duration],
      });

      onProgress?.('Waiting for confirmation...');
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      
      // Get poll ID from event
      const log = receipt?.logs[0];
      const pollId = log?.topics[1] ? BigInt(log.topics[1]) : 1n;
      
      return pollId;
    } finally {
      setIsLoading(false);
    }
  };

  // Cast Vote
  const castVote = async (
    pollId: bigint,
    vote: boolean, // true = yes, false = no
    onProgress?: (step: string) => void
  ): Promise<void> => {
    if (!walletClient || !address) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    try {
      onProgress?.('Initializing FHE...');
      const instance = await initializeFHE();
      
      onProgress?.('Encrypting vote...');
      const { encryptedData, inputProof } = await encryptVote(
        instance,
        vote,
        CONTRACT_ADDRESS,
        address
      );

      onProgress?.('Submitting vote...');
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: PrivatePollABI.abi,
        functionName: 'castVote',
        args: [pollId, encryptedData, inputProof],
        gas: 500000n,
      });

      onProgress?.('Waiting for confirmation...');
      await publicClient?.waitForTransactionReceipt({ hash });
    } finally {
      setIsLoading(false);
    }
  };

  // Get Poll
  const getPoll = async (pollId: bigint): Promise<Poll> => {
    if (!publicClient) throw new Error('Public client not available');

    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PrivatePollABI.abi,
      functionName: 'getPoll',
      args: [pollId],
    }) as any;

    if (Array.isArray(result)) {
      return {
        id: result[0],
        creator: result[1],
        question: result[2],
        description: result[3],
        createdAt: result[4],
        deadline: result[5],
        isActive: result[6],
        totalVotes: result[7],
        yesCount: result[8],
        noCount: result[9],
        resultsRevealed: result[10],
      };
    } else {
      return {
        id: result.id,
        creator: result.creator,
        question: result.question,
        description: result.description,
        createdAt: result.createdAt,
        deadline: result.deadline,
        isActive: result.isActive,
        totalVotes: result.totalVotes,
        yesCount: result.yesCount,
        noCount: result.noCount,
        resultsRevealed: result.resultsRevealed,
      };
    }
  };

  // Check if user has voted
  const hasVoted = async (pollId: bigint, voterAddress: string): Promise<boolean> => {
    if (!publicClient) throw new Error('Public client not available');

    const voted = await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PrivatePollABI.abi,
      functionName: 'hasVoted',
      args: [pollId, voterAddress],
    }) as boolean;

    return voted;
  };

  // Get Creator Polls
  const getCreatorPolls = async (creatorAddress: string): Promise<bigint[]> => {
    if (!publicClient) throw new Error('Public client not available');

    const pollIds = await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PrivatePollABI.abi,
      functionName: 'getCreatorPolls',
      args: [creatorAddress],
    }) as bigint[];

    return pollIds;
  };

  // Get Voter Polls
  const getVoterPolls = async (voterAddress: string): Promise<bigint[]> => {
    if (!publicClient) throw new Error('Public client not available');

    const pollIds = await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PrivatePollABI.abi,
      functionName: 'getVoterPolls',
      args: [voterAddress],
    }) as bigint[];

    return pollIds;
  };

  // Decrypt Own Vote
  const decryptOwnVote = async (
    pollId: bigint,
    onProgress?: (step: string) => void
  ): Promise<boolean> => {
    if (!walletClient || !address) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    try {
      onProgress?.('Initializing FHE...');
      const instance = await initializeFHE();
      
      onProgress?.('Requesting access...');
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: PrivatePollABI.abi,
        functionName: 'requestVoteAccess',
        args: [pollId],
        gas: 200000n,
      });
      
      await publicClient?.waitForTransactionReceipt({ hash });
      
      onProgress?.('Fetching encrypted vote...');
      const encryptedHandle = await publicClient?.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: PrivatePollABI.abi,
        functionName: 'getEncryptedVote',
        args: [pollId],
        account: address as `0x${string}`,
      });

      onProgress?.('Decrypting vote...');
      const decrypted = await decryptVote(
        instance,
        CONTRACT_ADDRESS,
        encryptedHandle as Uint8Array,
        address,
        walletClient
      );

      return decrypted;
    } finally {
      setIsLoading(false);
    }
  };

  // Reveal Results
  const revealResults = async (
    pollId: bigint,
    onProgress?: (step: string) => void
  ): Promise<void> => {
    if (!walletClient) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    try {
      onProgress?.('Revealing results...');
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: PrivatePollABI.abi,
        functionName: 'revealResults',
        args: [pollId],
      });

      onProgress?.('Waiting for confirmation...');
      await publicClient?.waitForTransactionReceipt({ hash });
    } finally {
      setIsLoading(false);
    }
  };

  // Close Poll
  const closePoll = async (pollId: bigint): Promise<void> => {
    if (!walletClient) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: PrivatePollABI.abi,
        functionName: 'closePoll',
        args: [pollId],
      });

      await publicClient?.waitForTransactionReceipt({ hash });
    } finally {
      setIsLoading(false);
    }
  };

  // Get Poll Count
  const getPollCount = async (): Promise<bigint> => {
    if (!publicClient) throw new Error('Public client not available');

    const count = await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PrivatePollABI.abi,
      functionName: 'pollCount',
    }) as bigint;

    return count;
  };

  // Check if poll ended
  const isPollEnded = async (pollId: bigint): Promise<boolean> => {
    if (!publicClient) throw new Error('Public client not available');

    const ended = await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PrivatePollABI.abi,
      functionName: 'isPollEnded',
      args: [pollId],
    }) as boolean;

    return ended;
  };

  // Get time remaining
  const getTimeRemaining = async (pollId: bigint): Promise<bigint> => {
    if (!publicClient) throw new Error('Public client not available');

    const remaining = await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PrivatePollABI.abi,
      functionName: 'getTimeRemaining',
      args: [pollId],
    }) as bigint;

    return remaining;
  };

  return {
    createPoll,
    castVote,
    getPoll,
    hasVoted,
    getCreatorPolls,
    getVoterPolls,
    decryptOwnVote,
    revealResults,
    closePoll,
    getPollCount,
    isPollEnded,
    getTimeRemaining,
    isLoading,
  };
}
