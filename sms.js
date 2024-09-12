const mysql=require('mysql2/promise');
const pool=mysql.createPool({
    host:'localhost',
    user:'root',
    database:'clothing_store'
});
async function sms(userid,name) {
    const sql= await pool.getConnection();
    require("dotenv").config();

    const otp = Math.floor(100000 + Math.random() * 900000);
    await sql.query(`insert into OTP(UserID,Otp) values(${userid},${otp})`);

    const accountSid = "AC2e399299998a35bcda9c2be64315b917";
    const accountToken = "8751376fe9344f5273bf515a6c876de6";
    const client = require("twilio");
    const twilio=client(accountSid, accountToken);
    function SendSMS(otp,name) {
      try {
        const b="OTP Verification"+"\n"+` Dear ${name} ,`+"\n"+"Thank you for providing your phone number with FreshFits.\n To confirm your phone number, please use the following One-Time Password (OTP):\n"+
          `Your OTP code is: ${otp}`+"\n\nBest regards,\nThe FreshFits Team";
        let options = {
          from: +17204146692,
          to: +918950378522,
          body:b
        };
         const message= twilio.messages.create(options);
        console.log(message);
      } catch (error) {
        console.log(error);
      }
    }
    SendSMS(otp,name);
  }
  module.exports = sms;
  