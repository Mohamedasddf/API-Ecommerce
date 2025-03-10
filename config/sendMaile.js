require('dotenv').config();  // تحميل بيانات البيئة من ملف .env
const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  // إعداد الاتصال مع Gmail باستخدام nodemailer
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,  // خدمة مثل Gmail
    port: process.env.EMAIL_PORT,  // المنفذ 465 للبروتوكول الآمن
    secure: true,  // للتأكد من التشفير باستخدام SSL/TLS
    auth: {
      user: process.env.EMAIL_USER,  // البريد الإلكتروني
      pass: process.env.EMAIL_PASSWORD  // كلمة مرور التطبيق (إذا كنت تستخدم 2FA)
    }
  });

  // إعداد بيانات الرسالة
  const mailOptions = {
    from: process.env.EMAIL_USER,  // البريد المرسل منه
    to: options.email,  // البريد المرسل إليه
    subject: options.subject,  // موضوع الرسالة
    html: options.html  // محتوى الرسالة HTML
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.log('Error occurred:', error);
  }
};



module.exports = {sendMail};
