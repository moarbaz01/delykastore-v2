const createEmailTemplate = (order) => {
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #222;
          }
  
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
  
          .email-header {
            background-color: #ab20fd;
            color: #ffffff;
            padding: 20px;
            text-align: center;
          }
  
          .email-header h1 {
            margin: 0;
            font-size: 24px;
          }
  
          .email-body {
            padding: 20px;
          }
  
          .order-details {
            margin: 20px 0;
            border: 1px solid #eaeaea;
            border-radius: 8px;
            overflow: hidden;
          }
  
          .order-details-header {
            background-color: #222;
            color: #ffffff;
            padding: 10px;
            font-size: 16px;
            font-weight: bold;
          }
  
          .order-details-body {
            padding: 10px 20px;
            background: #f9f9f9;
          }
  
          .order-details-body p {
            margin: 5px 0;
            font-size: 14px;
          }
  
          .button {
            display: inline-block;
            background-color: #ab20fd;
            color: #ffffff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 20px;
          }
  
          .button:hover {
            background-color: #9300d0;
          }
  
          .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 20px;
            padding: 10px;
            background: #f4f4f4;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>Your Order Details</h1>
          </div>
          <div class="email-body">
            <p>Hello <strong>${order.user}</strong>,</p>
            <p>Thank you for your order. Here are the details:</p>
  
            <div class="order-details">
              <div class="order-details-header">Order Information</div>
              <div class="order-details-body">
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Email:</strong> ${order.email}</p>
                <p><strong>Product:</strong> ${
                  order.product?.name || "Unknown Product"
                }</p>
                <p><strong>Product:</strong> ${
                  order.costId || "Unknown Cost Id"
                }</p>
                <p><strong>Amount:</strong> ₹${order.amount}</p>
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Order Type:</strong> ${order.orderType}</p>
                <p><strong>Game Credentials:</strong>
                  <br>User ID: ${order.gameCredentials?.userId || "N/A"} 
                  <br>Zone ID: ${order.gameCredentials?.zoneId || "N/A"} 
                  <br>Game: ${order.gameCredentials?.game || "N/A"}
                </p>
                <p><strong>Order Details:</strong> ${order.orderDetails}</p>
              </div>
            </div>
  
            <p>If you have any questions, feel free to contact us.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;
};

export default createEmailTemplate;
