/**
 * Template for order status updates to customer
 */
function getOrderStatusUserTemplate({ orderId, customerName, status, eventDate, fulfillmentType }) {
  const statusUpper = (status || "pending").toUpperCase();
  const subject = `🔔 Order Status Update: #${orderId} - ${statusUpper}`;
  
  const text = `Dear ${customerName},\n\nYour FinalTouch Studio order #${orderId} status has been updated to ${statusUpper}.\n\nEvent Date: ${eventDate}\nFulfillment: ${fulfillmentType}\n\nThank you for choosing FinalTouch Studio!`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Outfit', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f7f7f9; color: #222222; }
        .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #542141 0%, #9F507C 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; }
        .content { padding: 35px 25px; line-height: 1.6; }
        .content h2 { font-size: 19px; color: #542141; margin-top: 0; border-bottom: 2px solid #f0f0f5; padding-bottom: 8px; }
        .status-badge { display: inline-block; padding: 6px 16px; border-radius: 99px; font-weight: bold; font-size: 14px; text-transform: uppercase; margin: 15px 0; }
        .status-confirmed { background-color: #e6f9ec; color: #10b981; }
        .status-pending { background-color: #fffbeb; color: #f59e0b; }
        .status-cancelled { background-color: #fef2f2; color: #ef4444; }
        .info-grid { display: table; width: 100%; margin: 20px 0; }
        .info-row { display: table-row; }
        .info-cell { display: table-cell; padding: 6px 0; font-size: 14px; }
        .info-cell.label { font-weight: bold; width: 35%; color: #555555; }
        .footer { background-color: #fcfcfd; padding: 20px; text-align: center; font-size: 11px; color: #999999; border-top: 1px solid #eeeeee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FinalTouch Studio Status Update</h1>
        </div>
        <div class="content">
          <h2>Your Order Status Has Been Updated</h2>
          <p>Dear ${customerName},</p>
          <p>We are writing to let you know that the status of your reservation order <strong>#${orderId}</strong> has been updated to:</p>
          
          <div style="text-align: center;">
            <span class="status-badge ${status === 'confirmed' ? 'status-confirmed' : status === 'cancelled' ? 'status-cancelled' : 'status-pending'}">
              ${statusUpper}
            </span>
          </div>

          <div class="info-grid">
            <div class="info-row">
              <div class="info-cell label">Order Number</div>
              <div class="info-cell">#${orderId}</div>
            </div>
            <div class="info-row">
              <div class="info-cell label">Event Date</div>
              <div class="info-cell">${eventDate}</div>
            </div>
            <div class="info-row">
              <div class="info-cell label">Fulfillment Type</div>
              <div class="info-cell" style="text-transform: capitalize;">${fulfillmentType}</div>
            </div>
          </div>

          <p style="margin-top: 30px;">If you have any questions about this update or need to adjust setup timings, please respond directly to this email.</p>
          <p>Sincerely,<br><strong>FinalTouch Studio</strong></p>
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

module.exports = getOrderStatusUserTemplate;
