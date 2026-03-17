/**
 * OTP Proxy Server — Ahuja Sales India
 * Handles SMS OTP via Fast2SMS. Run: node otp-server.js
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const crypto = require('crypto');
const fs = require('fs');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost',
    'http://127.0.0.1',
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/,
    'https://ahujasalesindia.com',
    'https://www.ahujasalesindia.com',
    'https://test.ahujasalesindia.com'
  ]
}));

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
    authorization: apiKey,
    route: 'q',        // Quick SMS (no DLT required for transactional OTPs)
    message: message,
    language: 'english',
    flash: '0',
    numbers: mobile
  });

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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

// Add Product Route
app.post('/api/admin/products', requireAdminToken, (req, res) => {
  try {
    const newProduct = req.body;

    // 1. Read existing parsed_data.json
    const dataPath = './parsed_data.json';
    let rawData = fs.readFileSync(dataPath, 'utf8');
    let products = JSON.parse(rawData);

    // 2. Format new product and append
    const newItem = {
      ItemID: Math.floor(Math.random() * 1000000) + 100, // random ID
      SKU: crypto.randomUUID().toUpperCase(),
      Category: newProduct.Category || 'Other',
      Type: "Added via Admin",
      SubCatergory: newProduct.Model || '',
      BrandName: "Super",
      Size: newProduct.Size || '',
      Model: newProduct.Model || '',
      SellingRate: newProduct.SellingRate || 0,
      PicName: newProduct.PicName ? newProduct.PicName.replace('https://test.ahujasalesindia.com', '') : '/Images/logo.png',
      Description: newProduct.Description || '',
      Specification: newProduct.Specification || '',
      Status: 1,
      AvailableQuantity: 100
    };

    products.push(newItem);

    // 3. Save back to parsed_data.json
    fs.writeFileSync(dataPath, JSON.stringify(products, null, 2), 'utf8');

    // 4. Run the inject script to update script.js automatically
    console.log('Injecting new product into script.js...');
    execSync('node inject_excel_data.js', { stdio: 'inherit' });

    res.json({ success: true, message: 'Product added successfully!', item: newItem });

  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, message: 'Failed to add product. ' + error.message });
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
