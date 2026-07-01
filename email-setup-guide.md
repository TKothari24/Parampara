# Email Notification Setup for Sellers

## Overview
The Parampara checkout system includes email notifications for sellers when orders are placed. Here's how to set it up.

## Current Implementation
The `notifySeller` function in `script.js` already exists and sends order data to a webhook endpoint:

```javascript
const ORDER_EMAIL_WEBHOOK = ''; // Set your serverless function URL here
```

## Setup Options

### Option 1: Vercel Serverless Function (Recommended)
1. Create a new Vercel project
2. Create `api/send-seller-email.js`:
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, sellerUserId, buyerEmail, items, total, checkout } = req.body;

  const sellerEmail = await getSellerEmail(sellerUserId); // Implement this function
  
  const emailContent = `
    New Order Received!
    
    Order ID: ${orderId}
    Total: ₹${total}
    
    Items:
    ${items.map(item => `- ${item.name} (Qty: ${item.qty}, Price: ₹${item.price})`).join('\n')}
    
    Customer Info:
    ${checkout ? `
    Name: ${checkout.name}
    Email: ${checkout.email}
    Phone: ${checkout.phone}
    Address: ${checkout.address}
    ` : 'N/A'}
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: sellerEmail,
      subject: `New Order #${orderId}`,
      text: emailContent
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
```

3. Set environment variables in Vercel:
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASS`: Your Gmail app password
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_KEY`: Your Supabase service role key

4. Deploy and copy the function URL
5. Update `script.js`:
```javascript
const ORDER_EMAIL_WEBHOOK = 'https://your-vercel-app.vercel.app/api/send-seller-email';
```

### Option 2: Netlify Function
Similar setup with `netlify/functions/send-seller-email.js`

### Option 3: AWS Lambda
Create a Lambda function with similar logic

## Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings → Security → App passwords
3. Generate a new app password
4. Use this password in your environment variables

## Testing
1. Place a test order
2. Check the seller email inbox
3. Verify all order details are included

## Alternative: Use Email Service
For production, consider using:
- SendGrid
- Mailgun
- AWS SES
- Resend

These provide better deliverability and analytics.

## Security Notes
- Never commit email credentials to git
- Use environment variables
- Validate email addresses
- Consider rate limiting
