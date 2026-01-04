// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CivicIssueTracker
 * @dev Smart contract for transparent civic issue tracking and voting
 */
contract CivicIssueTracker {
    
    // Structure to store issue details
    struct Issue {
        string issueId;        // MongoDB ObjectId
        string title;          // Issue title (truncated to 100 chars)
        address reportedBy;    // Wallet address of reporter
        uint256 timestamp;     // Block timestamp when recorded
        uint256 voteCount;     // Total votes received
        bool exists;           // Check if issue exists
    }
    
    // Structure to store vote details
    struct Vote {
        address voter;         // Wallet address of voter
        string issueId;        // Issue being voted on
        uint256 timestamp;     // When vote was cast
        bool support;          // true = upvote, false = downvote
    }
    
    // Mappings
    mapping(string => Issue) public issues;
    mapping(string => Vote[]) public issueVotes;
    mapping(address => string[]) public userIssues;
    mapping(address => mapping(string => bool)) public hasVoted;
    
    // Arrays to track all issues
    string[] public allIssueIds;
    
    // Events
    event IssueRecorded(
        string indexed issueId,
        string title,
        address indexed reportedBy,
        uint256 timestamp
    );
    
    event VoteRecorded(
        string indexed issueId,
        address indexed voter,
        bool support,
        uint256 timestamp
    );
    
    event IssueStatusUpdated(
        string indexed issueId,
        string newStatus,
        uint256 timestamp
    );
    
    /**
     * @dev Record a new civic issue on the blockchain
     * @param _issueId MongoDB ObjectId of the issue
     * @param _title Title of the issue (max 100 chars)
     */
    function recordIssue(
        string memory _issueId,
        string memory _title
    ) public {
        require(bytes(_issueId).length > 0, "Issue ID cannot be empty");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(!issues[_issueId].exists, "Issue already recorded");
        
        issues[_issueId] = Issue({
            issueId: _issueId,
            title: _title,
            reportedBy: msg.sender,
            timestamp: block.timestamp,
            voteCount: 0,
            exists: true
        });
        
        allIssueIds.push(_issueId);
        userIssues[msg.sender].push(_issueId);
        
        emit IssueRecorded(_issueId, _title, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Record a vote on an issue
     * @param _issueId Issue to vote on
     * @param _support True for upvote, false for downvote
     */
    function recordVote(
        string memory _issueId,
        bool _support
    ) public {
        require(issues[_issueId].exists, "Issue does not exist");
        require(!hasVoted[msg.sender][_issueId], "Already voted on this issue");
        
        Vote memory newVote = Vote({
            voter: msg.sender,
            issueId: _issueId,
            timestamp: block.timestamp,
            support: _support
        });
        
        issueVotes[_issueId].push(newVote);
        hasVoted[msg.sender][_issueId] = true;
        
        if (_support) {
            issues[_issueId].voteCount++;
        }
        
        emit VoteRecorded(_issueId, msg.sender, _support, block.timestamp);
    }
    
    /**
     * @dev Get issue details
     * @param _issueId Issue ID to query
     */
    function getIssue(string memory _issueId) public view returns (
        string memory issueId,
        string memory title,
        address reportedBy,
        uint256 timestamp,
        uint256 voteCount,
        bool exists
    ) {
        Issue memory issue = issues[_issueId];
        return (
            issue.issueId,
            issue.title,
            issue.reportedBy,
            issue.timestamp,
            issue.voteCount,
            issue.exists
        );
    }
    
    /**
     * @dev Get vote count for an issue
     * @param _issueId Issue ID to query
     */
    function getVoteCount(string memory _issueId) public view returns (uint256) {
        require(issues[_issueId].exists, "Issue does not exist");
        return issues[_issueId].voteCount;
    }
    
    /**
     * @dev Get all votes for an issue
     * @param _issueId Issue ID to query
     */
    function getIssueVotes(string memory _issueId) public view returns (Vote[] memory) {
        require(issues[_issueId].exists, "Issue does not exist");
        return issueVotes[_issueId];
    }
    
    /**
     * @dev Get all issues reported by a user
     * @param _user User address to query
     */
    function getUserIssues(address _user) public view returns (string[] memory) {
        return userIssues[_user];
    }
    
    /**
     * @dev Check if user has voted on an issue
     * @param _user User address
     * @param _issueId Issue ID
     */
    function checkIfVoted(address _user, string memory _issueId) public view returns (bool) {
        return hasVoted[_user][_issueId];
    }
    
    /**
     * @dev Get total number of issues recorded
     */
    function getTotalIssues() public view returns (uint256) {
        return allIssueIds.length;
    }
    
    /**
     * @dev Get all issue IDs (paginated)
     * @param _offset Starting index
     * @param _limit Number of records to return
     */
    function getAllIssues(uint256 _offset, uint256 _limit) public view returns (string[] memory) {
        require(_offset < allIssueIds.length, "Offset out of bounds");
        
        uint256 end = _offset + _limit;
        if (end > allIssueIds.length) {
            end = allIssueIds.length;
        }
        
        string[] memory result = new string[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = allIssueIds[i];
        }
        
        return result;
    }
}
