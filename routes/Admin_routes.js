const express = require('express');
const router = express.Router();
const admin=require('../controller/admin_controller.js');
function isAuthenticated(req,res,next){
    console.log(req.session.admin)
    if(req.session.admin)
    { 
        if(req.session.admin.id)
            {
              return next();
            }
            else{
                return res.redirect("/admin/login");
            }
    }
        return res.redirect("/admin/login");
}
router.get('/login',admin.getadminlogin);
router.post('/login',admin.adminlogin);
// router.get('/adminsign',admin.getSignup);
// router.post('/adminsign',admin.signup);
router.get('/addProduct',isAuthenticated,admin.Add);
router.post('/addProduct',isAuthenticated,admin.addproduct);
router.get('/editProduct',isAuthenticated,admin.Edit);
router.post('/editProduct',isAuthenticated,admin.editproduct);
router.get('/deleteProduct/:id',isAuthenticated,admin.deleteproduct);
router.get('/ProductList',isAuthenticated,admin.List);
router.post('/ProductList',isAuthenticated,admin.searchit);
router.get('/ProductDetails',isAuthenticated,admin.details);
router.get('/logout',admin.logout);
module.exports=router;