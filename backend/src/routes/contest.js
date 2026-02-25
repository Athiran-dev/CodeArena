const express = require('express');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { 
    createContest, 
    getAllContests, 
    getContestById, 
    joinContest, 
    getContestLeaderboard 
} = require('../controllers/contest');

const contestRouter = express.Router();

contestRouter.post('/', adminMiddleware, createContest);
contestRouter.get('/', getAllContests);
contestRouter.get('/:id', getContestById);
contestRouter.post('/:id/join', userMiddleware, joinContest);
contestRouter.get('/:id/leaderboard', getContestLeaderboard);

module.exports = contestRouter;
