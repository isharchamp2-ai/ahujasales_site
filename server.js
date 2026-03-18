/**
 * OTP Proxy Server — Ahuja Sales India
 * Handles SMS OTP via Fast2SMS. Run: node otp-server.js
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const crypto = require('crypto');
// ─── GitHub API Helpers ────────────────────────────────────────────────────────
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO  = process.env.GITHUB_REPO  || 'isharchamp2-ai/ahujasales_site';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const ADMIN_FILE   = 'admin_products.json';

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

    // Send SMS
    await sendViaSMS(mobile, otp);

    console.log(`[OTP] Sent to ${mobile.slice(0, 3)}XXXXXXX${mobile.slice(-2)}`);
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

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

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
      img:         newProduct.PicName
                     ? (newProduct.PicName.startsWith('http') ? newProduct.PicName : IMG_BASE + newProduct.PicName)
                     : IMG_BASE + '/Images/logo.png',
      rating:      4.8,
      reviews:     Math.floor(Math.random() * 20 + 5),
      inStock:     true,
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


// Start Background Cleanup for OTPs
setInterval(cleanupOtps, 60 * 1000); // Check every minute

// ─── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[SERVER] Running heavily on port ${PORT}`);
  console.log(`[SERVER] 🚀 API is ready for OTP and Admin Panel.`);
  console.log(`    Send OTP:   POST http://localhost:${PORT}/api/send-otp`);
  console.log(`    Verify OTP: POST http://localhost:${PORT}/api/verify-otp\n`);
  if (!process.env.FAST2SMS_API_KEY) {
    console.warn('⚠️  WARNING: FAST2SMS_API_KEY is not set in .env! Add it before testing.\n');
  }
});
