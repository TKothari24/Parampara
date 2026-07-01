## Vercel Setup - Step by Step Guide

### Step 1: Create a New Project in Vercel

1. Go to [vercel.com/dashboard]()https://vercel.com/dashboard
2. Click **"Add New..."** button (top right)
3. Select **"Project"**
4. Choose **"Create Git Repository"** (or import if you have GitHub)
5. Name your project: `parampara-emails` (or any name)
6. Click **"Create"**

---

### Step 2: Create the Email API File

**In your Vercel project (or local folder):**

1. Create a folder structure:
```
api/
  └── send-order-email.js
```

2. Inside `api/send-order-email.js`, paste this code:

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
      console.log(`Buyer email sent to ${buyerEmail}`);

    } else if (type === 'seller_notification') {
      // Send new order to seller
      const { createClient } = require('@supabase/supabase-js');
      
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Get seller email from database
      const { data: seller } = await supabase
        .from('sellers')
        .select('contact_email, business_name')
        .eq('user_id', sellerUserId)
        .single()
        .catch(() => ({ data: null }));

      if (!seller) {
        console.log(`Seller not found for ID: ${sellerUserId}`);
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
Email: ${checkout?.email || 'N/A'}
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
        to: seller.contact_email || buyerEmail,
        subject: `New Order #${orderId}`,
        text: sellerContent
      });
      console.log(`Seller email sent to ${seller.contact_email}`);
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: error.message });
  }
}
```

---

### Step 3: Create package.json (if needed)

In your project root, create `package.json`:

```json
{
  "name": "parampara-emails",
  "version": "1.0.0",
  "dependencies": {
    "nodemailer": "^6.9.0",
    "@supabase/supabase-js": "^2.38.0"
  }
}
```

---

### Step 4: Set Up Gmail App Password

**Important: Use Gmail App Password, NOT your regular password**

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **"Security"** (left menu)
3. Scroll down to **"How you sign in to Google"**
4. Enable **"2-Step Verification"** (if not already done)
5. After 2FA is enabled, go back to Security
6. Click **"App passwords"** (below 2-Step Verification)
7. Select:
   - App: **Mail**
   - Device: **Windows Computer** (or your device)
8. Google will show a 16-character password - **copy it**
9. Save this password - you'll need it next

Example password: `abcd efgh ijkl mnop` (with spaces)

---

### Step 5: Add Environment Variables to Vercel

1. In Vercel dashboard, go to your project
2. Click **"Settings"** (top menu)
3. Go to **"Environment Variables"** (left menu)
4. Add these variables:

| Variable Name | Value | Example |
|---|---|---|
| `EMAIL_USER` | Your Gmail address | `your-email@gmail.com` |
| `EMAIL_PASS` | Gmail app password (16 chars) | `abcd efgh ijkl mnop` |
| `SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | `eyJhbG...` |

**How to get Supabase credentials:**
1. Go to [supabase.com](https://supabase.com)
2. Go to your project
3. Click **"Settings"** (bottom left)
4. Click **"API"**
5. Copy:
   - **Project URL** → paste as `SUPABASE_URL`
   - **service_role key** → paste as `SUPABASE_SERVICE_ROLE_KEY`

---

### Step 6: Deploy to Vercel

**Option A: Deploy from GitHub**
- Push your code to GitHub
- Vercel will auto-deploy
- Your function URL will be: `https://your-project-name.vercel.app/api/send-order-email`

**Option B: Deploy using Vercel CLI**
```bash
npm install -g vercel
vercel login
```
(Follow prompts to login)

```bash
vercel deploy
```

After deployment, you'll see:
```
✓ Production: https://your-project-name.vercel.app/api/send-order-email
```

---

### Step 7: Test Your Email Endpoint

1. Open Vercel dashboard → your project
2. Go to **"Deployments"**
3. Click the latest deployment
4. You should see **"Domains"** showing your URL

Test the endpoint using curl or Postman:

```bash
curl -X POST https://your-project-name.vercel.app/api/send-order-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "buyer_confirmation",
    "orderId": "test-123",
    "buyerEmail": "your-email@gmail.com",
    "items": [{"name": "Test Item", "qty": 1, "price": 100}],
    "total": 100,
    "itemsCount": 1,
    "checkout": {
      "name": "Test User",
      "email": "your-email@gmail.com",
      "phone": "+91 9876543210",
      "address": "Test Address, City"
    }
  }'
```

If successful, you should receive a test email!

---

### Step 8: Update script.js in Your Project

1. Open `script.js` in your Parampara project
2. Find this line (around line 177):
```javascript
const ORDER_EMAIL_WEBHOOK = '';
```

3. Replace with your Vercel URL:
```javascript
const ORDER_EMAIL_WEBHOOK = 'https://your-project-name.vercel.app/api/send-order-email';
```

Example:
```javascript
const ORDER_EMAIL_WEBHOOK = 'https://parampara-emails.vercel.app/api/send-order-email';
```

---

### Step 9: Test Full Order Checkout

1. Go to your Parampara website
2. Log in as a buyer
3. Add items to cart
4. Go to checkout
5. Fill in all details
6. Click **"Place Order"**
7. Check your email inbox (and spam folder)

**You should receive:**
- ✅ Buyer confirmation email
- ✅ Seller notification email

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not sending | Check Vercel logs: Dashboard → Deployments → Function logs |
| "Authentication failed" | Gmail app password incorrect (use 16-char, not regular password) |
| Seller email not found | Ensure seller profile has `contact_email` field in database |
| CORS error | This is expected in browser - works from Vercel |
| Email in spam | Mark as "Not Spam" in Gmail |

---

## Next Steps After Setup

1. ✅ Test with real orders
2. ✅ Customize email templates (add HTML, logo, etc.)
3. ✅ Add order tracking link to emails
4. ✅ Enable email preferences in user settings
5. ✅ Monitor email delivery rate
