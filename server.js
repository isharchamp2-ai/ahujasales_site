/**
 * Backend Server — Ahuja Sales India
 * Handles: OTP via Fast2SMS, Admin Panel, Order Management
 * Run: node server.js
 */

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const crypto  = require('crypto');
// ─── GitHub API Helpers ────────────────────────────────────────────────────────
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO  = process.env.GITHUB_REPO  || 'isharchamp2-ai/ahujasales_site';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const ADMIN_FILE   = 'admin_products.json';
const ORDERS_FILE  = 'orders.json';

async function getGitHubFile(path) {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;
  const res  = await fetch(url, { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' } });
  if (res.status === 404) return { content: [], sha: null };
  const data = await res.json();
  return { content: JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')), sha: data.sha };
}

async function putGitHubFile(path, content, sha, message) {
  const url  = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
  const body = { message, branch: GITHUB_BRANCH, content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64') };
  if (sha) body.sha = sha;
  const res = await fetch(url, { method: 'PUT', headers: { Authorization: `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json', Accept: 'application/vnd.github.v3+json' }, body: JSON.stringify(body) });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'GitHub API error'); }
  return res.json();
}

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors());
// Serve static site files (index.html, admin.html, etc.)
app.use(express.static(path.join(__dirname)));


// ─── In-memory store  { mobile → { otp, expiry, attempts, lastSent } } ────────
const otpStore = new Map();
const OTP_EXPIRY = 5 * 60 * 1000;   // 5 minutes
const RATE_WINDOW = 10 * 60 * 1000;  // 10 minutes
const MAX_SENDS = 3;               // max 3 OTPs per mobile per 10 minutes

// ─── Helpers ───────────────────────────────────────────────────────────────────
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cleanMobile(raw) {
  // strip spaces, dashes, +91 prefix
  let m = raw.replace(/[\s\-]/g, '');
  if (m.startsWith('+91')) m = m.slice(3);
  if (m.startsWith('91') && m.length === 12) m = m.slice(2);
  return m;
}

function isValidMobile(m) {
  return /^[6-9]\d{9}$/.test(m);  // Indian mobile: 6-9 followed by 9 digits
}

// Function to clean up expired OTPs
function cleanupOtps() {
  const now = Date.now();
  for (const [mobile, record] of otpStore.entries()) {
    if (now > record.expiry) {
      otpStore.delete(mobile);
      // console.log(`[OTP Cleanup] Removed expired OTP for ${mobile.slice(0,3)}XXXXXXX${mobile.slice(-2)}`);
    }
  }
}

// ─── Send OTP via Fast2SMS ─────────────────────────────────────────────────────
async function sendViaSMS(mobile, otp) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) throw new Error('FAST2SMS_API_KEY not set in .env');

  const message = `Your OTP for Ahuja Sales India order verification is ${otp}. Valid for 5 minutes. Do not share.`;

  const url = 'https://www.fast2sms.com/dev/bulkV2';
  const body = new URLSearchParams({
    route: 'q',        // Quick SMS (no DLT required for transactional OTPs)
    message: message,
    language: 'english',
    flash: '0',
    numbers: mobile
  });

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 
      'authorization': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded' 
    },
    body: body.toString()
  });

  const data = await resp.json();
  console.log('[Fast2SMS]', data);

  if (!data.return) {
    throw new Error(data.message || 'Fast2SMS rejected the request');
  }
  return data;
}

// ─── Routes ────────────────────────────────────────────────────────────────────

// POST /api/send-otp
app.post('/api/send-otp', async (req, res) => {
  try {
    const raw = (req.body.mobile || '').toString().trim();
    const mobile = cleanMobile(raw);

    if (!isValidMobile(mobile)) {
      return res.status(400).json({ success: false, message: 'Invalid Indian mobile number.' });
    }

    const now = Date.now();
    const record = otpStore.get(mobile) || { attempts: 0, windowStart: now };

    // Rate limiting
    if (now - record.windowStart < RATE_WINDOW) {
      if (record.attempts >= MAX_SENDS) {
        const waitMins = Math.ceil((RATE_WINDOW - (now - record.windowStart)) / 60000);
        return res.status(429).json({
          success: false,
          message: `Too many OTP requests. Please wait ${waitMins} minute(s) before retrying.`
        });
      }
    } else {
      // Reset window
      record.attempts = 0;
      record.windowStart = now;
    }

    const otp = generateOTP();

    // Store OTP
    otpStore.set(mobile, {
      otp,
      expiry: now + OTP_EXPIRY,
      attempts: record.attempts + 1,
      windowStart: record.windowStart
    });

    // ── LOCAL DEV: always log OTP to terminal ──────────────────────────────
    const isLocal = (process.env.PORT || '3001') === '3001';
    if (isLocal) {
      console.log(`\n[OTP] ✅ DEV MODE — OTP for ${mobile}: *** ${otp} ***\n`);
    }
    // ──────────────────────────────────────────────────────────────────────

    // Send SMS (non-fatal locally — if SMS fails, OTP is still in terminal)
    try {
      await sendViaSMS(mobile, otp);
      console.log(`[OTP] SMS sent to ${mobile.slice(0, 3)}XXXXXXX${mobile.slice(-2)}`);
    } catch (smsErr) {
      if (isLocal) {
        console.warn(`[OTP] SMS failed (${smsErr.message}) — use the OTP printed above for local testing.`);
      } else {
        throw smsErr; // re-throw on production so the outer catch handles it
      }
    }
    return res.json({ success: true, message: 'OTP sent successfully!' });

  } catch (err) {
    console.error('[OTP Send Error]', err.message);
    return res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
});

// POST /api/verify-otp
app.post('/api/verify-otp', (req, res) => {
  try {
    const raw = (req.body.mobile || '').toString().trim();
    const mobile = cleanMobile(raw);
    const entered = (req.body.otp || '').toString().trim();

    if (!mobile || !entered) {
      return res.status(400).json({ success: false, message: 'Mobile and OTP are required.' });
    }

    const record = otpStore.get(mobile);

    if (!record) {
      return res.json({ success: false, message: 'No OTP found. Please request a new OTP.' });
    }

    if (Date.now() > record.expiry) {
      otpStore.delete(mobile);
      return res.json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (entered !== record.otp) {
      return res.json({ success: false, message: 'Incorrect OTP. Please try again.' });
    }

    // Success — invalidate OTP immediately (one-time use)
    otpStore.delete(mobile);
    console.log(`[OTP] Verified for ${mobile.slice(0, 3)}XXXXXXX${mobile.slice(-2)}`);
    return res.json({ success: true, message: 'Mobile number verified!' });

  } catch (err) {
    console.error('[OTP Verify Error]', err.message);
    return res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ==========================================
// ADMIN DASHBOARD ROUTES
// ==========================================

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sandeep';

// Login Route
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;

  if (!ADMIN_PASSWORD) {
    return res.status(500).json({ success: false, message: 'Admin password not configured on server.' });
  }

  if (password === ADMIN_PASSWORD) {
    // Generate a simple token (in production, use JWT)
    const token = crypto.randomBytes(32).toString('hex');

    // Save to temporary memory (For full persistence use DB, fine for this scale)
    app.locals.adminToken = token;

    return res.json({ success: true, token });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid Password' });
  }
});

// Auth Middleware
function requireAdminToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  if (token !== app.locals.adminToken) {
    return res.status(403).json({ success: false, message: 'Session expired or invalid.' });
  }
  next();
}

// GET admin products (public — fetched by frontend on page load)
app.get('/api/admin-products', async (req, res) => {
  try {
    const { content } = await getGitHubFile(ADMIN_FILE);
    res.json({ success: true, products: Array.isArray(content) ? content : [] });
  } catch (err) {
    console.error('[Admin Products GET]', err.message);
    res.json({ success: true, products: [] });
  }
});

// Add Product Route — stores in GitHub, no Netlify rebuild needed
app.post('/api/admin/products', requireAdminToken, async (req, res) => {
  try {
    const newProduct = req.body;
    const { content: products, sha } = await getGitHubFile(ADMIN_FILE);

    const IMG_BASE = 'https://test.ahujasalesindia.com';
    const newItem = {
      id:          crypto.randomBytes(8).toString('hex'),
      cat:         (newProduct.Category || 'other').toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name:        `${newProduct.Model || newProduct.Category}${newProduct.Size ? ' (' + newProduct.Size + ')' : ''}`,
      desc:        newProduct.Description  || '',
      spec:        newProduct.Specification || '',
      price:       parseFloat(newProduct.SellingRate) || 0,
      quantity:    parseInt(newProduct.Quantity) || 0,
      img:         newProduct.PicName
                     ? (newProduct.PicName.startsWith('http') ? newProduct.PicName : IMG_BASE + newProduct.PicName)
                     : IMG_BASE + '/Images/logo.png',
      rating:      4.8,
      reviews:     Math.floor(Math.random() * 20 + 5),
      inStock:     (parseInt(newProduct.Quantity) || 0) > 0,
      addedAt:     new Date().toISOString()
    };

    products.push(newItem);
    await putGitHubFile(ADMIN_FILE, products, sha, `Add product: ${newItem.name}`);

    console.log(`[Admin] Product published to GitHub: ${newItem.name}`);
    res.json({ success: true, message: 'Product published! It will appear on the website within seconds.', item: newItem });

  } catch (error) {
    console.error('[Admin Products POST]', error.message);
    res.status(500).json({ success: false, message: 'Failed to publish product: ' + error.message });
  }
});


// GET admin products (protected — for admin dashboard management)
app.get('/api/admin/products', requireAdminToken, async (req, res) => {
  try {
    const { content } = await getGitHubFile(ADMIN_FILE);
    res.json({ success: true, products: Array.isArray(content) ? content : [] });
  } catch (err) {
    console.error('[Admin Products GET protected]', err.message);
    res.json({ success: true, products: [] });
  }
});

// PUT /api/admin/products/:id — update a product (protected)
app.put('/api/admin/products/:id', requireAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { content: products, sha } = await getGitHubFile(ADMIN_FILE);
    const arr = Array.isArray(products) ? products : [];
    let idx = arr.findIndex(p => String(p.id) === String(id));
    
    // If not found in overrides (e.g. hardcoded script.js product), push a new override entry
    if (idx === -1) {
        idx = arr.length;
        arr.push({ id });
    }

    const IMG_BASE = 'https://test.ahujasalesindia.com';
    // Apply updates selectively
    if (updates.name     !== undefined) arr[idx].name     = updates.name;
    if (updates.price    !== undefined) arr[idx].price    = parseFloat(updates.price) || 0;
    if (updates.quantity !== undefined) {
      arr[idx].quantity = parseInt(updates.quantity) || 0;
      arr[idx].inStock  = arr[idx].quantity > 0;
    }
    if (updates.img      !== undefined) {
      arr[idx].img = updates.img
        ? (updates.img.startsWith('http') ? updates.img : IMG_BASE + updates.img)
        : IMG_BASE + '/Images/logo.png';
    }
    if (updates.desc     !== undefined) arr[idx].desc     = updates.desc;
    if (updates.spec     !== undefined) arr[idx].spec     = updates.spec;
    arr[idx].updatedAt = new Date().toISOString();
    
    // Ensure deleted flag is removed if we are editing it back
    if (arr[idx].deleted) delete arr[idx].deleted;

    await putGitHubFile(ADMIN_FILE, arr, sha, `Update product override: ${arr[idx].name || id}`);
    console.log(`[Admin] Product override saved: ${arr[idx].name || id}`);
    res.json({ success: true, message: 'Product updated successfully.', item: arr[idx] });
  } catch (err) {
    console.error('[Admin Products PUT]', err.message);
    res.status(500).json({ success: false, message: 'Failed to update product: ' + err.message });
  }
});

// DELETE /api/admin/products/:id — delete a product (protected)
app.delete('/api/admin/products/:id', requireAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content: products, sha } = await getGitHubFile(ADMIN_FILE);
    const arr = Array.isArray(products) ? products : [];
    
    const idx = arr.findIndex(p => String(p.id) === String(id));
    if (idx !== -1) {
      // If it exists in overrides, mark it deleted (don't remove, to ensure base script.js product is also deleted)
      arr[idx].deleted = true;
    } else {
      // Create a deletion override for a hardcoded product
      arr.push({ id, deleted: true });
    }

    await putGitHubFile(ADMIN_FILE, arr, sha, `Delete product override: ${id}`);
    console.log(`[Admin] Product override (deleted) saved: ${id}`);
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    console.error('[Admin Products DELETE]', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete product: ' + err.message });
  }
});

// ==========================================
// ORDER MANAGEMENT ROUTES
// ==========================================

// POST /api/orders — customer places an order (public)
app.post('/api/orders', async (req, res) => {
  try {
    const body = req.body;
    if (!body.customer || !body.customer.name || !body.customer.mobile) {
      return res.status(400).json({ success: false, message: 'Customer name and mobile are required.' });
    }

    const { content: orders, sha } = await getGitHubFile(ORDERS_FILE);

    const orderId = 'ASI-' + Date.now().toString().slice(-8) + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();

    const newOrder = {
      id:          orderId,
      productId:   body.productId   || null,
      productName: body.productName  || 'General Enquiry',
      category:    body.category     || 'general',
      qty:         parseInt(body.qty) || 1,
      price:       parseFloat(body.price) || 0,
      totalAmount: (parseFloat(body.price) || 0) * (parseInt(body.qty) || 1),
      customer: {
        name:    body.customer.name,
        mobile:  body.customer.mobile,
        company: body.customer.company || '',
        email:   body.customer.email   || '',
        gst:     body.customer.gst     || '',
        address: body.customer.address || ''
      },
      notes:     body.notes    || '',
      flow:      body.flow     || 'buynow',
      cartItems: body.cartItems || [],
      status:    'Pending',
      placedAt:  new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const ordersArr = Array.isArray(orders) ? orders : [];
    ordersArr.unshift(newOrder); // newest first
    await putGitHubFile(ORDERS_FILE, ordersArr, sha, `New order: ${orderId}`);

    console.log(`[ORDER] New order saved: ${orderId} from ${newOrder.customer.name}`);
    return res.json({ success: true, orderId, message: 'Order placed successfully!' });

  } catch (err) {
    console.error('[ORDER POST]', err.message);
    return res.status(500).json({ success: false, message: 'Failed to save order: ' + err.message });
  }
});

// GET /api/admin/orders — admin fetches all orders (protected)
app.get('/api/admin/orders', requireAdminToken, async (req, res) => {
  try {
    const { content } = await getGitHubFile(ORDERS_FILE);
    const orders = Array.isArray(content) ? content : [];
    return res.json({ success: true, orders });
  } catch (err) {
    console.error('[ORDERS GET]', err.message);
    return res.json({ success: true, orders: [] });
  }
});

// PATCH /api/admin/orders/:id/status — admin updates order status (protected)
app.patch('/api/admin/orders/:id/status', requireAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const VALID_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const { content: orders, sha } = await getGitHubFile(ORDERS_FILE);
    const ordersArr = Array.isArray(orders) ? orders : [];
    const idx = ordersArr.findIndex(o => o.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Order not found.' });

    ordersArr[idx].status    = status;
    ordersArr[idx].updatedAt = new Date().toISOString();
    await putGitHubFile(ORDERS_FILE, ordersArr, sha, `Update order ${id} → ${status}`);

    console.log(`[ORDER] Status updated: ${id} → ${status}`);
    return res.json({ success: true, message: `Order status updated to ${status}.` });
  } catch (err) {
    console.error('[ORDERS PATCH]', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update order: ' + err.message });
  }
});

// DELETE /api/admin/orders/:id — admin deletes an order (protected)
app.delete('/api/admin/orders/:id', requireAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content: orders, sha } = await getGitHubFile(ORDERS_FILE);
    const ordersArr = Array.isArray(orders) ? orders : [];
    const filtered  = ordersArr.filter(o => o.id !== id);
    if (filtered.length === ordersArr.length) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    await putGitHubFile(ORDERS_FILE, filtered, sha, `Delete order: ${id}`);
    console.log(`[ORDER] Deleted: ${id}`);
    return res.json({ success: true, message: 'Order deleted.' });
  } catch (err) {
    console.error('[ORDERS DELETE]', err.message);
    return res.status(500).json({ success: false, message: 'Failed to delete order: ' + err.message });
  }
});

// ==========================================
// Start Background Cleanup for OTPs
setInterval(cleanupOtps, 60 * 1000); // Check every minute

// ─── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n[SERVER] 🚀 Ahuja Sales India Backend running on port ${PORT}`);
  console.log(`[SERVER]    OTP:    POST /api/send-otp | POST /api/verify-otp`);
  console.log(`[SERVER]    Orders: POST /api/orders`);
  console.log(`[SERVER]    Admin:  GET/PATCH/DELETE /api/admin/orders, POST /api/admin/products`);
  console.log(`[SERVER]    Site:   http://localhost:${PORT}\n`);
  if (!process.env.FAST2SMS_API_KEY) {
    console.warn('⚠️  WARNING: FAST2SMS_API_KEY is not set in .env! Add it before testing.\n');
  }
});
