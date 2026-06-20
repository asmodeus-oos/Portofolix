const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body;

  // Simple validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Create SMTP mail transporter using Vercel Environment Variables
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587/other ports
    auth: {
      user: process.env.SMTP_USER, // Your mail login credentials (e.g. Gmail address)
      pass: process.env.SMTP_PASS  // Your secure app-specific password
    }
  });

  const mailOptions = {
    from: `"${name}" <${process.env.SMTP_USER}>`, 
    replyTo: email, 
    to: 'mohamed20020093@ksiu.edu.eg, mohamed20020093@gmail.com', // Sends directly to both emails
    subject: subject ? `ME Gallery Inquiry: ${subject}` : `Inquiry from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 12px; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <h2 style="color: #A87C11; border-bottom: 2px solid #D4AF37; padding-bottom: 12px; margin-top: 0; font-weight: 700;">New Message from ME Gallery</h2>
        <p style="font-size: 15px; color: #333333; margin: 15px 0;"><strong>Sender Name:</strong> ${name}</p>
        <p style="font-size: 15px; color: #333333; margin: 15px 0;"><strong>Sender Email:</strong> <a href="mailto:${email}" style="color: #A87C11; text-decoration: none;">${email}</a></p>
        ${subject ? `<p style="font-size: 15px; color: #333333; margin: 15px 0;"><strong>Subject:</strong> ${subject}</p>` : ''}
        <div style="background-color: #F9F9F9; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #D4AF37;">
          <h3 style="margin-top: 0; color: #0F172A; font-size: 16px;">Message Content:</h3>
          <p style="white-space: pre-wrap; line-height: 1.6; color: #475569; margin: 0; font-size: 14.5px;">${message}</p>
        </div>
        <footer style="margin-top: 25px; border-top: 1px solid #eeeeee; padding-top: 15px; font-size: 12px; color: #999999; text-align: center;">
          This message was routed via the ME Gallery Vercel Serverless Form Router.
        </footer>
      </div>
    `
  };

  try {
    // If credentials are not set on Vercel, log payload and alert developer
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials missing. Email payload draft:', mailOptions);
      return res.status(501).json({ 
        error: 'SMTP credentials are not configured in Vercel. Set SMTP_USER and SMTP_PASS under environment variables.' 
      });
    }

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Message sent successfully to both addresses.' });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to dispatch email. Server error.' });
  }
};
