const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const FIREBASE_API_KEY = 'AIzaSyDKCWP99MsuB8QhEbnJHw4MWcv_1sMpz8U';
const EMAILS_FILE = path.join(__dirname, 'registeredEmails.json');

// Load or initialize the registered emails store
function loadEmails() {
  if (fs.existsSync(EMAILS_FILE)) {
    try { return JSON.parse(fs.readFileSync(EMAILS_FILE, 'utf8')); }
    catch { return {}; }
  }
  return {};
}

function saveEmail(email) {
  const store = loadEmails();
  store[email.toLowerCase().trim()] = true;
  fs.writeFileSync(EMAILS_FILE, JSON.stringify(store, null, 2));
}

function isEmailInStore(email) {
  const store = loadEmails();
  return !!store[email.toLowerCase().trim()];
}

// Helper: call Firebase REST API safely
async function firebasePost(endpoint, body) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/${endpoint}?key=${FIREBASE_API_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { console.error('Non-JSON:', text.slice(0, 200)); return { error: { message: 'NON_JSON' } }; }
}

// ─── POST /register-email ───────────────────────────────────────────────────
// Called after successful Firebase registration to save email locally
app.post('/register-email', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required.' });
  saveEmail(email);
  console.log(`📝 Registered email saved: ${email}`);
  return res.json({ success: true });
});

// ─── POST /check-email ─────────────────────────────────────────────────────
// Returns { registered: true/false }
app.post('/check-email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ registered: false, message: 'Email required.' });

  const emailLower = email.toLowerCase().trim();

  // 1. Check local store (fastest, works for all new registrations)
  if (isEmailInStore(emailLower)) {
    console.log(`✅ Email found in local store: ${emailLower}`);
    return res.json({ registered: true });
  }

  // 2. Fallback: try Firebase REST API (works if Email Enumeration Protection is OFF)
  try {
    const data = await firebasePost('accounts:signInWithPassword', {
      email: emailLower,
      password: '___pixelroot_check___',
      returnSecureToken: true,
    });
    const errMsg = data?.error?.message || '';
    console.log(`Firebase check for ${emailLower}: ${errMsg}`);

    if (errMsg === 'INVALID_PASSWORD') {
      // Email EXISTS — enumeration protection is OFF
      saveEmail(emailLower); // cache it for future checks
      return res.json({ registered: true });
    } else if (errMsg === 'EMAIL_NOT_FOUND' || errMsg === 'USER_NOT_FOUND') {
      // Email DOES NOT exist
      return res.json({ registered: false, message: 'This email is not registered. Please sign up first.' });
    } else if (errMsg === 'INVALID_LOGIN_CREDENTIALS') {
      // Email Enumeration Protection ON — can't tell; block unknown emails
      return res.json({ registered: false, message: 'This email is not registered. Please sign up first.' });
    } else if (errMsg === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
      return res.json({ registered: false, message: 'Too many attempts. Please try again later.' });
    } else {
      // Unknown — block to be safe
      return res.json({ registered: false, message: 'This email is not registered. Please sign up first.' });
    }
  } catch (err) {
    console.error('Firebase check error:', err.message);
    return res.status(500).json({ registered: false, message: 'Server error. Please try again.' });
  }
});

// ─── POST /update-password ─────────────────────────────────────────────────
app.post('/update-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ success: false, message: 'Email and newPassword required.' });
  if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

  // Try Admin SDK (if serviceAccountKey.json is available)
  try {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      const svc = require('./serviceAccountKey.json');
      admin.initializeApp({ credential: admin.credential.cert(svc) });
    }
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { password: newPassword });
    console.log(`✅ Password directly updated for: ${email}`);
    return res.json({ success: true, message: 'Password updated successfully!' });
  } catch (e) {
    if (e.code && e.code !== 'MODULE_NOT_FOUND') {
      return res.status(500).json({ success: false, message: e.message });
    }
    // No serviceAccountKey.json — send Firebase reset email
  }

  const resetData = await firebasePost('accounts:sendOobCode', { requestType: 'PASSWORD_RESET', email });
  if (resetData.error) {
    return res.status(400).json({ success: false, message: 'Failed: ' + resetData.error.message });
  }
  return res.json({ success: true, resetEmailSent: true });
});

// ─── Health check ──────────────────────────────────────────────────────────
app.get('/', (req, res) => res.send('Pixelroot Auth Backend ✅'));

app.listen(5000, () => console.log('🚀 Backend running on http://localhost:5000'));