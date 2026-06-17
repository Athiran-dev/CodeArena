// const cloudinary = require('cloudinary').v2;
// const Problem = require("../models/problems");
// const User = require("../models/user");
// const SolutionVideo = require("../models/solutionVideo");
// const { sanitizeFilter } = require('mongoose');


// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// const generateUploadSignature = async (req, res) => {
//   try {
//     const { problemId } = req.params;
    
//     const userId = req.result._id;
//     // Verify problem exists
//     const problem = await Problem.findById(problemId);
//     if (!problem) {
//       return res.status(404).json({ error: 'Problem not found' });
//     }

//     // Generate unique public_id for the video
//     const timestamp = Math.round(new Date().getTime() / 1000);
//     const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;
    
//     // Upload parameters
//     const uploadParams = {
//       timestamp: timestamp,
//       public_id: publicId,
//     };

//     // Generate signature
//     const signature = cloudinary.utils.api_sign_request(
//       uploadParams,
//       process.env.CLOUDINARY_API_SECRET
//     );

//     res.json({
//       signature,
//       timestamp,
//       public_id: publicId,
//       api_key: process.env.CLOUDINARY_API_KEY,
//       cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//       upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
//     });

//   } catch (error) {
//     console.error('Error generating upload signature:', error);
//     res.status(500).json({ error: 'Failed to generate upload credentials' });
//   }
// };


// const saveVideoMetadata = async (req, res) => {
//   try {
//     const {
//       problemId,
//       cloudinaryPublicId,
//       secureUrl,
//       duration,
//     } = req.body;

//     const userId = req.result._id;

//     // Verify the upload with Cloudinary
//     const cloudinaryResource = await cloudinary.api.resource(
//       cloudinaryPublicId,
//       { resource_type: 'video' }
//     );

//     if (!cloudinaryResource) {
//       return res.status(400).json({ error: 'Video not found on Cloudinary' });
//     }

//     // Check if video already exists for this problem and user
//     const existingVideo = await SolutionVideo.findOne({
//       problemId,
//       userId,
//       cloudinaryPublicId
//     });

//     if (existingVideo) {
//       return res.status(409).json({ error: 'Video already exists' });
//     }

//     // const thumbnailUrl = cloudinary.url(cloudinaryResource.public_id, {
//     // resource_type: 'image',  
//     // transformation: [
//     // { width: 400, height: 225, crop: 'fill' },
//     // { quality: 'auto' },
//     // { start_offset: 'auto' }  
//     // ],
//     // format: 'jpg'
//     // });

//     const thumbnailUrl = cloudinary.image(cloudinaryResource.public_id,{resource_type: "video"})

// // https://cloudinary.com/documentation/video_effects_and_enhancements#video_thumbnails
//     // Create video solution record
//     const videoSolution = await SolutionVideo.create({
//       problemId,
//       userId,
//       cloudinaryPublicId,
//       secureUrl,
//       duration: cloudinaryResource.duration || duration,
//       thumbnailUrl
//     });


//     res.status(201).json({
//       message: 'Video solution saved successfully',
//       videoSolution: {
//         id: videoSolution._id,
//         thumbnailUrl: videoSolution.thumbnailUrl,
//         duration: videoSolution.duration,
//         uploadedAt: videoSolution.createdAt
//       }
//     });

//   } catch (error) {
//     console.error('Error saving video metadata:', error);
//     res.status(500).json({ error: 'Failed to save video metadata' });
//   }
// };


// const deleteVideo = async (req, res) => {
//   try {
//     const { problemId } = req.params;
//     const userId = req.result._id;

//     const video = await SolutionVideo.findOneAndDelete({problemId:problemId});
    
   

//     if (!video) {
//       return res.status(404).json({ error: 'Video not found' });
//     }

//     await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: 'video' , invalidate: true });

//     res.json({ message: 'Video deleted successfully' });

//   } catch (error) {
//     console.error('Error deleting video:', error);
//     res.status(500).json({ error: 'Failed to delete video' });
//   }
// };

// module.exports = {generateUploadSignature,saveVideoMetadata,deleteVideo};

// const cloudinary = require('cloudinary').v2;
// const Problem = require("../models/problems"); // Fixed typo: was "problems"
// const User = require("../models/user");
// const SolutionVideo = require("../models/solutionVideo");

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// const generateUploadSignature = async (req, res) => {
//   try {
//     const { problemId } = req.params;
    
//     console.log('Generating upload signature for problem:', problemId);
    
//     // Fixed: Use req.user._id instead of req.result._id (check your middleware)
//     const userId = req.user._id || req.result._id;
    
//     if (!userId) {
//       return res.status(401).json({ error: 'User not authenticated' });
//     }

//     // Verify problem exists
//     const problem = await Problem.findById(problemId);
//     if (!problem) {
//       console.log('Problem not found:', problemId);
//       return res.status(404).json({ error: 'Problem not found' });
//     }

//     // Generate unique public_id for the video
//     const timestamp = Math.round(new Date().getTime() / 1000);
//     const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;
    
//     // Upload parameters
//     const uploadParams = {
//       timestamp: timestamp,
//       public_id: publicId,
//       resource_type: 'video'
//     };

//     // Generate signature
//     const signature = cloudinary.utils.api_sign_request(
//       uploadParams,
//       process.env.CLOUDINARY_API_SECRET
//     );

//     console.log('Upload signature generated successfully for:', publicId);

//     res.json({
//       signature,
//       timestamp,
//       public_id: publicId,
//       api_key: process.env.CLOUDINARY_API_KEY,
//       cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//       upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
//     });

//   } catch (error) {
//     console.error('Error generating upload signature:', error);
//     res.status(500).json({ 
//       error: 'Failed to generate upload credentials',
//       details: error.message 
//     });
//   }
// };

// const saveVideoMetadata = async (req, res) => {
//   try {
//     const {
//       problemId,
//       cloudinaryPublicId,
//       secureUrl,
//       duration,
//     } = req.body;

//     console.log('Saving video metadata for problem:', problemId);

//     const userId = req.user._id || req.result._id;

//     if (!userId) {
//       return res.status(401).json({ error: 'User not authenticated' });
//     }

//     // Verify the upload with Cloudinary
//     const cloudinaryResource = await cloudinary.api.resource(
//       cloudinaryPublicId,
//       { resource_type: 'video' }
//     );

//     if (!cloudinaryResource) {
//       return res.status(400).json({ error: 'Video not found on Cloudinary' });
//     }

//     // Check if video already exists for this problem and user
//     const existingVideo = await SolutionVideo.findOne({
//       problemId,
//       userId,
//       cloudinaryPublicId
//     });

//     if (existingVideo) {
//       return res.status(409).json({ error: 'Video already exists' });
//     }

//     // Fixed thumbnail generation
//     const thumbnailUrl = cloudinary.url(cloudinaryPublicId, {
//       resource_type: 'video',
//       transformation: [
//         { width: 400, height: 225, crop: 'fill' },
//         { format: 'jpg' },
//         { quality: 'auto' }
//       ]
//     });

//     // Create video solution record
//     const videoSolution = await SolutionVideo.create({
//       problemId,
//       userId,
//       cloudinaryPublicId,
//       secureUrl,
//       duration: cloudinaryResource.duration || duration,
//       thumbnailUrl
//     });

//     console.log('Video metadata saved successfully:', videoSolution._id);

//     res.status(201).json({
//       message: 'Video solution saved successfully',
//       videoSolution: {
//         id: videoSolution._id,
//         thumbnailUrl: videoSolution.thumbnailUrl,
//         duration: videoSolution.duration,
//         uploadedAt: videoSolution.createdAt
//       }
//     });

//   } catch (error) {
//     console.error('Error saving video metadata:', error);
//     res.status(500).json({ 
//       error: 'Failed to save video metadata',
//       details: error.message 
//     });
//   }
// };

// const deleteVideo = async (req, res) => {
//   try {
//     const { problemId } = req.params;
//     const userId = req.user._id || req.result._id;

//     console.log('Deleting video for problem:', problemId);

//     const video = await SolutionVideo.findOneAndDelete({
//       problemId: problemId,
//       userId: userId
//     });

//     if (!video) {
//       return res.status(404).json({ error: 'Video not found' });
//     }

//     await cloudinary.uploader.destroy(video.cloudinaryPublicId, { 
//       resource_type: 'video',
//       invalidate: true 
//     });

//     console.log('Video deleted successfully:', video._id);

//     res.json({ message: 'Video deleted successfully' });

//   } catch (error) {
//     console.error('Error deleting video:', error);
//     res.status(500).json({ 
//       error: 'Failed to delete video',
//       details: error.message 
//     });
//   }
// };

// module.exports = { generateUploadSignature, saveVideoMetadata, deleteVideo };
const cloudinary = require('cloudinary').v2;
const Problem = require("../models/problems");
const SolutionVideo = require("../models/solutionVideo");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const generateUploadSignature = async (req, res) => {
  try {
    const { problemId } = req.params;
    
    console.log('Generating upload signature for problem:', problemId);
    
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      console.log('Problem not found:', problemId);
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Generate unique public_id for the video
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;
    
    // Upload parameters
    const uploadParams = {
      timestamp: timestamp,
      public_id: publicId,
      resource_type: 'video'
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    console.log('Upload signature generated successfully for:', publicId);

    res.json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    });

  } catch (error) {
    console.error('Error generating upload signature:', error);
    res.status(500).json({ 
      error: 'Failed to generate upload credentials',
      details: error.message 
    });
  }
};

const saveVideoMetadata = async (req, res) => {
  try {
    const {
      problemId,
      cloudinaryPublicId,
      secureUrl,
      duration,
    } = req.body;

    console.log('Saving video metadata for problem:', problemId);

    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Generate thumbnail URL
    const thumbnailUrl = cloudinary.url(cloudinaryPublicId, {
      resource_type: 'video',
      transformation: [
        { width: 400, height: 225, crop: 'fill' },
        { format: 'jpg' },
        { quality: 'auto' }
      ]
    });

    // Check if video already exists for this problem and user
    let videoSolution = await SolutionVideo.findOne({
      problemId,
      userId
    });

    if (videoSolution) {
      // Update existing video
      videoSolution.cloudinaryPublicId = cloudinaryPublicId;
      videoSolution.secureUrl = secureUrl;
      videoSolution.duration = duration || 0;
      videoSolution.thumbnailUrl = thumbnailUrl;
      await videoSolution.save();
      console.log('Video metadata updated:', videoSolution._id);
    } else {
      // Create new video record
      videoSolution = await SolutionVideo.create({
        problemId,
        userId,
        cloudinaryPublicId,
        secureUrl,
        duration: duration || 0,
        thumbnailUrl
      });
      console.log('New video metadata created:', videoSolution._id);
    }

    res.status(201).json({
      message: 'Video solution saved successfully',
      videoSolution: {
        id: videoSolution._id,
        secureUrl: videoSolution.secureUrl,
        thumbnailUrl: videoSolution.thumbnailUrl,
        duration: videoSolution.duration,
        uploadedAt: videoSolution.createdAt
      }
    });

  } catch (error) {
    console.error('Error saving video metadata:', error);
    res.status(500).json({ 
      error: 'Failed to save video metadata',
      details: error.message 
    });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user._id;

    console.log('Deleting video for problem:', problemId);

    const video = await SolutionVideo.findOneAndDelete({
      problemId: problemId,
      userId: userId
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(video.cloudinaryPublicId, { 
      resource_type: 'video',
      invalidate: true 
    });

    console.log('Video deleted successfully:', video._id);

    res.json({ message: 'Video deleted successfully' });

  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ 
      error: 'Failed to delete video',
      details: error.message 
    });
  }
};

// Simple endpoint to check Cloudinary config
const checkConfig = async (req, res) => {
  try {
    res.json({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      status: 'Configuration loaded successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Configuration check failed' });
  }
};

module.exports = { 
  generateUploadSignature,
  saveVideoMetadata, 
  deleteVideo,
  checkConfig
};