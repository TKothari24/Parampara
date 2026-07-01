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
