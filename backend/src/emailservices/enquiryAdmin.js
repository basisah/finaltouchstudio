/**
 * Template for customer contact enquiries to admin
 */
function getEnquiryAdminTemplate({ enquiryId, name, email, occasion, message }) {
  const subject = `✉️ New Customer Enquiry (#${enquiryId}) - FinalTouch Studio`;
  
  const text = `New Customer Enquiry Submitted!\n\nEnquiry ID: #${enquiryId}\nName: ${name}\nEmail: ${email}\nOccasion: ${occasion || "Not Specified"}\nMessage:\n${message}`;

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
        .info-table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px; }
        .info-table td { padding: 8px 10px; border: 1px solid #eeeeee; font-size: 13px; }
        .info-table td.label { font-weight: bold; background-color: #fcfcfd; width: 30%; color: #555555; }
        .message-box { background: #f9f9f9; padding: 15px; border-left: 4px solid #9F507C; font-size: 14px; margin-top: 15px; line-height: 1.5; }
        .footer { background-color: #fcfcfd; padding: 15px; text-align: center; font-size: 11px; color: #999999; border-top: 1px solid #eeeeee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FinalTouch Enquiry Alerts</h1>
        </div>
        <div class="content">
          <h2>New Customer Enquiry Received</h2>
          <p>A new customer has submitted an enquiry form from your website:</p>
          
          <table class="info-table">
            <tr><td class="label">Enquiry ID</td><td>#${enquiryId}</td></tr>
            <tr><td class="label">Customer Name</td><td>${name}</td></tr>
            <tr><td class="label">Email Address</td><td>${email}</td></tr>
            <tr><td class="label">Occasion</td><td>${occasion || "Not Specified"}</td></tr>
            <tr><td class="label">Submitted At</td><td>${new Date().toLocaleString("en-CA")}</td></tr>
          </table>

          <h3 style="font-size:14px; color:#542141; margin-top: 20px; margin-bottom: 5px;">Customer Message</h3>
          <div class="message-box">
            ${message.replace(/\n/g, "<br>")}
          </div>
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

module.exports = getEnquiryAdminTemplate;
