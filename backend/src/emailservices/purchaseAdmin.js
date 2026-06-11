/**
 * Template for new order notifications to admin
 */
function getPurchaseAdminTemplate({ orderId, customerName, customerEmail, customerPhone, totalAmount, eventDate, rentalDate, fulfillmentType, deliveryFee, venueAddress, specialNotes, items }) {
  const subject = `🎉 New Order Reservation #${orderId} Received - FinalTouch Studio`;
  
  const formattedItems = items.map(item => {
    const name = item.package_name || item.item_name || "Custom Rental Item";
    return `<tr>
              <td style="padding:8px; border:1px solid #ddd;">${name}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center;">${item.quantity || 1}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:right;">CAD $${(parseFloat(item.price || item.price_at_rent || 0)).toFixed(2)}</td>
            </tr>`;
  }).join("\n");

  const formattedItemsText = items.map(item => {
    const name = item.package_name || item.item_name || "Custom Rental Item";
    return `- ${name} (Qty: ${item.quantity || 1}, CAD $${(parseFloat(item.price || item.price_at_rent || 0)).toFixed(2)})`;
  }).join("\n");

  const text = `New Reservation Order #${orderId} Received!\n\nCustomer: ${customerName}\nEmail: ${customerEmail}\nPhone: ${customerPhone}\nEvent Date: ${eventDate}\nRental Date: ${rentalDate}\nFulfillment: ${fulfillmentType}\nDelivery Fee: CAD $${deliveryFee}\nVenue: ${venueAddress}\nSpecial Notes: ${specialNotes || 'None'}\nTotal Price: CAD $${(parseFloat(totalAmount)).toFixed(2)}\n\nItems List:\n${formattedItemsText}`;

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
        .info-table td.label { font-weight: bold; background-color: #fcfcfd; width: 35%; color: #555555; }
        .items-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 25px; }
        .items-table th { background-color: #f6edf1; color: #542141; padding: 8px; border: 1px solid #ddd; }
        .footer { background-color: #fcfcfd; padding: 15px; text-align: center; font-size: 11px; color: #999999; border-top: 1px solid #eeeeee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FinalTouch Order Alerts</h1>
        </div>
        <div class="content">
          <h2>New Reservation Order Received</h2>
          <p>An order has been submitted and is pending confirmation. Below are checkout details:</p>
          
          <table class="info-table">
            <tr><td class="label">Order ID</td><td><strong>#${orderId}</strong></td></tr>
            <tr><td class="label">Customer Name</td><td>${customerName}</td></tr>
            <tr><td class="label">Email</td><td>${customerEmail}</td></tr>
            <tr><td class="label">Phone</td><td>${customerPhone}</td></tr>
            <tr><td class="label">Event Date</td><td>${eventDate}</td></tr>
            <tr><td class="label">Rental Pickup Date</td><td>${rentalDate}</td></tr>
            <tr><td class="label">Fulfillment Type</td><td style="text-transform: capitalize;">${fulfillmentType}</td></tr>
            <tr><td class="label">Delivery Fee</td><td>CAD $${(parseFloat(deliveryFee || 0)).toFixed(2)}</td></tr>
            <tr><td class="label">Venue Address</td><td>${venueAddress}</td></tr>
            <tr><td class="label">Special Notes</td><td>${specialNotes || '<em>None</em>'}</td></tr>
            <tr><td class="label">Total Amount</td><td><strong>CAD $${(parseFloat(totalAmount)).toFixed(2)}</strong></td></tr>
          </table>

          <h3 style="font-size:15px; color:#542141; margin-top: 20px;">Itemized List</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th style="text-align:left;">Item/Package</th>
                <th style="width:15%;">Qty</th>
                <th style="width:25%; text-align:right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${formattedItems}
            </tbody>
          </table>

          <p style="margin-top: 25px;">Please log in to the admin panel to confirm or update this reservation.</p>
        </div>
        <div class="footer">
          FinalTouch Studio Order Notification System
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, text, html };
}

module.exports = getPurchaseAdminTemplate;
