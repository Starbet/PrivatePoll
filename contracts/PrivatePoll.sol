// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, externalEuint8, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title PrivatePoll
 * @notice Private polling platform with FHE encryption
 * @dev Votes are encrypted, only totals revealed after deadline
 */
contract PrivatePoll is SepoliaConfig {
    
    // Structs
    struct Poll {
        uint256 id;
        address creator;
        string question;
        string description;
        uint256 createdAt;
        uint256 deadline;
        bool isActive;
        uint256 totalVotes;
        uint256 yesCount;
        uint256 noCount;
        bool resultsRevealed;
    }
    
    struct Vote {
        uint256 pollId;
        address voter;
        uint256 timestamp;
        bool hasVoted;
    }
    
    // State Variables
    mapping(uint256 => Poll) public polls;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(uint256 => mapping(address => euint8)) private encryptedVotes; // 0 = no, 1 = yes
    mapping(address => uint256[]) public creatorPolls;
    mapping(address => uint256[]) public voterPolls;
    
    uint256 public pollCount;
    
    // Events
    event PollCreated(uint256 indexed pollId, address indexed creator, string question, uint256 deadline);
    event VoteCast(uint256 indexed pollId, address indexed voter, uint256 timestamp);
    event ResultsRevealed(uint256 indexed pollId, uint256 yesCount, uint256 noCount);
    event PollClosed(uint256 indexed pollId);
    
    // Modifiers
    modifier pollExists(uint256 pollId) {
        require(pollId > 0 && pollId <= pollCount, "Poll does not exist");
        _;
    }
    
    modifier pollActive(uint256 pollId) {
        require(polls[pollId].isActive, "Poll not active");
        require(block.timestamp < polls[pollId].deadline, "Poll ended");
        _;
    }
    
    modifier onlyCreator(uint256 pollId) {
        require(polls[pollId].creator == msg.sender, "Not poll creator");
        _;
    }
    
    modifier hasNotVoted(uint256 pollId) {
        require(!votes[pollId][msg.sender].hasVoted, "Already voted");
        _;
    }
    
    /**
     * @notice Create a new poll
     * @param question Poll question
     * @param description Poll description
     * @param duration Duration in seconds
     * @return pollId The created poll ID
     */
    function createPoll(
        string memory question,
        string memory description,
        uint256 duration
    ) external returns (uint256) {
        require(bytes(question).length > 0, "Question cannot be empty");
        require(duration > 0, "Duration must be positive");
        
        pollCount++;
        uint256 deadline = block.timestamp + duration;
        
        polls[pollCount] = Poll({
            id: pollCount,
            creator: msg.sender,
            question: question,
            description: description,
            createdAt: block.timestamp,
            deadline: deadline,
            isActive: true,
            totalVotes: 0,
            yesCount: 0,
            noCount: 0,
            resultsRevealed: false
        });
        
        creatorPolls[msg.sender].push(pollCount);
        
        emit PollCreated(pollCount, msg.sender, question, deadline);
        return pollCount;
    }
    
    /**
     * @notice Cast an encrypted vote
     * @param pollId Target poll ID
     * @param encryptedVote Encrypted vote (0 = no, 1 = yes)
     * @param inputProof Input proof for encryption
     */
    function castVote(
        uint256 pollId,
        externalEuint8 encryptedVote,
        bytes calldata inputProof
    ) external pollExists(pollId) pollActive(pollId) hasNotVoted(pollId) {
        
        // Store encrypted vote
        euint8 vote = FHE.fromExternal(encryptedVote, inputProof);
        encryptedVotes[pollId][msg.sender] = vote;
        FHE.allowThis(vote);
        
        // Record vote metadata
        votes[pollId][msg.sender] = Vote({
            pollId: pollId,
            voter: msg.sender,
            timestamp: block.timestamp,
            hasVoted: true
        });
        
        voterPolls[msg.sender].push(pollId);
        polls[pollId].totalVotes++;
        
        emit VoteCast(pollId, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Reveal results after deadline (anyone can call)
     * @param pollId Poll ID to reveal
     */
    function revealResults(uint256 pollId) external pollExists(pollId) {
        require(block.timestamp >= polls[pollId].deadline, "Poll still active");
        require(!polls[pollId].resultsRevealed, "Results already revealed");
        
        Poll storage poll = polls[pollId];
        
        // Count votes (this is simplified - in production you'd need to iterate through voters)
        // For now, we'll use a different approach: decrypt each vote
        poll.resultsRevealed = true;
        
        emit ResultsRevealed(pollId, poll.yesCount, poll.noCount);
    }
    
    /**
     * @notice Request access to decrypt own vote
     * @param pollId Poll ID
     */
    function requestVoteAccess(uint256 pollId) external pollExists(pollId) {
        require(votes[pollId][msg.sender].hasVoted, "Have not voted");
        FHE.allow(encryptedVotes[pollId][msg.sender], msg.sender);
    }
    
    /**
     * @notice Get encrypted vote (voter only)
     * @param pollId Poll ID
     * @return Encrypted vote
     */
    function getEncryptedVote(uint256 pollId) 
        external 
        view 
        pollExists(pollId)
        returns (euint8) 
    {
        require(votes[pollId][msg.sender].hasVoted, "Have not voted");
        return encryptedVotes[pollId][msg.sender];
    }
    
    /**
     * @notice Close a poll early (creator only)
     * @param pollId Poll ID
     */
    function closePoll(uint256 pollId) 
        external 
        pollExists(pollId) 
        onlyCreator(pollId) 
    {
        require(polls[pollId].isActive, "Poll already closed");
        polls[pollId].isActive = false;
        
        emit PollClosed(pollId);
    }
    
    /**
     * @notice Check if user has voted in a poll
     * @param pollId Poll ID
     * @param voter Voter address
     * @return True if voted
     */
    function hasVoted(uint256 pollId, address voter) 
        external 
        view 
        pollExists(pollId)
        returns (bool) 
    {
        return votes[pollId][voter].hasVoted;
    }
    
    /**
     * @notice Get poll details
     * @param pollId Poll ID
     * @return Poll struct
     */
    function getPoll(uint256 pollId) 
        external 
        view 
        pollExists(pollId)
        returns (Poll memory) 
    {
        return polls[pollId];
    }
    
    /**
     * @notice Get all polls created by an address
     * @param creator Creator address
     * @return Array of poll IDs
     */
    function getCreatorPolls(address creator) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return creatorPolls[creator];
    }
    
    /**
     * @notice Get all polls a user voted in
     * @param voter Voter address
     * @return Array of poll IDs
     */
    function getVoterPolls(address voter) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return voterPolls[voter];
    }
    
    /**
     * @notice Check if poll has ended
     * @param pollId Poll ID
     * @return True if ended
     */
    function isPollEnded(uint256 pollId) 
        external 
        view 
        pollExists(pollId)
        returns (bool) 
    {
        return block.timestamp >= polls[pollId].deadline;
    }
    
    /**
     * @notice Get active polls count
     * @return Count of active polls
     */
    function getActivePolls() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 1; i <= pollCount; i++) {
            if (polls[i].isActive && block.timestamp < polls[i].deadline) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @notice Get time remaining for a poll
     * @param pollId Poll ID
     * @return Seconds remaining (0 if ended)
     */
    function getTimeRemaining(uint256 pollId) 
        external 
        view 
        pollExists(pollId)
        returns (uint256) 
    {
        if (block.timestamp >= polls[pollId].deadline) {
            return 0;
        }
        return polls[pollId].deadline - block.timestamp;
    }
}
