# Email Notification Setup for Orders

## Overview
The Parampara checkout system sends order confirmations to **both buyers and sellers** via email webhooks. This guide explains how to set it up.

## Current Implementation
The system includes two notification functions in `script.js`:
- `notifyBuyer()` - Sends order confirmation to the customer
- `notifySeller()` - Sends new order notification to the seller

Both functions send data to a webhook endpoint:
```javascript
const ORDER_EMAIL_WEBHOOK = ''; // Set your serverless function URL here
```

## Quick Start (Vercel Recommended)

### Step 1: Create Vercel Project
1. Go to [vercel.com](https://vercel.com) and create account
2. Create a new project from this repository

### Step 2: Create Email Handler
Create file: `api/send-order-email.js`

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
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

  const { type, orderId, buyerEmail, sellerUserId, items, total, itemsCount, checkout } = req.body;

  try {
    if (type === 'buyer_confirmation') {
      // Send order confirmation to buyer
      const itemsList = items
        .map(item => `- ${item.name} (Qty: ${item.qty}, Price: ₹${item.price})`)
        .join('\n');

      const buyerContent = `
Dear ${checkout?.name || 'Valued Customer'},

Thank you for your order! Your order has been confirmed.

ORDER #${orderId}
Total: ₹${total.toFixed(2)}
Items: ${itemsCount}

ITEMS:
${itemsList}

SHIPPING TO:
${checkout?.address || 'Address not provided'}

Your order will be prepared and shipped soon. 
Track your order in your Parampara account.

Thank you!
Parampara Team
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: buyerEmail,
        subject: `Order Confirmation #${orderId}`,
        text: buyerContent
      });

    } else if (type === 'seller_notification') {
      // Send new order to seller
      const { createClient } = require('@supabase/supabase-js');
      
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Get seller email (you need seller_users table or fetch from auth.users)
      const { data: seller } = await supabase
        .from('users')
        .select('email')
        .eq('id', sellerUserId)
        .single()
        .catch(() => null);

      if (!seller?.email) {
        return res.status(200).json({ skipped: true });
      }

      const itemsList = items
        .map(item => `- ${item.name} (Qty: ${item.qty}, Price: ₹${item.price})`)
        .join('\n');

      const sellerContent = `
New Order Received!

ORDER #${orderId}
Total: ₹${total.toFixed(2)}
Items: ${itemsCount}

ITEMS:
${itemsList}

CUSTOMER:
Name: ${checkout?.name || 'N/A'}
Email: ${buyerEmail}
Phone: ${checkout?.phone || 'N/A'}
Address: ${checkout?.address || 'N/A'}

ACTION NEEDED:
1. Log in to your seller dashboard
2. Confirm receipt of this order
3. Prepare items for shipment
4. Update tracking info

Parampara Seller Team
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: seller.email,
        subject: `New Order #${orderId}`,
        text: sellerContent
      });
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: error.message });
  }
}
```

### Step 3: Install Dependencies
```bash
npm install nodemailer @supabase/supabase-js
```

### Step 4: Set Environment Variables in Vercel
Settings → Environment Variables:
- `EMAIL_USER`: Your Gmail (e.g., `orders@gmail.com`)
- `EMAIL_PASS`: Gmail app password (16 chars, from account settings)
- `SUPABASE_URL`: From Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY`: From Supabase API settings

### Step 5: Deploy
```bash
vercel deploy
```

Get your function URL (e.g., `https://your-project.vercel.app/api/send-order-email`)

### Step 6: Update script.js
```javascript
const ORDER_EMAIL_WEBHOOK = 'https://your-project.vercel.app/api/send-order-email';
```

## Gmail App Password Setup

1. Enable 2FA on Gmail account: [myaccount.google.com](https://myaccount.google.com)
2. Settings → Security → App passwords
3. Select Mail → Windows
4. Copy 16-char password
5. Use as `EMAIL_PASS` in Vercel

## Testing

1. Log in as buyer
2. Add items to cart
3. Checkout
4. Check your buyer email (usually spam folder)
5. Check seller email

## Troubleshooting

- **Email not sent**: Check Vercel logs, verify SMTP credentials
- **Emails in spam**: Gmail marked them as spam, mark as "Not Spam"
- **Webhook error**: Verify URL in script.js
- **Seller email missing**: Ensure seller profile exists in database

## Production Tips

- Use SendGrid or Mailgun for higher volume
- Add email templates with HTML formatting
- Save email logs to database for records
- Add email preferences to user accounts
- Template emails for different scenarios

## Disable Email (Temporary)

Leave webhook empty in script.js:
```javascript
const ORDER_EMAIL_WEBHOOK = '';
```

No emails will be sent if URL is empty.