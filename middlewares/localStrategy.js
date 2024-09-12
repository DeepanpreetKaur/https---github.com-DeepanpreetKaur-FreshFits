const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local');
const passport = require('passport');
const mysql=require('mysql2/promise');
const pool=mysql.createPool({
    host:'localhost',
    user:'root',
    database:'clothing_store'
});

const localStrategy = new LocalStrategy({
    usernameField: 'email', 
}, async (email, password, done) => {
    try {
        const body=req.body;
        req.session.login=body;
        const sql= await pool.getConnection();
        const result= await sql.query(`select * from users where email='${email}'`);
        const u=result[0][0];
            if(u!=undefined){
            const p = await bcrypt.compare(password,result[0][0].PasswordHash);
                if(p){
                    req.session.login=null;
                    return done(null,true,{ message: 'Logged in Successfully' }); 
                }
                else{
                    return done(null,false,{ message: 'Password does not match!' });
                }
            }
               else{
                return done(null,false,{ message: 'Incorrect email' });
            }
        }catch(err)
        {
           return done(err);
        }
});



passport.serializeUser((user, done) => {
    done(null, user.id); // Store user ID in session
});

passport.deserializeUser(async (id, done) => {
    try {
        const [user] = await sql.query(`select * from users where UserID=${id}`); 
        if (user) {
            done(null, user[0]); 
        } else {
            done(new Error('User not found')); 
        }
    } catch (error) {
        done(error); 
    }
});

module.exports=localStrategy;
// module.exports=user;