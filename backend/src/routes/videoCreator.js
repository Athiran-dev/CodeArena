// const express = require('express');
// const adminMiddleware = require('../middleware/adminMiddleware');
// const videoRouter =  express.Router();
// const {generateUploadSignature,saveVideoMetadata,deleteVideo} = require("../controllers/videoSection")

// videoRouter.get("/create/:problemId",adminMiddleware,generateUploadSignature);
// videoRouter.post("/save",adminMiddleware,saveVideoMetadata);
// videoRouter.delete("/delete/:problemId",adminMiddleware,deleteVideo);


// module.exports = videoRouter;

// const express = require('express');
// const adminMiddleware = require('../middleware/adminMiddleware');
// const videoRouter = express.Router();
// const { generateUploadSignature, saveVideoMetadata, deleteVideo } = require("../controllers/videoSection");

// // Changed from GET to POST for signature generation
// videoRouter.post("/create/:problemId", adminMiddleware, generateUploadSignature);
// videoRouter.post("/save", adminMiddleware, saveVideoMetadata);
// videoRouter.delete("/delete/:problemId", adminMiddleware, deleteVideo);

// module.exports = videoRouter;

const express = require('express');
const adminMiddleware = require('../middleware/adminMiddleware');
const videoRouter = express.Router();
const { 
  generateUploadSignature,
  saveVideoMetadata, 
  deleteVideo,
  checkConfig
} = require("../controllers/videoSection");

// Video routes
videoRouter.get("/config", adminMiddleware, checkConfig);
videoRouter.get("/create/:problemId", adminMiddleware, generateUploadSignature);
videoRouter.post("/save", adminMiddleware, saveVideoMetadata);
videoRouter.delete("/delete/:problemId", adminMiddleware, deleteVideo);

module.exports = videoRouter;