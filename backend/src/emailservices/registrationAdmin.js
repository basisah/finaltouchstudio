/**
 * Template for admin registration notification email
 */
function getRegistrationAdminTemplate({ name, email, userId, type }) {
  const method = type || "Manual Registration";
  const subject = `✨ New Customer Registered (${method}) - FinalTouch Studio`;
  
  const text = `New Customer Registered!\n\nUser ID: ${userId}\nName: ${name}\nEmail: ${email}\nMethod: ${method}\n\nThis account is successfully saved in the FinalTouch Studio database.`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f7f7f9; color: #222222; }
        .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background: #542141; padding: 25px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; }
        .content { padding: 30px 25px; line-height: 1.6; }
        .content h2 { font-size: 18px; color: #542141; margin-top: 0; }
        .info-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .info-table td { padding: 10px; border: 1px solid #eeeeee; font-size: 14px; }
        .info-table td.label { font-weight: bold; background-color: #fcfcfd; width: 30%; color: #555555; }
        .footer { background-color: #fcfcfd; padding: 15px; text-align: center; font-size: 11px; color: #999999; border-top: 1px solid #eeeeee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FinalTouch Studio Alerts</h1>
        </div>
        <div class="content">
          <h2>New Customer Registered</h2>
          <p>A new customer has successfully created an account on FinalTouch Studio. Below are the registration details:</p>
          <table class="info-table">
            <tr>
              <td class="label">User ID</td>
              <td>#${userId}</td>
            </tr>
            <tr>
              <td class="label">Name</td>
              <td>${name}</td>
            </tr>
            <tr>
              <td class="label">Email</td>
              <td>${email}</td>
            </tr>
            <tr>
              <td class="label">Auth Method</td>
              <td><strong>${method}</strong></td>
            </tr>
            <tr>
              <td class="label">Registered At</td>
              <td>${new Date().toLocaleString("en-CA")}</td>
            </tr>
          </table>
          <p style="margin-top: 25px;">You can view and manage all members in your admin dashboard directory.</p>
        </div>
        <div class="footer">
          FinalTouch Studio Notification System
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, text, html };
}

module.exports = getRegistrationAdminTemplate;
