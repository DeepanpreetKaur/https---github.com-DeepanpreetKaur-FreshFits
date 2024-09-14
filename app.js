const express=require('express');
const ejs=require('ejs');
const app=express();
const flash=require('connect-flash');
const session=require('express-session');
const path = require('path');
app.use(express.static(path.join(__dirname,'public')));
app.use('/user',express.static(path.join(__dirname,'public')));
app.use('/admin',express.static(path.join(__dirname,'public')));
const user=require('./routes/user_routes');
const products=require('./routes/product_routes');
const admin=require('./routes/Admin_routes')
const cookie=require('cookie-parser');
// const passport=require('passport');
const cookieParser = require('cookie-parser');
// const captcha=require('node-captcha-generator');
const { Sequelize } = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelize = new Sequelize({
    host: 'localhost',
    port: '3306',
    username: 'root',
    database: 'clothing_store',
    dialect: 'mysql'
});



const sessionStore = new SequelizeStore({
    db: sequelize
});

app.use(cookieParser());

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: sessionStore,       
    cookie: {
        maxAge: 50 * 24 * 60 * 60 * 1000,
        httpOnly: true,        
        secure: false          
    }
  }));

  sessionStore.sync()
    .then(() => {
        console.log('Session table created or synchronized.');
    })
    .catch(err => {
        console.error('Error synchronizing session table:', err);
    });

app.use(flash());
app.use((req,res,next)=>{
  res.locals.user=req.session.user;
  next();
})


app.use('/',products);
app.use('/user',user);
app.use('/admin',admin);
app.listen(8080,()=>console.log("Listening!"));