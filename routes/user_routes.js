const express = require('express');
// const passport = require('passport');
const router = express.Router();
const user=require('../controller/user_controller.js');
router.get('/signup',user.getSignup);
router.get('/login',user.getlogin);
router.post('/login',user.login);
router.get("/ResetPassword",user.getresetPassword);
router.post("/ResetPassword",user.resetPassword);
router.get('/NewPassword',user.getnewPassword);
router.post('/NewPassword',user.newPassword);
router.get('/ResetPasswordOTP',user.getresetPasswordOTP);
router.post('/ResetPasswordOTP',user.resetPasswordOTP);
router.post('/signup',user.signup);
router.get('/otp',user.getotp);
router.post('/otp',user.otp);
router.get('/otpsms',user.getotpsms);
router.post('/otpsms',user.otpsms);
router.get('/payment',user.payment);
router.post('/logout',user.logout);
router.get('/captcha',user.getcaptcha);
router.post('/captcha',user.captcha);
function isAuthenticated(req,res,next){
    if(req.session.user)
    { 
        if(req.session.user.id)
            {
              return next();
            }
            else{
                return res.redirect("/user/signup?redirectTo=user/address");
            }
    }
    return res.redirect("/user/signup?redirectTo=user/address");
}

router.get('/address',isAuthenticated,user.getaddress);
router.post('/address',isAuthenticated,user.address);
// router.get('/payment',user.payment);


module.exports=router;