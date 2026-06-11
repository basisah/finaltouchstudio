/**
 * Template for order receipt / reservation confirmation to customer
 */
function getPurchaseUserTemplate({ orderId, customerName, totalAmount, eventDate, rentalDate, fulfillmentType, venueAddress, items }) {
  const subject = `🎉 Order Reservation #${orderId} Received - FinalTouch Studio`;
  
  const formattedItems = items.map(item => {
    const name = item.package_name || item.item_name || "Custom Rental Item";
    return `<li>${item.quantity || 1}x ${name} - CAD $${(parseFloat(item.price || item.price_at_rent || 0)).toFixed(2)}</li>`;
  }).join("\n");

  const formattedItemsText = items.map(item => {
    const name = item.package_name || item.item_name || "Custom Rental Item";
    return `- ${item.quantity || 1}x ${name} (CAD $${(parseFloat(item.price || item.price_at_rent || 0)).toFixed(2)})`;
  }).join("\n");

  const text = `Dear ${customerName},\n\nThank you for your reservation order #${orderId} with FinalTouch Studio!\n\nOrder Details:\n- Total Amount: CAD $${(parseFloat(totalAmount)).toFixed(2)}\n- Event Date: ${eventDate}\n- Retrieval/Rental Date: ${rentalDate}\n- Fulfillment: ${fulfillmentType}\n- Venue Address: ${venueAddress}\n\nItems Reserved:\n${formattedItemsText}\n\nWe will review your order details and contact you shortly to coordinate collection/drop-off.\n\nThank you,\nFinalTouch Studio`;

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
        .info-grid { display: table; width: 100%; margin-bottom: 20px; }
        .info-row { display: table-row; }
        .info-cell { display: table-cell; padding: 6px 0; font-size: 14px; }
        .info-cell.label { font-weight: bold; width: 35%; color: #555555; }
        .items-list { background: #fdfafb; border: 1px solid #f6edf1; border-radius: 8px; padding: 15px 20px; list-style-type: none; margin: 15px 0; }
        .items-list li { padding: 6px 0; border-bottom: 1px solid #f8eef2; font-size: 14px; }
        .items-list li:last-child { border-bottom: none; }
        .total-box { margin-top: 25px; padding: 15px; background-color: #f6edf1; border-radius: 8px; text-align: right; font-size: 16px; font-weight: bold; color: #542141; }
        .footer { background-color: #fcfcfd; padding: 20px; text-align: center; font-size: 11px; color: #999999; border-top: 1px solid #eeeeee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FinalTouch Studio Receipt</h1>
        </div>
        <div class="content">
          <h2>Order Reservation Received</h2>
          <p>Dear ${customerName},</p>
          <p>Thank you for placing a reservation order with us! We have received your request and will review the rental availability for your event date. Below is your summary:</p>
          
          <h3 style="font-size:15px; color:#9F507C; margin-top: 20px;">Logistics Details</h3>
          <div class="info-grid">
            <div class="info-row">
              <div class="info-cell label">Order Number</div>
              <div class="info-cell"><strong>#${orderId}</strong></div>
            </div>
            <div class="info-row">
              <div class="info-cell label">Event Date</div>
              <div class="info-cell">${eventDate}</div>
            </div>
            <div class="info-row">
              <div class="info-cell label">Pickup/Rental Date</div>
              <div class="info-cell">${rentalDate}</div>
            </div>
            <div class="info-row">
              <div class="info-cell label">Fulfillment</div>
              <div class="info-cell" style="text-transform: capitalize;">${fulfillmentType}</div>
            </div>
            <div class="info-row">
              <div class="info-cell label">Venue Address</div>
              <div class="info-cell">${venueAddress}</div>
            </div>
          </div>

          <h3 style="font-size:15px; color:#9F507C; margin-top: 20px;">Items Reserved</h3>
          <ul class="items-list">
            ${formattedItems}
          </ul>

          <div class="total-box">
            Total Amount: CAD $${(parseFloat(totalAmount)).toFixed(2)}
          </div>

          <p style="margin-top: 30px;">A FinalTouch coordinator will reach out to you within 24 hours to confirm setup schedules and finalize logistics. If you need immediate assistance, please reply to this message.</p>
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

module.exports = getPurchaseUserTemplate;
