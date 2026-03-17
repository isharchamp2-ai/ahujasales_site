/**
 * Patches sendOTP() and verifyOTP() in script.js to use the real backend proxy.
 * Run: node patch_otp.js
 */
const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, 'script.js');
let content = fs.readFileSync(scriptPath, 'utf8');

// ── Find the boundaries ─────────────────────────────────────────────────────
const sendStart   = content.indexOf('function sendOTP()');
const verifyEnd   = content.indexOf('function submitCustomerDetails(');

if (sendStart === -1 || verifyEnd === -1) {
  console.error('❌ Could not find sendOTP or submitCustomerDetails in script.js!');
  process.exit(1);
}

const oldChunk = content.substring(sendStart, verifyEnd);
console.log(`\n📌 Found OTP block: chars ${sendStart} → ${verifyEnd} (${oldChunk.length} chars)\n`);

// ── New implementation ──────────────────────────────────────────────────────
const newChunk = `function sendOTP() {
    const mobile = document.getElementById('cd_mobile').value.trim();
    const cleaned = mobile.replace(/[\\s\\-\\+]/g, '');
    if (cleaned.length < 10 || !/^[0-9]+$/.test(cleaned)) {
        showToast('Please enter a valid 10-digit mobile number.', 'error');
        return;
    }

    // Disable button immediately to prevent double-tap
    const sendBtn = document.getElementById('sendOtpBtn');
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending…';

    document.getElementById('otpStatusMsg').textContent = '';
    document.getElementById('cd_otp').value = '';

    // Call the OTP proxy server (never exposes OTP in the browser)
    fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: cleaned })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            _otpVerified = false;
            document.getElementById('otpVerifyRow').style.display = 'block';
            document.getElementById('otpVerifiedBadge').style.display = 'none';
            const msg = document.getElementById('otpStatusMsg');
            msg.textContent = 'OTP sent to your mobile number.';
            msg.style.color = '#0d47a1';
            showToast('OTP sent! Please check your SMS.', 'success');
        } else {
            showToast(data.message || 'Failed to send OTP. Please try again.', 'error');
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send OTP';
            return; // don't start countdown
        }

        // 30-second resend countdown
        let secs = 30;
        sendBtn.textContent = \`Resend (\${secs}s)\`;
        const timer = setInterval(() => {
            secs--;
            sendBtn.textContent = secs > 0 ? \`Resend (\${secs}s)\` : 'Resend OTP';
            if (secs <= 0) { clearInterval(timer); sendBtn.disabled = false; }
        }, 1000);
    })
    .catch(err => {
        console.error('OTP send error:', err);
        showToast('Could not reach OTP server. Is it running? (node otp-server.js)', 'error');
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send OTP';
    });
}

function verifyOTP() {
    const mobile  = document.getElementById('cd_mobile').value.trim().replace(/[\\s\\-\\+]/g, '');
    const entered = document.getElementById('cd_otp').value.trim();
    const msg     = document.getElementById('otpStatusMsg');

    if (!entered) {
        msg.textContent = 'Please enter the OTP received on your mobile.';
        msg.style.color = '#ef4444';
        return;
    }

    const verifyBtn = document.getElementById('verifyOtpBtn');
    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Verifying…';

    fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp: entered })
    })
    .then(r => r.json())
    .then(data => {
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Verify';
        if (data.success) {
            _otpVerified = true;
            document.getElementById('otpVerifyRow').style.display = 'none';
            document.getElementById('otpVerifiedBadge').style.display = 'flex';
            showToast('Mobile number verified!', 'success');
        } else {
            msg.textContent = data.message || 'Incorrect OTP. Please try again.';
            msg.style.color = '#ef4444';
            document.getElementById('cd_otp').value = '';
            document.getElementById('cd_otp').focus();
        }
    })
    .catch(err => {
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Verify';
        console.error('OTP verify error:', err);
        msg.textContent = 'Could not reach OTP server. Please try again.';
        msg.style.color = '#ef4444';
    });
}

`;

// ── Apply the patch ─────────────────────────────────────────────────────────
const patchedContent = content.substring(0, sendStart) + newChunk + content.substring(verifyEnd);

// Backup original
fs.writeFileSync(scriptPath + '.bak', content, 'utf8');
console.log('📦 Backup saved as script.js.bak');

fs.writeFileSync(scriptPath, patchedContent, 'utf8');
console.log('✅ script.js patched successfully!');
console.log(`   Old block: ${oldChunk.length} chars`);
console.log(`   New block: ${newChunk.length} chars\n`);
