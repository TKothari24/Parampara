function getImage(mapping, name) {
  if (!name) return "images1/placeholder.png";
  const normalized = name.replace(/\s+/g, '').toLowerCase();
  for (const key in mapping) {
    if (key.replace(/\s+/g, '').toLowerCase() === normalized) {
      return mapping[key];
    }
  }
  return "images1/placeholder.png";
}

// ---- Cart badge and utils ----
async function getCartCount() {
  const user = await getCurrentUser();
  if (!user || !supabase) return 0;
  await supabaseInitPromise;
  const { data, error } = await supabase
    .from('cart_items')
    .select('qty')
    .eq('user_id', user.id);
  if (error || !data) return 0;
  return data.reduce((sum, r) => sum + (Number(r.qty) || 0), 0);
}

function ensureCartBadgeEl() {
  // Target only the navbar cart link, not product buttons
  const links = Array.from(document.querySelectorAll('a.cart.border'));
  if (!links.length) return null;
  let badge = links[0].querySelector('.cart-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'cart-badge';
    links[0].appendChild(badge);
  }
  return badge;
}

async function refreshCartBadge() {
  try {
    const user = await getCurrentUser();
    const badge = ensureCartBadgeEl();
    if (!badge) return;
    if (!user) {
      badge.textContent = '';
      badge.style.display = 'none';
      badge.dataset.count = '0';
      return;
    }
    const count = await getCartCount();
    const prev = Number(badge.dataset.count || '0');
    if (count > 0) {
      badge.textContent = String(count);
      badge.style.display = 'inline-block';
      // animate if changed
      if (count !== prev) {
        badge.classList.remove('bump');
        // force reflow to restart animation
        void badge.offsetWidth;
        badge.classList.add('bump');
      }
    } else {
      badge.textContent = '';
      badge.style.display = 'none';
    }
    badge.dataset.count = String(count);
  } catch (e) {
    // On error hide badge
    const badge = ensureCartBadgeEl();
    if (badge) {
      badge.textContent = '';
      badge.style.display = 'none';
      badge.dataset.count = '0';
    }
  }
}

async function clearCart() {
  const user = await getCurrentUser();
  if (!user || !supabase) throw new Error('AUTH_REQUIRED');
  await supabaseInitPromise;
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id);
  if (error) throw error;
  return { ok: true };
}
// -------------------------------
// Supabase Setup (declare only once!)
// -------------------------------
var SUPABASE_URL = "https://dtelpnugwnknweyirsmt.supabase.co";
var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0ZWxwbnVnd25rbndleWlyc210Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDE2NjUsImV4cCI6MjA3Mzc3NzY2NX0.yTGm_dEpuWRCCJwn_LKuQoY2hf3iOelbte_GnuPP0go";

var supabase;
var supabaseInitPromise;

function initializeSupabase() {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        console.log('Checking window.supabase:', window.supabase);
        console.log('typeof window.supabase:', typeof window.supabase);
        
        // The Supabase object already has the client structure
        if (window.supabase && typeof window.supabase.from === 'function') {
          supabase = window.supabase;
          console.log('✅ Using existing Supabase client:', !!supabase);
          console.log('Supabase methods:', {
            from: typeof supabase?.from,
            auth: !!supabase?.auth
          });
          resolve(supabase);
        } else if (window.supabase && typeof window.supabase.createClient === 'function') {
          // Original method - create new client
          supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
          console.log('✅ Supabase client created:', !!supabase);
          resolve(supabase);
        } else if (window.supabase && window.supabase.default && typeof window.supabase.default.createClient === 'function') {
          // Try accessing via default export
          supabase = window.supabase.default.createClient(SUPABASE_URL, SUPABASE_KEY);
          console.log('✅ Supabase client created via default:', !!supabase);
          resolve(supabase);
        } else if (typeof Supabase !== 'undefined' && typeof Supabase.createClient === 'function') {
          // Try global Supabase
          supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
          console.log('✅ Supabase client created via global:', !!supabase);
          resolve(supabase);
        } else {
          console.error('❌ Supabase library not available');
          console.log('window.supabase:', window.supabase);
          console.log('Available properties:', window.supabase ? Object.keys(window.supabase) : 'none');
          supabase = null;
          resolve(null);
        }
      } catch (error) {
        console.error('❌ Supabase initialization error:', error);
        supabase = null;
        resolve(null);
      }
    }, 200); // Reduced delay since library is already loaded
  });
}

// Initialize Supabase
supabaseInitPromise = initializeSupabase();

// Test network connectivity to Supabase
fetch(SUPABASE_URL + '/rest/v1/', {
  method: 'GET',
  headers: {
    'apikey': SUPABASE_KEY,
    'Content-Type': 'application/json'
  }
}).then(response => {
  if (response.ok) {
    console.log('✅ Supabase network connectivity confirmed');
  } else {
    console.error('❌ Supabase network error:', response.status, response.statusText);
  }
}).catch(error => {
  console.error('❌ Supabase network test failed:', error);
});

// Fallback: If Supabase fails to initialize after 5 seconds, show user message
setTimeout(() => {
  supabaseInitPromise.then(client => {
    if (!client) {
      console.error('❌ Supabase failed to initialize after 5 seconds');
      showToast('Database connection failed. Some features may not work properly.', 'error');
    }
  });
}, 5000);

// Optional webhook to send seller notification emails when an order is placed.
// Set this to your serverless function / backend endpoint URL to enable emails.
// Example: const ORDER_EMAIL_WEBHOOK = 'https://your-cloud-function/send-order-email';
const ORDER_EMAIL_WEBHOOK = 'https://parampara-emails-dbde4wnih-shrutikumbhar-9665s-projects.vercel.app/api/send-order-email';

async function notifyBuyer({ orderId, buyerEmail, sellerName, items, total, itemsCount, checkoutData }) {
  try {
    if (!ORDER_EMAIL_WEBHOOK) return; // no-op if not configured
    await fetch(ORDER_EMAIL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'buyer_confirmation',
        orderId,
        buyerEmail,
        sellerName: sellerName || 'Parampara Seller',
        total,
        itemsCount,
        items: items.map(it => ({ name: it.product_name, qty: Number(it.qty)||1, price: Number(it.price)||0, image: it.image || null })),
        checkout: checkoutData && {
          name: [checkoutData.firstName, checkoutData.lastName].filter(Boolean).join(' '),
          email: checkoutData.email || null,
          phone: checkoutData.phone || null,
          address: [checkoutData.address, checkoutData.city, checkoutData.state, checkoutData.postalCode, checkoutData.country].filter(Boolean).join(', ')
        }
      })
    });
  } catch (e) {
    console.warn('notifyBuyer failed (non-blocking):', e);
  }
}

async function notifySeller({ orderId, sellerUserId, buyerUserId, items, total, itemsCount }) {
  try {
    if (!ORDER_EMAIL_WEBHOOK) return; // no-op if not configured
    await supabaseInitPromise;
    const buyerSession = await supabase.auth.getSession();
    const buyerEmail = buyerSession?.data?.session?.user?.email || null;
    // Try to attach lightweight checkout data if present (non-sensitive)
    let checkoutData = null;
    try { checkoutData = JSON.parse(sessionStorage.getItem('checkoutData') || 'null'); } catch {}
    await fetch(ORDER_EMAIL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'seller_notification',
        orderId,
        sellerUserId,
        buyerUserId,
        buyerEmail,
        total,
        itemsCount,
        items: items.map(it => ({ name: it.product_name, qty: Number(it.qty)||1, price: Number(it.price)||0, image: it.image || null })),
        checkout: checkoutData && {
          name: [checkoutData.firstName, checkoutData.lastName].filter(Boolean).join(' '),
          email: checkoutData.email || null,
          phone: checkoutData.phone || null,
          address: [checkoutData.address, checkoutData.city, checkoutData.state, checkoutData.postalCode, checkoutData.country].filter(Boolean).join(', ')
        }
      })
    });
  } catch (e) {
    console.warn('notifySeller failed (non-blocking):', e);
  }
}

// Cart helpers using Supabase (with localStorage fallback for guests)
async function getCurrentUser() {
  await supabaseInitPromise;
  if (!supabase) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  } catch {
    return null;
  }
}
// Make available on window for any inline handlers or other scripts
window.getCurrentUser = getCurrentUser;

async function addToCart(name, price, image, sellerUserId = null, productId = null) {
  const user = await getCurrentUser();
  const numericPrice = Number(String(price).replace(/[^0-9.]/g, '')) || 0;
  if (!user || !supabase) {
    // Enforce auth: do not add for guests
    throw new Error('AUTH_REQUIRED');
  }
  
  // If seller info not provided, try to find it
  if (!sellerUserId || !productId) {
    try {
      await supabaseInitPromise;
      const { data: product } = await supabase
        .from('seller_products')
        .select('seller_user_id, id')
        .ilike('name', name)
        .limit(1)
        .maybeSingle();
      if (product) {
        sellerUserId = sellerUserId || product.seller_user_id;
        productId = productId || product.id;
      }
    } catch (e) {
      console.warn('Could not fetch seller info for cart:', e);
    }
  }
  
  try {
    await supabaseInitPromise;
    const { data: existing, error: fetchErr } = await supabase
      .from('cart_items')
      .select('id, qty')
      .eq('user_id', user.id)
      .eq('product_name', name)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (existing) {
      const { error: updErr } = await supabase
        .from('cart_items')
        .update({ 
          qty: (existing.qty || 1) + 1, 
          price: numericPrice, 
          image,
          seller_user_id: sellerUserId,
          product_id: productId
        })
        .eq('id', existing.id);
      if (updErr) throw updErr;
    } else {
      const { error: insErr } = await supabase
        .from('cart_items')
        .insert({ 
          user_id: user.id, 
          product_name: name, 
          price: numericPrice, 
          image, 
          qty: 1,
          seller_user_id: sellerUserId,
          product_id: productId
        });
      if (insErr) throw insErr;
    }
    return { source: 'supabase', ok: true };
  } catch (e) {
    console.error('addToCart supabase error', e);
    throw e;
  }
}

async function fetchCartItems() {
  const user = await getCurrentUser();
  if (!user || !supabase) {
    throw new Error('AUTH_REQUIRED');
  }
  try {
    await supabaseInitPromise;
    const { data, error } = await supabase
      .from('cart_items')
      .select('id, product_name, price, image, qty, seller_user_id, product_id')
      .eq('user_id', user.id);
    if (error) throw error;
    const items = (data || []).map(r => ({ 
      id: r.id, 
      name: r.product_name, 
      price: Number(r.price) || 0, 
      image: r.image, 
      qty: r.qty || 1,
      seller_user_id: r.seller_user_id,
      product_id: r.product_id
    }));
    return { source: 'supabase', items };
  } catch (e) {
    console.error('fetchCartItems supabase error', e);
    throw e;
  }
}

async function updateCartQty(name, qty) {
  const user = await getCurrentUser();
  if (!user || !supabase) {
    throw new Error('AUTH_REQUIRED');
  }
  try {
    await supabaseInitPromise;
    const { data: existing, error } = await supabase
      .from('cart_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_name', name)
      .maybeSingle();
    if (error) throw error;
    if (!existing) return { source: 'supabase', ok: false };
    const { error: updErr } = await supabase
      .from('cart_items')
      .update({ qty })
      .eq('id', existing.id);
    if (updErr) throw updErr;
    return { source: 'supabase', ok: true };
  } catch (e) {
    console.error('updateCartQty error', e);
    return { source: 'supabase', ok: false };
  }
}

async function removeFromCart(name) {
  const user = await getCurrentUser();
  if (!user || !supabase) {
    throw new Error('AUTH_REQUIRED');
  }
  try {
    await supabaseInitPromise;
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_name', name);
    if (error) throw error;
    return { source: 'supabase', ok: true };
  } catch (e) {
    console.error('removeFromCart error', e);
    return { source: 'supabase', ok: false };
  }
}

// -------------------------------
// Toast helpers (replaces alert())
// -------------------------------
function ensureToastContainer() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type = 'info', duration = 2500) {
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const iconHtml = type === 'success' ? '<i class="fa-solid fa-circle-check"></i>'
                  : type === 'error'   ? '<i class="fa-solid fa-circle-xmark"></i>'
                  : '<i class="fa-solid fa-circle-info"></i>';
  toast.innerHTML = `
    <span class="icon">${iconHtml}</span>
    <span class="message">${message}</span>
    <button class="close-btn" aria-label="Close">×</button>
  `;
  container.appendChild(toast);

  const remove = () => {
    if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
  };
  toast.querySelector('.close-btn').addEventListener('click', remove);
  setTimeout(remove, duration);
}

// -------------------------------
// Auth UI helper
// -------------------------------
async function updateAuthUI() {
  try {
    await supabaseInitPromise;
    if (!supabase || !supabase.auth) {
      console.warn('[AuthUI] Supabase not available');
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    console.debug('[AuthUI] session present?', !!session);

    const logoutBtn = document.getElementById("logoutBtn");
    const userNameEl = document.getElementById("userName");
    const userNameTextEl = document.getElementById("userNameText");
    const loginLink = document.querySelector('a.Login.border');
    const signupLink = document.querySelector('a.Signup.border');
    const page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const isIndex = page === '' || page === 'index.html';

    // Helper to ensure/remove a simple profile dropdown under #userName
    const ensureUserMenu = () => {
      const holder = document.getElementById('userName');
      if (!holder) return null;
      let menu = document.getElementById('userMenu');
      if (!menu) {
        menu = document.createElement('div');
        menu.id = 'userMenu';
        menu.className = 'user-menu';
        menu.style.display = 'none';
        // ensure container is positioned for absolute dropdown
        holder.style.position = holder.style.position || 'relative';
        holder.appendChild(menu);
        // toggle dropdown on pill click
        if (!window.__userMenuBound) {
          window.__userMenuBound = true;
          holder.addEventListener('click', (e) => {
            e.stopPropagation();
            const m = document.getElementById('userMenu');
            if (!m) return;
            m.style.display = (m.style.display === 'none' || !m.style.display) ? 'block' : 'none';
          });
          document.addEventListener('click', () => { const m = document.getElementById('userMenu'); if (m) m.style.display = 'none'; });
        }
      }
      return menu;
    };
    const ensureMenuItem = (id, label, href) => {
      const menu = ensureUserMenu();
      if (!menu) return null;
      let item = menu.querySelector(`#${id}`);
      if (!item) {
        item = document.createElement('a');
        item.id = id;
        item.href = href;
        item.textContent = label;
        menu.appendChild(item);
      }
      return item;
    };
    const removeMenuItem = (id) => {
      const el = document.getElementById(id);
      if (el && el.parentNode) el.parentNode.removeChild(el);
    };

    // Helper: create or get the role pill right before logout button
    const ensureRolePill = () => {
      const nav = document.querySelector('.nav-links');
      if (!nav) return null;
      let pill = nav.querySelector('.role-pill');
      if (!pill) {
        pill = document.createElement('a');
        pill.className = 'role-pill';
        // insert before logout if present, else append to nav
        if (logoutBtn && logoutBtn.parentNode === nav) {
          nav.insertBefore(pill, logoutBtn);
        } else {
          nav.appendChild(pill);
        }
      }
      return pill;
    };
    const removeRolePill = () => {
      const pill = document.querySelector('.nav-links .role-pill');
      if (pill && pill.parentNode) pill.parentNode.removeChild(pill);
    };

    if (session) {
      // Show logout on allowed pages; username only on index
      if (logoutBtn) logoutBtn.classList.add("show");
      const meta = session.user?.user_metadata || {};
      const email = session.user?.email || "";
      const name = meta.full_name || (email ? email.split("@")[0] : "");
      if (userNameEl && userNameTextEl) {
        userNameTextEl.textContent = name;
        userNameEl.classList.add("show");
      }
      // Hide Login/Signup
      if (loginLink) loginLink.style.display = 'none';
      if (signupLink) signupLink.style.display = 'none';
      // Defensive: hide any anchors that point to login or signup
      document.querySelectorAll('a[href$="login.html"], a[href$="signup.html"]').forEach(a => {
        a.style.display = 'none';
      });

      // Determine role and render a single role pill
      let role = null; // 'admin' | 'seller' | 'seller-pending' | null
      // Admin checks via metadata or optional admins table
      try {
        const metaRole = (session.user?.user_metadata?.role || '').toLowerCase();
        const appRoles = session.user?.app_metadata?.roles || [];
        let isAdmin = metaRole === 'admin' || (Array.isArray(appRoles) && appRoles.includes('admin'));
        if (!isAdmin) {
          // optional admins table: { user_id }
          await supabaseInitPromise;
          const { data: adminRow } = await supabase
            .from('admins')
            .select('user_id')
            .eq('user_id', session.user.id)
            .maybeSingle();
          isAdmin = !!adminRow;
        }
        if (isAdmin) role = 'admin';
      } catch {}

      // Seller checks from sellers table
      let sellerRow = null;
      try {
        await supabaseInitPromise;
        const { data: sRow } = await supabase
          .from('sellers')
          .select('approved')
          .eq('user_id', session.user.id)
          .maybeSingle();
        sellerRow = sRow || null;
      } catch {}
      if (!role && sellerRow) {
        role = sellerRow.approved ? 'seller' : 'seller-pending';
      }

      // Update/Create the role pill accordingly
      if (role) {
        const pill = ensureRolePill();
        if (pill) {
          if (role === 'admin') {
            pill.textContent = 'Admin';
            pill.href = 'admin-sellers.html';
            pill.className = 'role-pill role-admin';
          } else if (role === 'seller') {
            pill.textContent = 'Seller';
            pill.href = 'seller-dashboard.html';
            pill.className = 'role-pill role-seller';
          } else if (role === 'seller-pending') {
            pill.textContent = 'Seller';
            pill.href = 'seller-dashboard.html';
            pill.className = 'role-pill role-seller-pending';
          }
        }
      } else {
        removeRolePill();
      }

      // Check if user is an approved seller and toggle 'My Products' item (unchanged)
      try {
        await supabaseInitPromise;
        const { data: seller, error } = await supabase
          .from('sellers')
          .select('approved')
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (!error && seller?.approved) {
          ensureMenuItem('menuMyProducts', 'My Products', 'seller-dashboard.html');
        } else {
          removeMenuItem('menuMyProducts');
        }
      } catch {}

      // Ensure account-related menu shortcuts
      const acct = ensureMenuItem('menuAccount', 'My Account', 'account.html');
      if (acct && !acct.__bound) {
        acct.__bound = true;
        acct.addEventListener('click', (e)=>{
          // let link work normally
        });
      }
      const ords = ensureMenuItem('menuOrders', 'Orders', 'orders.html');
      if (ords && !ords.__bound) {
        ords.__bound = true;
        ords.addEventListener('click', (e)=>{
          // let link work normally
        });
      }
    } else {
      // Hide logout and username
      if (logoutBtn) logoutBtn.classList.remove("show");
      if (userNameEl) userNameEl.classList.remove("show");
      removeRolePill();
      // Show Login/Signup
      if (loginLink) loginLink.style.display = '';
      if (signupLink) signupLink.style.display = '';
      // Defensive: show anchors to login/signup if present
      document.querySelectorAll('a[href$="login.html"], a[href$="signup.html"]').forEach(a => {
        a.style.display = '';
      });
      // Remove My Products item and hide any menu when logged out
      removeMenuItem('menuMyProducts');
      const menu = document.getElementById('userMenu');
      if (menu) menu.style.display = 'none';
    }
  } catch (e) {
    console.error("updateAuthUI error", e);
  }
}
// ---------- Static Product images1 Map ----------
const productimages1 = {
  "Rangoli Design Kit": "images1/products/rangoli.jpg",
  "Decorative Diya Set": "images1/products/diya.png",
  //ganesh chaturthi products photo//
  "Shadu Mati Ganesh Idol": "images1/products/ganesh-idol.jpg",
  "Ukadiche Modak": "images1/products/modak.png",
  "Torans": "images1/products/maharastrian toran.jpg",
  "Decorative Mandap Set": "images1/products/Decorative Mandap.jpeg",

  //eid products photo//
  "Men's Kurta Pajama": "images1/products/eid attire men.jpeg",
  "Embroidered Eid Abaya": "images1/products/eid attire women.webp",
  "Sheer Khurma Pack": "images1/products/sheer khurmaa.jpg",
  "Attar (Non-Alcoholic Perfume)": "images1/products/attar.jpg",

  "Ganesh Idol": "images1/products/ganesh-idol.jpg",
  //navratri products photo//
  "Dandiya Sticks": "images1/products/dandiyasticks.jpg",
  "Navratri Dandiya Sticks": "images1/products/dandiyasticks.jpg",
  "Decorated Dandiya Sticks": "images1/products/dandiyasticks.jpg",
  "Vibrant Lehenga-Choli": "images1/products/Vibrant Lehenga-Choli.jpg",
  "Kediyu & Dhoti (Men’s Outfit)": "images1/products/Kediyu & Dhoti (Men’s Outfit).webp",
  "Oxidized Silver Jewelry Set": "images1/products/Oxidized Silver Jewelry Set.jpg",
  //diwali products photo//
  "Diwali Diyas": "images1/products/diya1.jpg",
  "Matki": "images1/products/matki.jpg",
  "Diya": "images1/products/diya.png",
  "Saree": "images1/products/saree.png",
  "Saree2": "images1/products/saree2.png",
  "Modak": "images1/products/modak.png",
  "Lantern": "images1/products/lantern.jpg",
  "Colorful Lanterns": "images1/products/lantern.jpg",
  "Rangoli": "images1/products/rangoli.jpg",
  "Sweets": "images1/products/sweets.png",
  "Faral(Traditional Diwali Snacks and Sweets)": "images1/products/sweets.png",
  "Sample Product": "images1/placeholder.png",

  // Add more mappings as needed
  "Bandhani Saree": "images1/products/Bandhani saree.jpg",
  "Blue Pottery Vase": "images1/products/Blue Pottery Vase.png",
  "Mojari Footwear": "images1/products/Mojari Footwear.jpg",
  "Rajasthani Puppet Set (Kathputli)": "images1/products/Rajasthani Puppet Set (Kathputli).png",
  "Kasavu Saree": "images1/products/Kasavu Saree.jpg",
  "Nettipattam Wall Hanging": "images1/products/Nettipattam Wall Hanging.jpg",
  "Coconut Shell Handicrafts": "images1/products/Coconut Shell Handicrafts.jpg",
  "Kerala Mural Painting (Mini Frame)": "images1/products/Kerala Mural Painting (Mini Frame).jpg",
  "Rasgulla": "images1/products/Rasgulla.jpg",
  "Kantha Embroidery Dupatta": "images1/products/Kantha Embroidery Dupatta.jpg",
  "Bankura Terracotta Horse": "images1/products/Bankura Terracotta Horse.jpg",
  "Dokra Metal Craft": "images1/products/Dokra Metal Craft.jpg",
  "Mysore Silk Saree": "images1/products/Mysore Silk Saree.jpg",
  "Sandalwood Carving": "images1/products/Sandalwood Carving.jpg",
  "Bidriware Vase": "images1/products/Bidriware Vase.jpg",
  "Channapatna Wooden Toys": "images1/products/Channapatna Wooden Toys.jpg",
  "Tanjore Painting": "images1/products/Tanjore Painting.jpg",
  "Bronze Idol (Chola Art)": "images1/products/Bronze Idol (Chola Art).jpg",
  "Mysore Pak": "images1/products/MysorePak.jpg",
  "Kanchipuram Silk Saree": "images1/products/Kanchipuram Silk Saree.jpg",
  "Chikankari Embroidered Dupatta": "images1/products/Chikankari Embroidered Dupatta.jpg",
  "Khurja Pottery Set": "images1/products/Khurja Pottery Set.jpg",
  "Petha Sweet from Agra": "images1/products/Petha Sweet from Agra.jpg",
  "Banarasi Saree": "images1/products/Banarasi Saree.jpg",
  "Phulkari Embroidery Dupatta": "images1/products/Phulkari Embroidery Dupatta.jpg",
  "Punjabi Jutti": "images1/products/Punjabi Jutti.jpg",
  "Gajak": "images1/products/Gajak.jpg",
  "Paranda": "images1/products/Paranda.jpg",
  "Pattachitra Painting": "images1/products/Pattachitra Painting.jpg",
  "Chhena Poda": "images1/products/Chhena Poda.jpg",
  "Sambalpuri Saree": "images1/products/Sambalpuri Saree.jpg",
  "Silver Filigree Jewelry": "images1/products/Silver Filigree Jewelry.jpg",
  "Assam Silk Mekhela Chador": "images1/products/Assam Silk Mekhela Chador.jpg",
  "Jaapi (Traditional Hat)": "images1/products/Jaapi (Traditional Hat).jpg",
  "Assam Tea Pack": "images1/products/Assam Tea Pack.jpg",
  "Dokra Brass Figurine": "images1/products/Dokra Brass Figurine.jpg",
  "Kullu Shawl": "images1/products/Kullu Shawl.jpg",
  "Chamba Rumal Embroidery": "images1/products/Chamba Rumal Embroidery.jpg",
  "Apple Cider Pack": "images1/products/Apple-Cider.jpg",
  "Kinnauri Topi": "images1/products/Kinnauri Topi.jpg"
};

const festivalimages1 = {
  "Ganpati": "images1/festivals/ganpati.png",
  "Ganesh Chaturthi": "images1/festivals/ganpati.png",
  "Diwali": "images1/festivals/diwalii.png",
  "Holi": "images1/festivals/holi.png",
  "Eid": "images1/festivals/eid.png",
  "Navratri": "images1/festivals/navratri.png",
  "Gudi Padwa": "images1/festivals/gudi padwa.jpg",
  "Durga Puja": "images1/festivals/Durga Puja.jpg",
  "Andhra Ugadi": "images1/festivals/andhra-ugadi-pachadi.jpg",
  "Ugadi": "images1/festivals/andhra-ugadi-pachadi.jpg",
  "Karva Chauth": "images1/festivals/Karwa_Chauth.webp",
  "Kumbh Mela": "images1/festivals/kumb mela.webp",
  "Raksha Bandhan": "images1/festivals/raksha bandhan.webp",
  "Ram Navami": "images1/festivals/ram navmi.jpg",
  "Baisakhi": "images1/festivals/baisakhi.jpg",
  "Basant Panchami": "images1/festivals/basant-panchami.jpg",
  "Vasant Panchami": "images1/festivals/basant-panchami.jpg",
  "Bihu": "images1/festivals/bihu.webp",
  "Chhath Puja": "images1/festivals/chhath puja.jpg",
  "Christmas": "images1/festivals/Christmas-.webp",
  "Dussehra": "images1/festivals/navratri.png",
  "Guru Purnima": "images1/festivals/guru-purnima.jpg",
  "Lohri": "images1/festivals/Lohri.webp",
  "Mahashivratri": "images1/festivals/mahashivratri.webp",
  "Shivratri": "images1/festivals/shivratri.jpg",
  "Makar Sankranti": "images1/festivals/Makar Sankranti.jpg",
  "Onam": "images1/festivals/onam.jpg",
  "Pongal": "images1/festivals/pongal.jpg",
   "Janmashtami": "images1/festivals/Janmashtami.png",
    "Easter": "images1/festivals/Easter.jpg",
  // Add more mappings as needed
};
// -------------------------------
// DOM Ready
// -------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  // ----- Modal helpers -----
  let currentModalProduct = null; // holds {name, price, image}
  function ensureModal() {
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'modalOverlay';
      overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <div class="modal-header">
            <h3 id="modalTitle"></h3>
            <button class="modal-close" aria-label="Close">×</button>
          </div>
          <div class="modal-body">
            <img id="modalImg" alt="Product image" />
            <div>
              <div id="modalDesc" style="white-space:pre-wrap;color:#444"></div>
              <div id="modalPrice" style="margin-top:10px;font-weight:700;color:#e86c28"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button id="modalAddToCart" class="product-btn" type="button">Add to Cart</button>
            <button class="modal-close product-btn" type="button">Close</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', (e) => {
        if (e.target.id === 'modalOverlay' || e.target.classList.contains('modal-close')) hideModal();
        if (e.target.id === 'modalAddToCart' && currentModalProduct) {
          addToCart(currentModalProduct.name, currentModalProduct.price, currentModalProduct.image)
            .then(() => showToast('Added to cart!', 'success'))
            .catch((err) => {
              if (err && err.message === 'AUTH_REQUIRED') {
                showToast('Please log in to add items to your cart.', 'error');
                setTimeout(() => { window.location.href = 'login.html'; }, 900);
              } else {
                showToast('Could not add to cart. Try again.', 'error');
              }
            });
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hideModal();
      });
    }
    return overlay;
  }

  // Unified card renderer for both master and seller products
  function renderProductCard(product) {
    // product: { name, description, price, image_url?, _src? }
    const card = document.createElement("div");
    card.className = "diwali-featured-card";
    // Rule: Master products use frontend map; Seller products use their uploaded image only
    const mapped = getImage(productimages1, product.name);
    const imageUrl = product._src === 'seller'
      ? (product.image_url || 'images1/placeholder.png')
      : (mapped || 'images1/placeholder.png');
    card.innerHTML = `
      <img src="${imageUrl}" alt="${product.name}" onerror="this.onerror=null;this.src='images1/placeholder.png';">
      <h3>${product.name}</h3>
      <p class="price">₹${product.price}</p>
      <div class="desc">${product.description || ""}</div>
      ${product._src === 'seller' ? '<span class="badge-seller">Seller</span>' : ''}
      <button class="cart product-btn">Add to Cart</button>
    `;
    return card;
  }

  function showModal({ title, desc, price, imageUrl }) {
    const overlay = ensureModal();
    overlay.style.display = 'flex';
    overlay.querySelector('#modalTitle').textContent = title || 'Details';
    overlay.querySelector('#modalDesc').textContent = desc || 'No description available.';
    overlay.querySelector('#modalPrice').textContent = typeof price === 'number' ? `₹${price}` : (price || '');
    const img = overlay.querySelector('#modalImg');
    if (img) {
      img.src = imageUrl || 'images1/placeholder.png';
      img.onerror = () => { img.src = 'images1/placeholder.png'; };
    }
    currentModalProduct = { name: title, price: price, image: imageUrl };
  }

  function hideModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  // Festival Highlights: Show one card per festival
  async function loadFestivalHighlights() {
    const container = document.getElementById("festivalHighlightsProducts");
    if (!container) return;
    container.innerHTML = "<p>Loading festivals...</p>";
    if (!supabase) {
      // Fallback: show static highlights if Supabase not available
      container.innerHTML = "";
      const fallback = ["Diwali", "Holi", "Eid", "Navratri", "Ganesh Chaturthi"]; 
      fallback.forEach(name => {
        const img = getImage(festivalimages1, name);
        const card = document.createElement("div");
        card.className = "festival-product-card";
        card.innerHTML = `
          <img src="${img}" alt="${name}">
          <h3>${name}</h3>
          <div class="desc"></div>
          <button class="shop-btn" onclick="window.location.href='shop-fest.html'">Shop Now</button>
        `;
        container.appendChild(card);
      });
      return;
    }
    await supabaseInitPromise;
    if (!supabase || typeof supabase.from !== 'function') {
      console.error('Supabase not available in loadFestivalHighlights');
      // Fallback to static highlights
      container.innerHTML = "";
      const fallback = ["Diwali", "Holi", "Eid", "Navratri", "Ganesh Chaturthi"]; 
      fallback.forEach(name => {
        const img = getImage(festivalimages1, name);
        const card = document.createElement("div");
        card.className = "festival-product-card";
        card.innerHTML = `
          <img src="${img}" alt="${name}">
          <h3>${name}</h3>
          <div class="desc"></div>
          <button class="shop-btn" onclick="window.location.href='shop-fest.html'">Shop Now</button>
        `;
        container.appendChild(card);
      });
      return;
    }
    const { data, error } = await supabase.from("festivals").select("*");
    if (error || !data) {
      // Fallback to static highlights
      container.innerHTML = "";
      const fallback = ["Diwali", "Holi", "Eid", "Navratri", "Ganesh Chaturthi"]; 
      fallback.forEach(name => {
        const img = getImage(festivalimages1, name);
        const card = document.createElement("div");
        card.className = "festival-product-card";
        card.innerHTML = `
          <img src="${img}" alt="${name}">
          <h3>${name}</h3>
          <div class="desc"></div>
          <button class="shop-btn" onclick="window.location.href='shop-fest.html'">Shop Now</button>
        `;
        container.appendChild(card);
      });
      return;
    }
    if (data.length === 0) {
      // Fallback to static highlights
      container.innerHTML = "";
      const fallback = ["Diwali", "Holi", "Eid", "Navratri", "Ganesh Chaturthi"]; 
      fallback.forEach(name => {
        const img = getImage(festivalimages1, name);
        const card = document.createElement("div");
        card.className = "festival-product-card";
        card.innerHTML = `
          <img src="${img}" alt="${name}">
          <h3>${name}</h3>
          <div class="desc"></div>
          <button class="shop-btn" onclick="window.location.href='shop-fest.html'">Shop Now</button>
        `;
        container.appendChild(card);
      });
      return;
    }
    container.innerHTML = "";
    
    // Sort festivals by month for chronological display
    const sortedFestivals = data.sort((a, b) => {
      // Extract month from festival data or use default mapping
      const getMonthNumber = (festivalName) => {
        const monthMap = {
          'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5,
          'June': 6, 'July': 7, 'August': 8, 'September': 9, 'October': 10,
          'November': 11, 'December': 12
        };
        
        // Check if festival name contains month references
        for (const [month, num] of Object.entries(monthMap)) {
          if (festivalName.toLowerCase().includes(month.toLowerCase())) {
            return num;
          }
        }
        
        // Specific festival month mappings
        const festivalMonthMap = {
          'Makar Sankranti': 1, 'Pongal': 1, 'Lohri': 1,
          'Vasant Panchami': 2, 'Maha Shivratri': 2, 'Shivratri': 2,
          'Holi': 3, 'Gudi Padwa': 3, 'Ugadi': 3, 'Andhra Ugadi': 3,
          'Ram Navami': 4, 'Baisakhi': 4, 'Eid': 4, 'Bihu': 4,
          'Easter': 4, 'Janmashtami': 4,
          'Guru Purnima': 7, 'Raksha Bandhan': 7, 'Karva Chauth': 7, 'Karwa Chauth': 7,
          'Ganpati': 8, 'Ganesh Chaturthi': 8, 'Navratri': 9, 'Durga Puja': 9,
          'Dussehra': 10, 'Kumbh Mela': 11, 'Diwali': 11, 'Chhath Puja': 11,
          'Onam': 11, 'Christmas': 12, 'New Year': 1
        };
        
        return festivalMonthMap[festivalName] || 6; // Default to June if not found
      };
      
      const monthA = getMonthNumber(a.name);
      const monthB = getMonthNumber(b.name);
      
      if (monthA !== monthB) {
        return monthA - monthB;
      }
      
      // If same month, sort alphabetically
      return a.name.localeCompare(b.name);
    });

    sortedFestivals.forEach(fest => {
      const imageUrl = getImage(festivalimages1, fest.name);
      const card = document.createElement("div");
      card.className = "festival-product-card";
      card.innerHTML = `
        <img src="${imageUrl}" alt="${fest.name}">
        <h3>${fest.name}</h3>
        <div class="desc">${fest.description || ""}</div>
        <button class="shop-btn" onclick="window.location.href='shop-fest-products.html?festival=${fest.id}'">Shop Now</button>
      `;
      container.appendChild(card);
    });
  }

async function placeOrder() {
  const buyer = await getCurrentUser();
  if (!buyer || !supabase) { showToast('Please log in to checkout.', 'error'); return; }
  if (typeof navigator !== 'undefined' && navigator && navigator.onLine === false) {
    showToast('You appear to be offline. Please reconnect and try again.', 'error');
    return;
  }
  try {
    let rows = [];
    try {
      await supabaseInitPromise;
      const { data, error } = await supabase
        .from('cart_items')
        .select('product_name, price, image, qty, product_id, seller_user_id')
        .eq('user_id', buyer.id);
      if (error) throw error;
      rows = data || [];
    } catch (err) {
      await supabaseInitPromise;
      const { data, error } = await supabase
        .from('cart_items')
        .select('product_name, price, image, qty')
        .eq('user_id', buyer.id);
      if (error) throw error;
      rows = data || [];
    }
    if (!rows.length) { showToast('Your cart is empty.', 'error'); return; }

    let fallbackSellerId = null;
    try {
      await supabaseInitPromise;
      const { data: srow } = await supabase
        .from('sellers')
        .select('user_id')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      fallbackSellerId = srow?.user_id || null;
    } catch {}
    const withSeller = [];
    for (const r of rows) {
      let sellerId = r.seller_user_id || null;
      let productId = r.product_id || null;
      if (!sellerId || !productId) {
        try {
          await supabaseInitPromise;
          const { data: sp } = await supabase
            .from('seller_products')
            .select('id, seller_user_id')
            .ilike('name', r.product_name)
            .limit(1)
            .maybeSingle();
          if (sp) { sellerId = sellerId || sp.seller_user_id; productId = productId || sp.id; }
        } catch {}
      }
      if (!sellerId && fallbackSellerId) sellerId = fallbackSellerId;
      withSeller.push({ ...r, seller_user_id: sellerId, product_id: productId });
    }

    const groups = new Map();
    for (const it of withSeller) {
      const key = it.seller_user_id || 'unknown';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(it);
    }
    let checkoutData = null;
    try { checkoutData = JSON.parse(sessionStorage.getItem('checkoutData') || 'null'); } catch {}
    let createdAny = false;
    for (const [sellerId, items] of groups.entries()) {
      if (!sellerId || sellerId === 'unknown') continue;
      const total = items.reduce((s, it) => s + (Number(it.price)||0) * (Number(it.qty)||1), 0);
      const itemsCount = items.reduce((s, it) => s + (Number(it.qty)||1), 0);
      let shipping = null;
      try { shipping = JSON.parse(sessionStorage.getItem('checkoutData') || 'null'); } catch {}
      const shippingAddress = shipping ? [shipping.address, shipping.city, shipping.state, shipping.postalCode, shipping.country].filter(Boolean).join(', ') : null;
      const paymentMethod = shipping ? shipping.paymentMethod || null : null;
      const orderNotes = shipping ? shipping.orderNotes || null : null;
      await supabaseInitPromise;
      const { data: order, error: ordErr } = await supabase
        .from('orders')
        .insert({
          user_id: buyer.id,
          seller_user_id: sellerId,
          buyer_user_id: buyer.id,
          total,
          total_amount: total,
          items_count: itemsCount,
          status: 'pending',
          shipping_address: shippingAddress ? { address: shippingAddress } : null,
          payment_method: paymentMethod,
          order_notes: orderNotes
        })
        .select('id')
        .single();
      if (ordErr || !order) { showToast('Could not create order: ' + (ordErr?.message || 'Unknown error'), 'error'); return; }
      const orderId = order.id;
      const payload = items.map(it => ({
        order_id: orderId,
        product_id: it.product_id || null,
        product_name: it.product_name,
        quantity: Number(it.qty)||1,
        price: Number(it.price)||0,
        image: it.image || null
      }));
      await supabaseInitPromise;
      const { error: itErr } = await supabase.from('order_items').insert(payload);
      if (itErr) { showToast('Could not add order items: ' + (itErr.message || 'Unknown error'), 'error'); return false; }
      // Persist buyer shipping details (if provided during checkout)
      try {
        let shipping = null;
        try { shipping = JSON.parse(sessionStorage.getItem('checkoutData') || 'null'); } catch {}
        if (shipping) {
          const name = [shipping.firstName, shipping.lastName].filter(Boolean).join(' ');
          const address_full = [shipping.address, shipping.city, shipping.state, shipping.postalCode, shipping.country].filter(Boolean).join(', ');
          await supabaseInitPromise;
          await supabase.from('order_shipping').insert({
            order_id: orderId,
            buyer_user_id: buyer.id,
            name,
            email: shipping.email || null,
            phone: shipping.phone || null,
            address: address_full
          });
        }
      } catch (e) {
        console.warn('order_shipping insert failed:', e);
      }
      // Create seller notification (DB-backed)
      try {
        await supabaseInitPromise;
        await supabase.from('seller_notifications').insert({
          seller_user_id: sellerId,
          order_id: orderId,
          buyer_user_id: buyer.id,
          items_count: itemsCount,
          total_amount: total,
          type: 'new_order',
          read: false
        });
      } catch (e) {
        console.warn('seller_notifications insert failed:', e);
      }
      // Best-effort seller notification (does not block order placement)
      const buyerEmail = buyer.email || (checkoutData ? checkoutData.email : null);
      if (buyerEmail) {
        notifyBuyer({ orderId, buyerEmail, sellerName: 'Parampara Seller', items, total, itemsCount, checkoutData });
      }
      notifySeller({ orderId, sellerUserId: sellerId, buyerUserId: buyer.id, items, total, itemsCount });
      createdAny = true;
    }
    if (createdAny) {
      await clearCart();
      await refreshCartBadge();
      showToast('Order placed successfully!', 'success');
      return true;
    } else {
      showToast('No valid items to order.', 'error');
      return false;
    }
  } catch (err) {
    console.error('placeOrder error', err);
    showToast('Could not place order: ' + (err?.message || 'Unknown error'), 'error');
    return false;
  }
}
// Expose globally for inline/onsubmit usage
if (typeof window !== 'undefined') {
  window.placeOrder = placeOrder;
}
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const name = contactForm.querySelector("input[placeholder='Your Name']")?.value?.trim();
      const email = contactForm.querySelector("input[placeholder='Your Email']")?.value?.trim();
      const message = contactForm.querySelector("textarea[placeholder='Your Message']")?.value?.trim();
      if (!name || !email || !message) { showToast('Please fill in all fields.', 'error'); return; }
      if (!supabase) { showToast('Service unavailable. Try again later.', 'error'); return; }
      btn && (btn.disabled = true);
      try {
        const user = await getCurrentUser();
        await supabaseInitPromise;
        const { error } = await supabase.from('contact_messages').insert({
          name,
          email,
          message,
          user_id: user ? user.id : null
        });
        if (error) {
          showToast('Could not send message: ' + error.message, 'error');
        } else {
          showToast('Message sent. We will get back to you soon.', 'success');
          contactForm.reset();
        }
      } catch (err) {
        showToast('Something went wrong. Please try again.', 'error');
      } finally {
        btn && (btn.disabled = false);
      }
    });
  }

  // Load festival highlights on index.html
  if (document.getElementById("festivalHighlightsProducts")) {
    await loadFestivalHighlights();
  }
  // Update auth UI on load
  await updateAuthUI();
  // Update cart badge on load
  await refreshCartBadge();
  // Retry a couple of times in case storage initializes late after redirect
  setTimeout(updateAuthUI, 400);
  setTimeout(updateAuthUI, 1200);
  // Listen to auth state changes once
  await supabaseInitPromise;
  if (supabase && supabase.auth && !window.__authListenerBound) {
    window.__authListenerBound = true;
    supabase.auth.onAuthStateChange(() => {
      updateAuthUI();
      refreshCartBadge();
    });
  }
  // ---------- Navbar Active Link ----------
  const currentPage = window.location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach(link => {
    if (link.getAttribute("href") === currentPage) link.classList.add("active-page");
  });

  // ---------- Search Bar (term + category) ----------
  (function bindSearchBar() {
    const input = document.getElementById('searchInput') || document.querySelector('.search-bar');
    const category = document.getElementById('category');
    const icon = document.querySelector('.search-icon');
    const resultsContainer = document.getElementById('productsContainer');

    if (!input) return; // search bar not on this page

    async function render(products) {
      const container = resultsContainer || document.getElementById('featured-products');
      if (!container) return;
      container.innerHTML = '';
      if (!products || products.length === 0) {
        container.innerHTML = '<p>No products found</p>';
        return;
      }
      for (const p of products) {
        const mapped = getImage(productimages1, p.name);
        const imageUrl = (mapped && !/placeholder\.png$/i.test(mapped))
          ? mapped
          : (p.image_url || 'images1/placeholder.png');
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <img src="${imageUrl}" alt="${p.name}" onerror="this.onerror=null;this.src='images1/placeholder.png';">
          <h3>${p.name}</h3>
          <p class="price">₹${p.price}</p>
          <div class="buttons">
            <button class="details product-btn" data-name="${p.name.replace(/"/g, '&quot;')}" 
                    data-price="${p.price}" 
                    data-image="${imageUrl}"
                    data-description="${(p.description || 'No description available').replace(/"/g, '&quot;')}">
              View Details
            </button>
            <button class="cart product-btn">Add to Cart</button>
          </div>
        `;
        container.appendChild(card);
      }
      
      // Add event listeners for view details buttons
      container.querySelectorAll('.details').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const card = e.target.closest('.product-card');
          const name = e.target.dataset.name;
          const price = e.target.dataset.price;
          const image = e.target.dataset.image;
          const description = e.target.dataset.description;
          showModal({
            title: name,
            price: price,
            imageUrl: image,
            desc: description
          });
        });
      });
    }

    async function executeSearch(term, catVal) {
      try {
        await supabaseInitPromise;
      let q1 = supabase.from('master_products').select('*').ilike('name', `%${term}%`);
        if (catVal !== 'All') q1 = q1.eq('category', catVal);
        let q2 = supabase.from('seller_products').select('*').ilike('name', `%${term}%`);
        if (catVal !== 'All') q2 = q2.eq('category', catVal);
        // Festival Specials
        // Use select('*') to avoid 400 if some columns don't exist; do not filter by category if column may not exist
        let q3 = supabase.from('festival_products').select('*').ilike('name', `%${term}%`);
        const [
          { data: core, error: e1 },
          { data: seller, error: e2 },
          { data: fest, error: e3 }
        ] = await Promise.all([q1, q2, q3]);
        if (e1 || e2 || e3) console.error('Search error', e1 || e2 || e3);
        const merged = [
          ...(Array.isArray(core)?core:[]),
          ...(Array.isArray(seller)?seller:[]),
          ...(Array.isArray(fest)?fest.map(p=>({ ...p, _src:'festival' })):[])
        ];
        await render(merged);
      } catch (err) {
        console.error('Search exception', err);
        await render([]);
      }
    }

    async function runSearch() {
      const term = (input.value || '').trim();
      const catVal = (category && category.value) ? category.value : 'All';
      if (!term) { await showProducts(); return; }
      // If we're not already on a results page, redirect with query params
      if (!resultsContainer) {
        const url = `search-results.html?q=${encodeURIComponent(term)}&cat=${encodeURIComponent(catVal)}`;
        window.location.href = url;
        return;
      }
      await executeSearch(term, catVal);
    }

    input.addEventListener('input', runSearch);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') runSearch(); });
    if (icon) {
      icon.addEventListener('click', runSearch);
      icon.addEventListener('pointerdown', (e) => { e.preventDefault(); runSearch(); });
      icon.addEventListener('touchstart', (e) => { e.preventDefault(); runSearch(); }, { passive: false });
      // Ensure clicks on inner elements also trigger search
      document.addEventListener('click', (e) => {
        if (e.target.closest && e.target.closest('.search-icon')) {
          runSearch();
        }
      });
    }

    // If we're on the results page, auto-run a search from URL params
    try {
      if (resultsContainer) {
        const params = new URLSearchParams(window.location.search);
        const q = (params.get('q') || '').trim();
        const cat = params.get('cat') || 'All';
        if (q) {
          input.value = q;
          if (category) category.value = cat;
          executeSearch(q, cat);
        }
      }
    } catch {}
  })();

  // ---------- Forms ----------
  // Logout handler for navbar
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await supabaseInitPromise;
      await supabase.auth.signOut();
      localStorage.removeItem("sb-user");
      showToast("Logged out!", "success");
      setTimeout(() => { window.location.href = "login.html"; }, 900);
    });
  }
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = loginForm.querySelector("input[placeholder='Email']")?.value;
      const password = loginForm.querySelector("input[placeholder='Password']")?.value;

      if (!email || !password) {
        showToast("Please enter both email and password.", "error");
        return;
      }

      await supabaseInitPromise;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        showToast("Login failed: " + error.message, "error");
      } else {
        showToast("Login successful!", "success");
        localStorage.setItem("sb-user", JSON.stringify(data.session));
        setTimeout(() => { window.location.href = "index.html"; }, 900); // redirect after login
      }
    });
  }

  const guestLink = document.querySelector('a.guest-link');
  if (guestLink) {
    guestLink.addEventListener('click', async (e) => {
      e.preventDefault();
      await supabaseInitPromise;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'shrutikrishna2624@gmail.com',
        password: 'snehal1234'
      });
      if (error) {
        showToast('Guest login failed: ' + error.message, 'error');
      } else {
        showToast('Logged in as guest', 'success');
        localStorage.setItem('sb-user', JSON.stringify(data.session));
        setTimeout(() => { window.location.href = 'index.html'; }, 900);
      }
    });
  }

  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = signupForm.querySelector("input[placeholder='Full Name']")?.value;
      const email = signupForm.querySelector("input[placeholder='Email']")?.value;
      const password = signupForm.querySelector("input[placeholder='Password']")?.value;
      const confirmPassword = signupForm.querySelector("input[placeholder='Confirm Password']")?.value;

      if (!name || !email || !password || !confirmPassword) {
        showToast("Please fill in all fields.", "error");
        return;
      }
      if (password !== confirmPassword) {
        showToast("Passwords don’t match!", "error");
        return;
      }

      await supabaseInitPromise;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });

      if (error) {
        showToast("Signup failed: " + error.message, "error");
      } else {
        showToast("Signup successful! Check your email to confirm.", "success");
        setTimeout(() => { window.location.href = "login.html"; }, 900);
      }
    });
  }

  // ---------- Footer Smooth Scroll ----------
  const footerLinks = document.querySelectorAll(".footer a[href^='#']");
  footerLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const target = document.getElementById(link.getAttribute("href").substring(1));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  // ---------- States ----------
  const states = [
    "Maharashtra","Kerala","Rajasthan","Gujarat","West Bengal",
    "Karnataka","Tamil Nadu","Uttar Pradesh","Punjab","Odisha",
    "Assam","Himachal Pradesh"
  ];

  // ---------- Demo credentials copy buttons (login.html) ----------
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy-cred');
    if (!btn) return;
    const fallback = (text) => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text || '';
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        return true;
      } catch {
        return false;
      }
    };
    let text = btn.dataset.value || '';
    if (!text) {
      const code = btn.parentElement?.querySelector('code');
      text = code?.textContent?.trim() || '';
    }
    if (!text) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ok = fallback(text);
        if (!ok) throw new Error('fallback_failed');
      }
      showToast('Copied to clipboard', 'success');
    } catch (err) {
      showToast('Could not copy. Please copy manually.', 'error');
    }
  });

  // ---------- Click Handlers ----------
  document.addEventListener("click", async e => {
    if (e.target.classList.contains("details")) {
      // Prefer data attributes from the button if present (search results path)
      const btn = e.target;
      const dataName = btn.dataset?.name;
      if (dataName) {
        showModal({
          title: dataName,
          desc: btn.dataset?.description || 'No description available.',
          price: Number(btn.dataset?.price) || btn.dataset?.price || '',
          imageUrl: btn.dataset?.image || 'images1/placeholder.png'
        });
        return;
      }

      // Fallback: infer from card and query known tables safely
      const card = e.target.closest(".product-card, .card, .diwali-featured-card, .festival-product-card");
      const name = card?.querySelector("h3")?.textContent?.trim();
      if (!name) {
        showToast("Could not determine product name.", "error");
        return;
      }
      if (!supabase) {
        // Still show modal with minimal info if offline
        const img = card.querySelector('img')?.getAttribute('src') || getImage(productimages1, name);
        const priceText = card.querySelector('.price')?.textContent || '';
        showModal({ title: name, desc: 'No description available.', price: priceText, imageUrl: img });
        return;
      }
      try {
        // Try master_products, seller_products, festival_products in parallel
      await supabaseInitPromise;
        const [m, s, f] = await Promise.all([
          supabase.from('master_products').select('name, description, price').ilike('name', name).limit(1).maybeSingle(),
          supabase.from('seller_products').select('name, description, price, image_url').ilike('name', name).limit(1).maybeSingle(),
          supabase.from('festival_products').select('name, description, price, image_url').ilike('name', name).limit(1).maybeSingle()
        ]);
        const row = m.data || s.data || f.data || null;
        if (!row) {
          console.error('Details fetch error:', (m.error || s.error || f.error));
          showToast("Details not available for this product yet.", "error");
          return;
        }
        const desc = row.description || 'No description available.';
        const mappedImg = getImage(productimages1, row.name || name);
        const img = (row.image_url) || mappedImg || 'images1/placeholder.png';
        showModal({ title: row.name || name, desc, price: row.price, imageUrl: img });
      } catch (err) {
        console.error('View details exception:', err);
        showToast("Something went wrong fetching details.", "error");
      }
      return;
    }
    // Note: do not handle .cart here; a dedicated handler below manages auth-only add-to-cart.
    const card = e.target.closest(".state-card");
    if (card) {
      const state = card.getAttribute("data-state") || card.textContent.trim();
      showToast(`You selected ${state}`, "info");
    }
  });

  // ---------- Load Festivals for index.html ----------
  if (document.getElementById("festivalCards")) await loadFestivals();

  // ---------- Load Festival Products for shop-fest-products.html ----------
  if (document.getElementById("festivalProducts")) {
    const urlParams = new URLSearchParams(window.location.search);
    await loadFestivalProducts(urlParams.get("festival"));
  }

  // ---------- Load Featured Products ----------
  await showProducts();

  // ---------- Cart Logic ----------
  // Add to Cart handler
  document.addEventListener("click", e => {
    if (e.target.classList.contains("cart")) {
      // Find product card
      const card = e.target.closest(".card, .product-card, .diwali-featured-card, .festival-product-card");
      if (!card) return;
      const name = card.querySelector("h3")?.textContent?.trim();
      const priceText = card.querySelector(".price")?.textContent || "";
      const price = priceText.replace(/[₹,]/g, "").trim();
      const image = card.querySelector("img")?.getAttribute("src");
      if (!name) return;
      addToCart(name, price, image)
        .then(() => showToast("Added to cart!", "success"))
        .then(() => refreshCartBadge())
        .catch((err) => {
          if (err && err.message === 'AUTH_REQUIRED') {
            showToast("Please log in to add items to your cart.", "error");
            setTimeout(() => { window.location.href = 'login.html'; }, 900);
          } else {
            showToast("Could not add to cart.", "error");
          }
        });
    }
  });

  // Load cart items in cart.html
  if (window.location.pathname.endsWith("cart.html")) {
    // Hard require login to access cart page
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      window.location.href = 'login.html';
      return;
    }
    const container = document.querySelector(".cart-container");
    if (!container) return;
    const renderCart = async () => {
      container.innerHTML = '';
      try {
        const { items } = await fetchCartItems();
        let total = 0;
        if (!items || items.length === 0) {
          container.innerHTML = '<div class="empty-message">Your cart is empty.</div>';
        } else {
          items.forEach(item => {
            total += (Number(item.price) || 0) * (Number(item.qty) || 1);
            container.innerHTML += `
              <div class="cart-item">
                <img src="${item.image || 'images1/placeholder.png'}" alt="${item.name}">
                <div class="cart-info">
                  <h3>${item.name}</h3>
                  <p>₹${Number(item.price) || 0}</p>
                  <div class="cart-actions">
                    <input type="number" value="${Number(item.qty) || 1}" min="1" data-name="${item.name}" class="cart-qty">
                    <button class="remove" type="button" data-name="${item.name}">Remove</button>
                  </div>
                </div>
              </div>
            `;
          });
          container.innerHTML += `
            <div class="cart-summary">
              <h3>Total: ₹${total}</h3>
              <div class="summary-actions" style="display:flex;gap:10px;flex-wrap:wrap;">
                <button class="checkout-btn" type="button">Proceed to Checkout</button>
                <button class="clear-cart" type="button">Clear Cart</button>
              </div>
            </div>
          `;
        }
      } catch (err) {
        if (err && err.message === 'AUTH_REQUIRED') {
          container.innerHTML = `
            <div class="cart-login-prompt">
              <p>Please log in to view your cart.</p>
              <button class="login-btn" type="button" onclick="window.location.href='login.html'">Log In</button>
            </div>
          `;
        } else {
          container.innerHTML = '<p>Could not load your cart right now.</p>';
        }
      }
    };

    await renderCart();

    // Remove item handler
    container.addEventListener("click", async e => {
      if (e.target.classList.contains('checkout-btn')) {
        try {
          window.location.href = 'checkout.html';
        } catch (err) {
          showToast('Checkout failed. Please try again.', 'error');
        }
        return;
      }
      if (e.target.classList.contains("remove")) {
        const name = e.target.getAttribute("data-name");
        try {
          await removeFromCart(name);
          await renderCart();
          await refreshCartBadge();
        } catch (err) {
          if (err && err.message === 'AUTH_REQUIRED') {
            showToast('Please log in to modify your cart.', 'error');
            setTimeout(() => { window.location.href = 'login.html'; }, 900);
          } else {
            showToast('Could not remove item.', 'error');
          }
        }
      }
      if (e.target.classList.contains('clear-cart')) {
        try {
          await clearCart();
          await renderCart();
          await refreshCartBadge();
          showToast('Cart cleared.', 'success');
        } catch (err) {
          if (err && err.message === 'AUTH_REQUIRED') {
            showToast('Please log in to clear your cart.', 'error');
            setTimeout(() => { window.location.href = 'login.html'; }, 900);
          } else {
            showToast('Could not clear cart.', 'error');
          }
        }
      }
    });

    // Quantity change handler
    container.addEventListener("change", async e => {
      if (e.target.classList.contains("cart-qty")) {
        const name = e.target.getAttribute("data-name");
        const qty = Math.max(1, Number(e.target.value));
        try {
          await updateCartQty(name, qty);
          await renderCart();
          await refreshCartBadge();
        } catch (err) {
          if (err && err.message === 'AUTH_REQUIRED') {
            showToast('Please log in to modify your cart.', 'error');
            setTimeout(() => { window.location.href = 'login.html'; }, 900);
          } else {
            showToast('Could not update quantity.', 'error');
          }
        }
      }
    });
  }

// -------------------------------
// Load Festivals
// -------------------------------
async function loadFestivals() {
  await supabaseInitPromise;
  const { data, error } = await supabase.from("festivals").select("*");
  const container = document.getElementById("festivalCards");
  if (!container) return;

  if (error) {
    console.error("❌ Error fetching festivals:", error);
    container.innerHTML = "<p>Failed to load festivals.</p>";
    return;
  }

  container.innerHTML = "";
  data.forEach(fest => {
    // Always use local image mapping
    const imageUrl = getImage(festivalimages1, fest.name);
    container.innerHTML += `
      <div class="card" style="cursor:pointer" onclick="window.location.href='shop-fest-products.html?festival=${encodeURIComponent(fest.id)}'">
        <img src="${imageUrl}" alt="${fest.name}">
        <h3>${fest.name}</h3>
        <p>${fest.description}</p>
        <button type="button" onclick="window.location.href='shop-fest-products.html?festival=${encodeURIComponent(fest.id)}'">
          Shop Now
        </button>
      </div>
    `;
  });
}

// -------------------------------
// Load Featured Products (Unified)
// -------------------------------
async function loadFestivalProducts(festivalId) {
  const festivalProductsContainer = document.getElementById("festivalProducts");
  const festivalTitleEl = document.getElementById("festivalTitle");
  if (!festivalProductsContainer || !festivalTitleEl) return;

  // Allow passing festivalId; fallback to URL param
  if (!festivalId) {
    const urlParams = new URLSearchParams(window.location.search);
    festivalId = urlParams.get("festival");
  }
  if (!festivalId) {
    festivalProductsContainer.innerHTML = "<p>No festival selected.</p>";
    return;
  }
  // Fetch festival name
  await supabaseInitPromise;
  const { data: fest, error: festErr } = await supabase
    .from('festivals')
    .select('name')
    .eq('id', festivalId)
    .maybeSingle();
  festivalTitleEl.textContent = festErr ? 'Festival' : (fest?.name || 'Festival');

  // Fetch products from master source
  await supabaseInitPromise;
  const { data: masterProds, error: mErr } = await supabase
    .from('festival_products')
    .select('name, description, price')
    .eq('festival_id', festivalId);
  const safeMaster = (!mErr && Array.isArray(masterProds)) ? masterProds : [];

  // Fetch seller-tagged products for the same festival
  await supabaseInitPromise;
  const { data: sellerProds, error: sErr } = await supabase
    .from('seller_products')
    .select('name, description, price, image_url')
    .eq('festival_id', festivalId);
  const safeSeller = (!sErr && Array.isArray(sellerProds)) ? sellerProds : [];

  const merged = [
    ...safeMaster.map(p => ({ ...p, _src: 'master' })),
    ...safeSeller.map(p => ({ name: p.name, description: p.description, price: p.price, image_url: p.image_url, _src: 'seller' }))
  ];

  festivalProductsContainer.innerHTML = '';
  merged.forEach(product => {
    const card = renderProductCard(product);
    festivalProductsContainer.appendChild(card);
  });
}
async function fetchAllProducts() {
  await supabaseInitPromise;
  if (!supabase || typeof supabase.from !== 'function') {
    console.error("Supabase client not initialized or invalid in fetchAllProducts");
    return [];
  }
  const { data, error } = await supabase.from("products").select("*");
  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  return data;
}

async function showProducts() {
  const products = await fetchAllProducts();
  const container = document.getElementById("featured-products");
  if (!container) return;

  container.innerHTML = "";

  for (const product of products) {
    // Always use local image mapping
    const imageUrl = getImage(productimages1, product.name);
    container.innerHTML += `
      <div class="product-card">
        <img src="${imageUrl}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p class="price">₹${product.price}</p>
        <div class="buttons">
          <button class="details product-btn">View Details</button>
          <button class="cart product-btn">Add to Cart</button>
        </div>
      </div>
    `;
  }
}
});


