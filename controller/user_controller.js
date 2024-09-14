const mysql=require('mysql2/promise');
const pool=mysql.createPool({
    host:'localhost',
    user:'root',
    database:'clothing_store'
});
const email=require('../email');
const sms=require('../sms');
const stripe=require('stripe')("sk_test_51PrxCOP4Bp3jYC1DvnWC7D2hjXYBaSIEQ0QZEmIGSk0SMAklEc8h3mOTavXAjswWqW7onIcf5H0clapjklay9RXY00HcvxDTuQ");
const captcha=require('node-captcha-generator');
const address={
    PhoneNumber: "",
    StreetAddress: '',
    City: '',
    State: '',
    ZipCode: '',
    Country: ''
}
const sign={
    username:'',
    password:'',
    email:''
}
const login={
    id:"",
    email:"",
    password:""
}
// const passport=require('passport');
const bcrypt=require('bcrypt');
class user{

    static async getSignup(req,res) {
        console.log(req.query.redirectTo)
      req.session.redirectTo= req.query.redirectTo;

        if(req.session.sign)
            return res.render('SignUp',{message:req.flash('info'),body:req.session.sign,password:req.flash('pass'),email:req.flash('email'),name:req.flash('name')});
        else
        return res.render('SignUp',{message:req.flash('info'),body:sign,password:req.flash('pass'),email:req.flash('email'),name:req.flash('name')});
    }

    static async getlogin(req,res) 
    {   
        if(req.session.login)
        return res.render('Login',{message:req.flash('info'),body:req.session.login,password:req.flash('pass')});
        else
        return res.render('Login',{message:req.flash('info'),body:login,password:req.flash('pass')});
    }
    static async getresetPassword(req,res){
        return res.render('ResetPassword',{message:req.flash('info')});
    }
    static async resetPassword(req,res)
    {   const sql= await pool.getConnection();
        const body=req.body;
        const result= await sql.query(`select * from users where Email='${body.email}'`);
        if(!body.email|| !(/^\S+@\S+\.\S+$/.test(body.email)))
        {   req.flash('info',"Enter a valid email")
            return res.redirect('/user/ResetPassword');
        }
        else if(!result[0][0])
        {
            req.flash('info',"No Account has been created with this email!");
            return res.redirect('/user/ResetPassword');
        }
        else {
            req.session.email=body.email
            return res.redirect("/user/ResetPasswordOTP");
        }
    }
    static async getresetPasswordOTP(req,res)
    {   var otp=Math.floor(100000 + Math.random() * 900000);
        const sql= await pool.getConnection();
        console.log(req.session.email);
        const result= await sql.query(`select Username from users where Email='${req.session.email}'`)
        const msg=`Dear ${result[0][0].Username} ,`+"\r\n We received a request to reset your password for your account with FreshFits.\r\n"+
        `To complete the password reset process, please use the following One-Time Password (OTP):Your OTP code is: ${otp}`+
        "\r\nEnter this OTP on the password reset page to proceed with setting a new password."+
        "\r\n\r\nBest regards,\r\nThe FreshFits Team";
        email(req.session.email,"OTP Verification",msg);
        return res.render('otpVerification3.ejs',{message:req.flash('info'),OTP:otp});
    }
    static async resetPasswordOTP(req,res)
    {
        const body=req.body;
        if(body.otp==body.OTP)
        {   req.flash('email',body.email)
            return res.redirect('/user/NewPassword');
        }
        else if(body.otp.length!=6)
        {
                req.flash('info',"Please enter a valid 6-digit OTP.");
                return res.redirect('/user/ResetPasswordOTP');
        }else{
                req.flash('info',"otp entered is wrong. check for new otp to enter!");
                return res.redirect('/user/ResetPasswordOTP');
            }

    }
    static async getnewPassword(req,res)
    {
        return res.render("newPassword",{message:req.flash('info'),password:req.flash('pass')});
    }
    static async newPassword(req,res)
    {   const sql= await pool.getConnection();
        const body=req.body;
        const pass=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!#$%^&*()])[A-Za-z\d@!#$%^&*()]{8,}$/;
        if(!pass.test(body.newPassword))
        {
                const feedback = [];
                if (!/[a-z]/.test(body.newPassword)) feedback.push('at least one lowercase letter');
                if (!/[A-Z]/.test(body.newPassword)) feedback.push('at least one uppercase letter');
                if (!/\d/.test(body.newPassword)) feedback.push('at least one digit');
                if (!/[@!#$%^&*()]/.test(body.newPassword)) feedback.push('at least one special symbol');
                if (body.newPassword.length < 8) feedback.push('at least 8 characters long');
                if(feedback[0])
                {
                    req.flash('pass',`Password is invalid. It must contain ${feedback.join(', ')}.`);
                }
                if(/[@!#$%^&*()]/.test(body.newPassword))
                {
                    req.flash('pass',`Password is invalid. It contains unwanted characters`);
                }
                return res.redirect('/user/NewPassword');
        }    
        else if(body.newPassword!=body.newPassword2)
        {
            req.flash('info','Re-enter your new password carefully in both fields.')
            return res.redirect('/user/NewPassword');
        }                                                                                                   
        else if(body.newPassword==body.newPassword2)
        {
            const Password= await bcrypt.hash(body.newPassword,10);
           await sql.query(`update users set PasswordHash='${Password}' where email='${req.session.email}'`);
           req.flash('info',"Your password has been successfully reset. You can now log in with your new password.");
           return res.redirect('/user/login');
        }
    }
    static async getotp(req,res) 
    {   const sql= await pool.getConnection();
        var otp=Math.floor(100000 + Math.random() * 900000);
        req.session.otp=otp;

        if(req.session.sign)
        {    
            const msg=`Dear ${req.session.sign.username} ,`+"\r\n Thank you for signing up with FreshFits.\r\n"+
            ` To complete your account creation, please use the following One-Time Password (OTP):Your OTP code is: ${otp}`+
            "\r\nEnter this OTP on the account creation page to verify your email address and complete your registration."+
            "\r\n\r\nBest regards,\r\nThe FreshFits Team";
            email(req.session.sign.email,"OTP Verification",msg);
        }
      
        if(req.session.login)
        {   
            const result= await sql.query(`select * from users where Email="${req.session.login.email}"`)
            const msg2=`Dear ${result[0][0].Username} ,`+"\n We received a request to log into your account with FreshFits.\n"+
            " To complete your login, please use the following One-Time Password (OTP):\n"+
            `Your OTP code is: ${otp}`+
            "\nEnter this OTP on the login page to gain access to your account."+
            "\n\nBest regards,\nThe FreshFits Team";
            email(req.session.login.email,"OTP Verification",msg2);
        }
        return res.render('otpVerification2.ejs',{message:req.flash('info'),type:req.flash('type')});
    }
    static async getotpsms(req,res) 
    {   
        await sms(req.session.user.id,req.session.sign.username);
        req.session.previousAdd=null;
        return res.render('otpVerification.ejs',{message:req.flash('info')});
    }
    static async otp(req,res)
    {   const sql= await pool.getConnection();
        const body=req.body;
        console.log(body.type);
        if(body.otp.length!=6)
            {
                req.flash('info',"Please enter a valid 6-digit OTP.");
                return res.redirect('/user/otp');
            }
        else if(body.otp==req.session.otp)
        {   
            const previousUrl = req.session.redirectTo;
            if(body.type=="signup"&&req.session.sign)
            {   
                await sql.query(`Insert into users(Username,PasswordHash,Email) values('${req.session.sign.username}','${req.session.password}','${req.session.sign.email}') `);
                const result= await sql.query(`select * from users where Email='${req.session.sign.email}'`);
                req.session.user={id:result[0][0].UserID,username:`${result[0][0].Username}`,email:`${result[0][0].Email}`};
                await sql.query(`insert into OTP(UserID,Otp) values(${req.session.user.id},${req.session.otp})`);
                req.session.sign=null;  
                req.session.password=null;
                req.session.otp=null;
                req.flash('info',"Account Created Successfully");
                
            }else if(req.session.login){
                const result= await sql.query(`select * from users where Email='${req.session.login.email}'`);
                req.session.user={id:result[0][0].UserID,username:`${result[0][0].Username}`,email:`${result[0][0].Email}`};
                req.session.login=null;
                req.session.otp=null;
                req.flash('info',"logged in successfully");
            }
            if(previousUrl)
            {
                return res.redirect(`/${previousUrl}`);
            }
            else{
                return res.redirect("/");
            }
            
        }else{
            req.flash('info',"otp entered is wrong. check for new otp to enter!");
            return res.redirect('/user/otp');
        }
    }
    static async otpsms(req,res) 
    {   const sql= await pool.getConnection();
        const body=req.body;
        const otp=await sql.query(`select * from OTP where UserID=${req.session.user.id} and Otp!=0 order by OtpID desc limit 1`);
        console.log(otp);
        if(body.otp.length!=6)
        {
            await sql.query(`update OTP set Otp=0 where UserID=${req.session.user.id}`);
            req.flash('info',"Please enter a valid 6-digit OTP.");
            return res.redirect('/user/otpsms');
        }
        else if(body.otp==otp[0][0].Otp){
            await sql.query(`update OTP set Otp=1 where UserID=${req.session.user.id} and Otp!=0`);
            return res.redirect('/user/payment');
        }
        else{
            await sql.query(`update OTP set Otp=0 where UserID=${req.session.user.id}`);
            req.flash('info',"otp entered is wrong. check for new otp to enter!");
            return res.redirect('/user/otpsms');
        }
    }
    static async getcaptcha(req,res){
        let c=new captcha({
            length: 5,
            size:{
                width:400,
                height:200
            }
        })
        await c.toBase64(async(err,Base64)=>{
            if(err)
                throw err;
            else{
                console.log(c.value);
                return res.render('captcha',{src:Base64,value:c.value,message:req.flash('try'),type:req.flash('type')});
            }
        })
        
    }
    static async captcha(req,res){
        const body=req.body;
        if(body.captcha==body.value)
        {   req.flash('type',`${body.type}`);
            return res.redirect('/user/otp');
        }
        else{
            req.flash('try','try again!');
            return res.redirect('/user/captcha');
        }
    }
    static async getaddress(req,res) 
    {   const sql= await pool.getConnection();
        if(!req.session.previousAdd)
        {
            const already= await sql.query(`select * from useraddress where UserId=${req.session.user.id}`);
            console.log(already[0][0]);
            if(already[0][0])
            {
                return res.render('UserAddress',{message:req.flash('info'),body:already[0][0]});
            }
            else
            {
                return res.render('UserAddress',{message:req.flash('info'),body:address});
            }
        }
        else
        {
            return res.render('UserAddress',{message:req.flash('info'),body:req.session.previousAdd});
        }
    }

    static async address(req,res) 
    {   const sql= await pool.getConnection();
        const body=req.body;
        console.log(body);
        req.session.previousAdd=body;
        console.log(req.session.previousAdd);
        const phoneNum =/^\+91\d{5}\d{5}$/g;
            if(!phoneNum.test(body.PhoneNumber)) {
                req.flash('info',"Please enter a valid Phone Number (e.g., +911234567890).");
                return res.redirect('/user/address');
            }
            else{
                
                return res.redirect('/user/otpsms');
        }
    }
    static async signup(req,res)
    {   const sql= await pool.getConnection();
        const body=req.body;
        req.session.sign=body;
        let eml=/@[a-z]{1,7}\.[a-z]{2,3}$/g;
        let name=/^\D[a-z ]{3,20}$/gi;
        const pass=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!#$%^&*()])[A-Za-z\d@!#$%^&*()]{8,}$/;
        req.session.password= await bcrypt.hash(body.password,10);
        const result= await sql.query(`select * from users where Email='${body.email}'`);
        console.log(result);
        const u=result[0][0];
            if(u!=undefined)
            {   
                req.flash('info',"There is already an account created with this Email!");
                return res.redirect(`/user/signup?redirectTo=${req.session.redirectTo}`);
            }else if(!eml.test(body.email))
            {
                req.flash('email','Enter a valid Email');
                return res.redirect(`/user/signup?redirectTo=${req.session.redirectTo}`);
            }
            else{
                const result= await sql.query(`select * from users where Username='${body.username}'`);
                console.log(result);
                const u=result[0][0];
                if(u!=undefined)
                {
                    req.flash('name',"The input username is already taken. please enter some other username");
                    return res.redirect(`/user/signup?redirectTo=${req.session.redirectTo}`);
                }
                else if(!name.test(body.username))
                {
                    const feedback = [];
        
                    if (body.username.length < 3) feedback.push(' be at least 3 characters long');
                    if (body.username.length > 20) feedback.push(' be no more than 20 characters long');
                    if (/[^\w\s]/.test(body.username)) feedback.push('only letters and spaces are allowed');
                    if (/[^\A-Za-z ]/.test(body.username)) feedback.push('contains only letters and spaces ');
                    req.flash('name',`Username is invalid. It must ${feedback.join(', ')}.`);
                    return res.redirect(`/user/signup?redirectTo=${req.session.redirectTo}`);
                }
                else if(!pass.test(body.password))
                {
                    const feedback = [];
                    if (!/[a-z]/.test(body.password)) feedback.push('at least one lowercase letter');
                    if (!/[A-Z]/.test(body.password)) feedback.push('at least one uppercase letter');
                    if (!/\d/.test(body.password)) feedback.push('at least one digit');
                    if (!/[@!#$%^&*()]/.test(body.password)) feedback.push('at least one special symbol');
                    if (body.password.length < 8) feedback.push('at least 8 characters long');
                    if(feedback[0])
                    {
                        req.flash('pass',`Password is invalid. It must contain ${feedback.join(', ')}.`);
                    }
                   else
                    {
                        req.flash('pass',`Password is invalid. It contains unwanted characters`);
                    }
                    return res.redirect(`/user/signup?redirectTo=${req.session.redirectTo}`);
                }
                 else{
                        
                        req.flash("type",`signup`);
                        return res.redirect('/user/captcha');            
                }
                  
            }         
        }

    static async login(req,res){
        const sql= await pool.getConnection();
        const body=req.body;
        req.session.login=body;
        const result= await sql.query(`select * from users where email='${body.email}'`);
        const u=result[0][0];
            if(u!=undefined)
            {    
                const p = await bcrypt.compare(body.password,result[0][0].PasswordHash);
                if(p){
                    console.log(result[0][0].Username,result[0][0].Email);
                    req.flash('type','login');
                   return res.redirect(`/user/captcha`);
                }
                else{
                    req.flash('info',"Password does not match!");
                   return res.redirect('/user/login');
                }
            }
            else{
                req.flash('info',"firstly signup with this email!");
                return res.redirect(`/user/signup?redirectTo=${req.session.redirectTo}`);
            }
    }
    static async payment(req,res){
        const sql= await pool.getConnection();
        const result=await sql.query(
            `select products.product_id as id,product_name,( select SUM(price*Quantity) from (products inner join cart on products.product_id=cart.ProductId)inner join users on users.UserID=cart.UserID where users.UserID=${req.session.user.id})as Tamount, ( select SUM(Quantity) from cart inner join users on users.UserID=cart.UserID where users.UserID=${req.session.user.id})as items,StreetAddress,City,State,Country,product_name,price,(price*Quantity) as sub,size,Quantity from ((products inner join cart on products.product_id=cart.ProductId)inner join users on users.UserID=cart.UserID)inner join useraddress on users.UserID=useraddress.UserID where users.UserID=${req.session.user.id}`
          );
          const lineItems = result[0].map(item => ({
            price_data:{
                currency:'usd',
                product_data:{
                    name:item.product_name
                
                },
                unit_amount: item.price*100
            },
            quantity:item.Quantity
          }));
        const session=await stripe.checkout.sessions.create({
            line_items:lineItems,
            mode:'payment',
            shipping_address_collection:{
                allowed_countries:['IN','US','BR']
            },
            success_url:"http://localhost:8080/OrderConfirmation" ||"",
            cancel_url:"http://localhost:8080/cart"|| ""
        })
        console.log(session);
        return res.redirect(session.url);
    }
    static async logout(req, res){
        req.session.redirectTo=req.query.redirectTo;
          delete req.session.user.id;
          delete req.session.user.username;
          delete req.session.user.email;
        // res.clearCookie('user');
          const previousUrl = req.session.redirectTo;
          req.flash('info',"Logged out Successfully");
          return res.redirect(`/${previousUrl}`);
        };
}
      
module.exports=user;