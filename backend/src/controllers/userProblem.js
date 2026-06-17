const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility");
const Problem = require("../models/problems");
const User=require('../models/user')
const Submission = require("../models/submission"); 
const SolutionVideo = require("../models/solutionVideo");


// Status code mapping for better readability
const statusMapper = {
  1: "In Queue",
  2: "Processing",
  3: "Accepted ✅",
  4: "Wrong Answer ❌",
  5: "Time Limit Exceeded ⏳",
  6: "Compilation Error 🛠️",
  7: "Runtime Error ⚠️"
};

const createProblem = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      tags,
      visibleTestCases = [],
      hiddenTestCases = [],
      startCode = [],
      referenceSolution = []
    } = req.body;

    // Validate required arrays
    if (!Array.isArray(visibleTestCases) || visibleTestCases.length === 0) {
      return res.status(400).send("visibleTestCases is required and should be a non-empty array");
    }

    if (!Array.isArray(referenceSolution) || referenceSolution.length === 0) {
      return res.status(400).send("referenceSolution is required and should be a non-empty array");
    }

    // Validate each reference solution
    for (const ref of referenceSolution) {
      const { language, completeCode } = ref;

      if (!language || !completeCode) {
        return res.status(400).send("Each referenceSolution must have language and completeCode");
      }

      const languageId = getLanguageById(language);
      if (!languageId) {
        return res.status(400).send(`Language "${language}" is not supported`);
      }

      // Validate visibleTestCases
      const submissions = visibleTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output
      }));

      const submitResult = await submitBatch(submissions);
      const resultToken = submitResult.map((value) => value.token);

      const testResult = await submitToken(resultToken);

      for (const test of testResult) {
        if (test.status_id !== 3) {
          const readable = statusMapper[test.status_id] || "Unknown Error";
          return res.status(400).send(`Error Occurred: ${readable}`);
        }
      }
    }

    // Save problem to DB
    const userProblem = await Problem.create({
      ...req.body,
      problemCreator: req.user._id // Make sure your middleware sets req.user
    });

    res.status(201).send("Problem Saved Successfully ✅");
  } catch (err) {
    console.error(err);
    res.status(400).send("Error: " + err.message);
  }
};


const updateProblem = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases = [],
    hiddenTestCases = [],
    startCode = [],
    referenceSolution = []
  } = req.body;

  try {
    if (!id) return res.status(400).send("Missing Id Field");

    const DsaProblem = await Problem.findById(id);
    if (!DsaProblem) return res.status(404).send("Problem not found");

    // Validate required arrays
    if (!Array.isArray(visibleTestCases) || visibleTestCases.length === 0) {
      return res.status(400).send("visibleTestCases is required and should be a non-empty array");
    }

    if (!Array.isArray(hiddenTestCases) || hiddenTestCases.length === 0) {
      return res.status(400).send("hiddenTestCases is required and should be a non-empty array");
    }

    if (!Array.isArray(referenceSolution) || referenceSolution.length === 0) {
      return res.status(400).send("referenceSolution is required and should be a non-empty array");
    }

    // Combine all test cases for validation
    const allTestCases = [...visibleTestCases, ...hiddenTestCases];

    // Judge0 validation for each reference solution
    for (const ref of referenceSolution) {
      const { language, completeCode } = ref;

      if (!language || !completeCode) {
        return res.status(400).send("Each referenceSolution must have language and completeCode");
      }

      const languageId = getLanguageById(language);
      if (!languageId) {
        return res.status(400).send(`Language "${language}" is not supported`);
      }

      const submissions = allTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output
      }));

      const submitResult = await submitBatch(submissions);
      const resultToken = submitResult.map((value) => value.token);
      const testResult = await submitToken(resultToken);

      for (const test of testResult) {
        if (test.status_id !== 3) {
          const readable = statusMapper[test.status_id] || "Unknown Error";
          return res.status(400).send(`Error Occurred: ${readable}`);
        }
      }
    }

    // ✅ Only update the existing problem
    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      { ...req.body },
      { runValidators: true, new: true }
    );

    res.status(200).send("Update SuccessFully");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error: " + err.message);
  }
};

const deleteProblem=async(req,res)=>{
  
  const{id}=req.params;
  try{
    if(!id) return res.status(400).send("ID is Missing");
    const deletedProblem = await Problem.findByIdAndDelete(id);
    if(!deletedProblem) return res.status(404).send("Problem is Missing");
    res.status(200).send("SuccessFully Deleted");
  }
  catch(err){
    res.status(500).send("Error"+err);
  }

}


const getProblemById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) return res.status(400).send("ID is Missing");
    
    const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution');

    
    
    if (!getProblem) return res.status(404).send("Problem is Missing");

  
   const videos = await SolutionVideo.findOne({problemId:id});

   if(videos){   
    
   const responseData = {
    ...getProblem.toObject(),
    secureUrl:videos.secureUrl,
    thumbnailUrl : videos.thumbnailUrl,
    duration : videos.duration,
   } 
  
   return res.status(200).send(responseData);
   }
    
   res.status(200).send(getProblem);

  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}

const getAllProblem = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const { search, difficulty, tag } = req.query;

    const query = {};

    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    
    if (tag && tag !== 'all') {
      // Tags might be case sensitive depending on DB, but usually stored exact
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const allProblems = await Problem.find(query)
      .select('_id title description difficulty tags visibleTestCases hiddenTestCases startCode referenceSolution')
      .skip(skip)
      .limit(limit);
     
    const total = await Problem.countDocuments(query);

    if (!allProblems || allProblems.length === 0) {
      return res.status(200).send({ problems: [], totalPages: 0, currentPage: page });
    }
    
    res.status(200).send({
      problems: allProblems,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalProblems: total
    });
  } catch (err) {
    console.error('Error in getAllProblem:', err);
    res.status(500).send("Error: " + err.message);
  }
};


// const solvedAllProblembyUser = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const solvedUser = await User.findById(userId).populate({
//       path: "problemSolved",
//       select: "_id title difficulty tags"
//     });

//     res.status(200).json(solvedUser.problemSolved); // ✅ return only problem details
//   } catch (err) {
//     res.status(500).send("Error: " + err.message);
//   }
// };

const solvedAllProblembyUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all accepted submissions and populate problem details
    const solvedSubmissions = await Submission.find({
      userId: userId,
      status: 'accepted' // or whatever your accepted status is
    }).populate('problemId', '_id title difficulty tags');

    // Extract unique problems (remove duplicates)
    const uniqueSolvedProblems = [];
    const seenProblems = new Set();
    
    solvedSubmissions.forEach(submission => {
      if (submission.problemId && !seenProblems.has(submission.problemId._id.toString())) {
        seenProblems.add(submission.problemId._id.toString());
        uniqueSolvedProblems.push(submission.problemId);
      }
    });


    res.status(200).json(uniqueSolvedProblems);
  } catch (err) {
    console.error('❌ Error in solvedAllProblembyUser:', err);
    res.status(500).send("Error: " + err.message);
  }
};

const submittedProblem=async(req,res)=>{
  try{
    const userId=req.user._id;
    const problemId=req.params.pid;
    const ans=await Submission.find({userId,problemId});
   if(ans.length === 0) return res.status(200).send("No Submission is present");
      res.status(200).send(ans);

  }
  catch(err){
    res.status(500).send("Internal Server Error")
  }
}


module.exports = {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblembyUser,submittedProblem};
