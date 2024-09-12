const express = require('express');
const router = express.Router();
const products=require('../controller/product_controller.js');
const {body,validationResult}=require("express-validator");
function isAuthenticated(req,res,next){
    if(req.session.user)
    {   
        if(req.session.user.id)
        {
          return next();
        }
       
    }   
      if(req.query.redirectTo)
        return res.redirect(`/user/signup?redirectTo=${req.query.redirectTo}`);
      else
        return res.redirect("/user/signup?redirectTo=cart");
}
//Customer Side
router.get('/',products.homepage);
router.get('/cart',isAuthenticated,products.cart);
// router.post('/cart',isAuthenticated,products.search);
router.get('/ProductDetails',products.ProductDetails);
router.get('/changequantity',products.changequantity);
router.get('/deletefromCart',products.deletefromCart);
router.get('/Women',products.women);
router.get('/Men',products.men);
router.get('/Kids',products.kids);
router.get('/OrderConfirmation',isAuthenticated,products.orderConfig);
router.post('/Men',products.search);
router.post('/Women',products.search);
router.post('/Kids',products.search);
router.post('/',products.search);
router.get('/Search',products.search);
router.post('/Search',products.search);
router.post('/ProductDetails',products.search);
router.get('/addcart',isAuthenticated,products.addcart);

module.exports=router;