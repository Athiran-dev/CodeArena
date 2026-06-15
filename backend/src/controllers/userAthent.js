const redisClient = require('../config/redis');

const User = require('../models/user');
const validate = require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const Submission=require('../models/submission')


const register = async (req, res) => {
  try {
    validate(req.body);

    const { firstName,  emailId, password } = req.body;

    //console.log("Password received:", password); // Debug log

    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;
     req.body.role='user'

    const user = await User.create(req.body);

    const reply={
      firstName:user.firstName,
      emailId:user.emailId,
      _id:user._id
    }

    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId,role:'user' },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    );

    res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
     res.status(201).json({
      user:reply,
      message:"Register Successfully"
    });

  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};


const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!emailId || !password) throw new Error("Invalid Credentials");

    const user = await User.findOne({ emailId });
    if (!user) throw new Error("Invalid Credentials");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid Credentials");


    const reply={
      firstName:user.firstName,
      emailId:user.emailId,
      _id:user._id
    }
    // Include role from DB
    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    );

     
   // console.log("Decoded Token for debug:", jwt.verify(token, process.env.JWT_KEY)); // Debug line

    res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
    res.status(201).json({
      user:reply,
      message:"Login Successfully"
    });
  } catch (err) {
    res.status(401).send("Error: " + err.message);
  }
};


// const logout = async (req, res) => {
//   try{
//          const {token}=req.cookie;
//          const payload = jwt.decode(token)
//          await redisClient.set(`token${token}`,"Blocked");
//          await redisClient.expireAt(`token:${token}`,payload.exp)
//          res.cookie("token",null,{expireAt:new Date(Date.now())});
//           res.send("Logged Out SuccessFully")
//  }
//   catch(err){
//     res.status(503).send(err.message);
//   }
// };

const logout = async (req, res) => {
  try {
    const { token } = req.cookies || {};
    if (!token) return res.status(400).send("No token found");

    const payload = jwt.decode(token);
    if (!payload || !payload.exp) return res.status(400).send("Invalid token");

    // Block the token in Redis until it expires
    await redisClient.set(`token:${token}`, "Blocked");
    await redisClient.expireAt(`token:${token}`, payload.exp);

    // Clear cookie
    res.cookie("token",null, { expires: new Date(0) });

    res.status(200).send("Logged Out Successfully ✅");
  } catch (err) {
    res.status(503).send("Error: " + err.message);
  }
}; 

const adminRegister= async (req, res) => {
  try {
    validate(req.body);

    const { firstName, lastName, emailId, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;
     req.body.role = 'admin';   // DB mein admin role save karo

    const newUser = await User.create(req.body);

    const token = jwt.sign(
  { _id: newUser._id, emailId: newUser.emailId, role: newUser.role },
  process.env.JWT_KEY,
  { expiresIn: 60 * 60 }
);


    res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
    res.status(201).send("Admin Created Successfully ✅");

  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};


const deleteProfile=async(req,res)=>{
  try{
    const userId=req.user._id;
    await User.findByIdAndDelete(userId);
    await Submission.deleteMany({userId});
    res.status(200).send("Deleted Successfully")
  }
  catch(err){
   res.status(500).send("Internal Server Error")
  }
}

const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Clean up orphan submissions (where problem is deleted)
    // We do this via an aggregation to populate and filter
    const matchStage = { $match: { userId: user._id } };
    
    const pipeline = [
      matchStage,
      {
        $lookup: {
          from: 'problems', // The collection name in MongoDB (model 'problem' -> 'problems')
          localField: 'problemId',
          foreignField: '_id',
          as: 'problemDetails'
        }
      },
      // Filter out submissions where the problem was deleted
      { $match: { 'problemDetails.0': { $exists: true } } },
      { $sort: { createdAt: -1 } }
    ];

    const totalSubmissionsAggr = await Submission.aggregate([
      ...pipeline,
      { $count: 'total' }
    ]);
    const total = totalSubmissionsAggr.length > 0 ? totalSubmissionsAggr[0].total : 0;

    const submissionsAggr = await Submission.aggregate([
      ...pipeline,
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]);
    
    // Map it to look like populated mongoose doc
    const submissions = submissionsAggr.map(sub => ({
      ...sub,
      problemId: sub.problemDetails[0]
    }));

    // Calculate 30-day activity graph data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activityAggr = await Submission.aggregate([
      { 
        $match: { 
          userId: user._id, 
          status: 'accepted',
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Generate a full 30-day map to include days with 0 submissions
    const activityData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const found = activityAggr.find(a => a._id === dateString);
      activityData.push({
        date: dateString,
        solved: found ? found.count : 0
      });
    }

    res.status(200).json({ 
      user, 
      submissions, 
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      activityData
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    // Global leaderboard: Top 100 users by number of problems solved
    const topUsers = await User.aggregate([
      {
        $project: {
          firstName: 1,
          lastName: 1,
          photo: 1,
          solvedCount: { $size: { $ifNull: ['$problemSolved', []] } }
        }
      },
      { $sort: { solvedCount: -1 } },
      { $limit: 100 }
    ]);

    res.status(200).json(topUsers);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { register, login, logout, adminRegister, deleteProfile, getProfile, getLeaderboard };
