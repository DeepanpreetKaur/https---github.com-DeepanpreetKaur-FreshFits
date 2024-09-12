async function email(email,subject,body){
    const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "deepankaur08@gmail.com",
        pass: "opxe rrqz kxrx molz",
    },
});

async function main() {
    
    const info = await transporter.sendMail({
        from: 'deepankaur08@gmail.com',
        to:`${email}`,
        subject: subject, 
        html:body, 
    });

    console.log("Message sent: %s", info.messageId);
    
}
main().catch(console.error);
}

module.exports=email;