const express=require('express');
const userMiddleware=require('../middleware/userMiddleware')
const adminMiddleware=require('../middleware/adminMiddleware')

const authRouter=express.Router();
const {login,register,logout,adminRegister,deleteProfile,getProfile,getLeaderboard}=require('../controllers/userAthent')

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',userMiddleware,logout)
authRouter.post('/admin/register',adminMiddleware,adminRegister);
authRouter.delete('/deleteProfile',userMiddleware,deleteProfile)
authRouter.get('/check',userMiddleware,(req,res)=>{
   const reply = {
    firstName: req.user.firstName,
    emailId: req.user.emailId,
    _id: req.user._id,
    role: req.user.role    // <--- add this
} 
res.status(200).json({
    user: reply,
    message: "valid user"
})

})

authRouter.get('/profile', userMiddleware, getProfile);
authRouter.get('/leaderboard', getLeaderboard);

module.exports=authRouter