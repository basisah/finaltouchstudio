/**
 * Template for customer registration confirmation email
 */
function getRegistrationUserTemplate({ name, email }) {
  const subject = "✨ Welcome to FinalTouch Studio!";
  
  const text = `Hi ${name},\n\nWelcome to FinalTouch Studio! Your account has been registered successfully with the email: ${email}.\n\nBrowse our premium event collections and start planning your perfect occasion.\n\nBest regards,\nFinalTouch Studio Team`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Outfit', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f7f7f9; color: #222222; }
        .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #542141 0%, #9F507C 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 600; letter-spacing: 0.5px; }
        .content { padding: 40px 30px; line-height: 1.6; }
        .content h2 { font-size: 20px; color: #542141; margin-top: 0; }
        .footer { background-color: #fcfcfd; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
        .button { display: inline-block; padding: 12px 24px; margin-top: 20px; background-color: #9F507C; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FinalTouch Studio</h1>
        </div>
        <div class="content">
          <h2>Welcome aboard, ${name}!</h2>
          <p>We are absolutely thrilled to have you join us. Your account is now active under the email address: <strong>${email}</strong>.</p>
          <p>Whether you are planning a grand wedding stage, a vibrant Gaye Holud, or an intimate birthday party, FinalTouch is ready to supply premium decor and customized details that will leave your guests in awe.</p>
          <p style="text-align: center;">
            <a href="https://finaltouchstudio.vercel.app/items" class="button">Browse Event Inventory</a>
          </p>
          <p style="margin-top: 30px;">If you have any questions or require custom setup consultations, feel free to reply to this email.</p>
          <p>Warm regards,<br><strong>FinalTouch Studio Team</strong></p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} FinalTouch Studio. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, text, html };
}

module.exports = getRegistrationUserTemplate;
