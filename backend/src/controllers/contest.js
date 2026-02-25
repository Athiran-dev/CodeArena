const Contest = require('../models/contest');
const Problem = require('../models/problems');
const Submission = require('../models/submission');
const User = require('../models/user');

const createContest = async (req, res) => {
    try {
        const { title, description, startTime, endTime, problems } = req.body;
        
        if (req.result.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can create contests.' });
        }

        const newContest = new Contest({
            title,
            description,
            startTime,
            endTime,
            problems,
            creator: req.result._id
        });

        await newContest.save();
        res.status(201).json({ message: 'Contest created successfully', contest: newContest });
    } catch (error) {
        console.error('Error creating contest:', error);
        res.status(500).json({ error: 'Failed to create contest' });
    }
};

const getAllContests = async (req, res) => {
    try {
        const contests = await Contest.find()
            .select('-participants')
            .sort({ startTime: -1 })
            .lean();
            
        const now = new Date();
        
        // Categorize contests
        const active = [];
        const upcoming = [];
        const past = [];
        
        contests.forEach(c => {
            const start = new Date(c.startTime);
            const end = new Date(c.endTime);
            if (now >= start && now <= end) {
                active.push(c);
            } else if (now < start) {
                upcoming.push(c);
            } else {
                past.push(c);
            }
        });
        
        res.json({ active, upcoming, past });
    } catch (error) {
        console.error('Error fetching contests:', error);
        res.status(500).json({ error: 'Failed to fetch contests' });
    }
};

const getContestById = async (req, res) => {
    try {
        const { id } = req.params;
        const contest = await Contest.findById(id).populate('problems', 'title difficulty tags').lean();
        
        if (!contest) {
            return res.status(404).json({ error: 'Contest not found' });
        }
        
        res.json(contest);
    } catch (error) {
        console.error('Error fetching contest:', error);
        res.status(500).json({ error: 'Failed to fetch contest' });
    }
};

const joinContest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.result._id;
        
        const contest = await Contest.findById(id);
        if (!contest) return res.status(404).json({ error: 'Contest not found' });
        
        if (!contest.participants.includes(userId)) {
            contest.participants.push(userId);
            await contest.save();
        }
        
        res.json({ message: 'Joined contest successfully' });
    } catch (error) {
        console.error('Error joining contest:', error);
        res.status(500).json({ error: 'Failed to join contest' });
    }
};

const getContestLeaderboard = async (req, res) => {
    try {
        const { id } = req.params;
        const contest = await Contest.findById(id).lean();
        if (!contest) return res.status(404).json({ error: 'Contest not found' });
        
        // Fetch accepted submissions during the contest window for the contest's problems
        const submissions = await Submission.find({
            problemId: { $in: contest.problems },
            status: 'accepted',
            createdAt: { $gte: contest.startTime, $lte: contest.endTime }
        }).populate('userId', 'firstName lastName').lean();
        
        // Calculate score: 1 point per unique problem solved
        const userScores = {};
        
        submissions.forEach(sub => {
            const userId = sub.userId._id.toString();
            if (!userScores[userId]) {
                userScores[userId] = {
                    user: sub.userId,
                    score: 0,
                    solvedProblems: new Set(),
                    lastSubmissionTime: sub.createdAt
                };
            }
            
            const pId = sub.problemId.toString();
            if (!userScores[userId].solvedProblems.has(pId)) {
                userScores[userId].solvedProblems.add(pId);
                userScores[userId].score += 100; // 100 points per problem
            }
            
            // Track the time of the latest successful submission for tie breaking
            if (new Date(sub.createdAt) > new Date(userScores[userId].lastSubmissionTime)) {
                userScores[userId].lastSubmissionTime = sub.createdAt;
            }
        });
        
        const leaderboard = Object.values(userScores).map(entry => ({
            ...entry,
            solvedProblems: entry.solvedProblems.size // Convert Set to count
        }));
        
        // Sort by score (descending), then by time (ascending)
        leaderboard.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(a.lastSubmissionTime) - new Date(b.lastSubmissionTime);
        });
        
        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};

module.exports = {
    createContest,
    getAllContests,
    getContestById,
    joinContest,
    getContestLeaderboard
};
