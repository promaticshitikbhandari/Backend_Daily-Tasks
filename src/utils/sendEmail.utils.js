import transporter from "../config/mail.js";

const sendEmail = async({to, subject, html}) => {
    try {
        await transporter.sendMail({
            from: `"My App" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log("Email sent succesfully");
        
    } catch (error) {
        console.error("Email sending failed: ", error);
        throw error;
    }
};

export default sendEmail