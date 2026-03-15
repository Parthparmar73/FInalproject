const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const Razorpay = require('razorpay');
require('dotenv').config();

// ─── Razorpay Instance ────────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const { admin, db } = require('./firebaseAdmin');
const contactRoutes = require('./routes/contactRoutes');

const app = express();


app.use(cors());
app.use(bodyParser.json());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));

app.use(express.json());


/* ---------------- ROUTES ---------------- */

// Contact Form
app.use('/api', contactRoutes);


// Health Check
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});


//check email
app.post('/check-email', async (req, res) => {
  const { email } = req.body;

  try {
    await admin.auth().getUserByEmail(email);
    res.json({ registered: true });
  } catch {
    res.json({ registered: false });
  }
});


// Update Password
app.post('/update-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await admin.auth().getUserByEmail(email);

    await admin.auth().updateUser(user.uid, {
      password: newPassword
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to update password'
    });
  }
});


// ─── GET /admin/users ────────────────────────────────────────────────────────
// Firebase Auth se saare registered users fetch karo
app.get('/admin/users', async (req, res) => {
  try {
    const listUsersResult = await admin.auth().listUsers(1000);
    const users = listUsersResult.users.map(u => ({
      uid: u.uid,
      email: u.email || '',
      displayName: u.displayName || '',
      emailVerified: u.emailVerified,
      createdAt: u.metadata.creationTime || '',
      lastSignIn: u.metadata.lastSignInTime || ''
    }));
    console.log(`✅ Admin fetched ${users.length} users`);
    return res.json({ success: true, users });
  } catch (err) {
    console.error('Fetch users error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /admin/delete-user ──────────────────────────────────────────────
app.delete('/admin/delete-user/:uid', async (req, res) => {
  const { uid } = req.params;

  if (!uid) {
    return res.status(400).json({
      success: false,
      message: 'UID required'
    });
  }

  try {
    await admin.auth().deleteUser(uid);

    res.json({
      success: true,
      message: 'User deleted'
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// Get Messages
app.get('/admin/messages', async (req, res) => {
  try {
    const snapshot = await db
      .collection('contacts')
      .orderBy('createdAt', 'desc')
      .get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt:
        doc.data().createdAt?.toDate?.()?.toISOString() || ''
    }));

    res.json({
      success: true,
      messages
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// Verify Email
app.post('/admin/verify-email', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email required'
    });
  }

  try {
    const user = await admin.auth().getUserByEmail(email);

    await admin.auth().updateUser(user.uid, {
      emailVerified: true
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// Delete Message
app.delete('/admin/delete-message/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'ID required'
    });
  }

  try {
    await db.collection('contacts').doc(id).delete();

    res.json({
      success: true,
      message: 'Message deleted'
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ─── POST /create-order ─────────────────────────────────────────────────────
// Razorpay order banata hai (amount paisa mein hota hai, e.g. ₹500 = 50000)
app.post('/create-order', async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;
  if (!amount) return res.status(400).json({ success: false, message: 'Amount required' });
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise mein convert
      currency,
      receipt: receipt || 'receipt_' + Date.now(),
    });
    console.log(`✅ Razorpay order created: ${order.id}`);
    return res.json({ success: true, order });
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /verify-payment ────────────────────────────────────────────────────
// Payment ke baad signature verify karta hai (security check)
app.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Missing payment fields' });
  }
  try {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');
    const isValid = expectedSignature === razorpay_signature;
    if (!isValid) {
      console.error('❌ Payment signature mismatch!');
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
    console.log(`✅ Payment verified: ${razorpay_payment_id}`);
    return res.json({ success: true, paymentId: razorpay_payment_id });
  } catch (err) {
    console.error('Verify payment error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /quote-request ──────────────────────────────────────────────────────
// User submits Custom Quote form → saved to Firestore 'quote-requests'
app.post('/quote-request', async (req, res) => {
  const { name, email, phone, packageName, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
  }
  try {
    const docRef = await db.collection('quote-requests').add({
      name, email,
      phone: phone || '',
      packageName: packageName || 'General Inquiry',
      message,
      status: 'new',
      createdAt: new Date()
    });
    console.log(`✅ Quote request saved: ${docRef.id} from ${email}`);
    return res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('Quote request error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /admin/quotes ────────────────────────────────────────────────────────
app.get('/admin/quotes', async (req, res) => {
  try {
    const snapshot = await db.collection('quote-requests').orderBy('createdAt', 'desc').get();
    const quotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ success: true, quotes });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /admin/quotes/:id ─────────────────────────────────────────────────
app.delete('/admin/quotes/:id', async (req, res) => {
  try {
    await db.collection('quote-requests').doc(req.params.id).delete();
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /admin/packages ─────────────────────────────────────────────────────
app.get('/admin/packages', async (req, res) => {
  try {
    const snapshot = await db.collection('packages').orderBy('createdAt', 'desc').get();
    const packages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✅ Admin fetched ${packages.length} packages`);
    return res.json({ success: true, packages });
  } catch (err) {
    console.error('Admin packages error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /admin/packages/:id ─────────────────────────────────────────────────
app.get('/admin/packages/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection('packages').doc(id).get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Package not found.' });
    return res.json({ success: true, package: { id: doc.id, ...doc.data() } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── NAV COLLECTIONS CRUD ─────────────────────────────────────────────────────
// Used by navbar (dropdown display) AND admin dashboard (manage)
// Valid collections: nav-services, nav-challenges, nav-industries

const ALLOWED_NAV = ['nav-services', 'nav-challenges', 'nav-industries'];

// GET /admin/nav/:collection
app.get('/admin/nav/:collection', async (req, res) => {
  const col = req.params.collection;
  if (!ALLOWED_NAV.includes(col)) return res.status(400).json({ success: false, message: 'Invalid collection.' });
  try {
    const snap = await db.collection(col).orderBy('order', 'asc').get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json({ success: true, items });
  } catch {
    // fallback without ordering if Firestore index not built yet
    const snap2 = await db.collection(col).get();
    const items2 = snap2.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json({ success: true, items: items2 });
  }
});

// POST /admin/nav/:collection
app.post('/admin/nav/:collection', async (req, res) => {
  const col = req.params.collection;
  if (!ALLOWED_NAV.includes(col)) return res.status(400).json({ success: false, message: 'Invalid collection.' });
  const { label, route, icon, description, order, price, duration, features, popular } = req.body;
  if (!label || !route) return res.status(400).json({ success: false, message: 'Label and route required.' });
  try {
    const ref = await db.collection(col).add({
      label: label.trim(), route: route.trim(),
      icon: (icon || '🔹').trim(), description: (description || '').trim(),
      price: Number(price) || 0,
      duration: (duration || '').trim(),
      features: Array.isArray(features) ? features : (features || '').split('\n').map(f => f.trim()).filter(Boolean),
      popular: !!popular,
      order: Number(order) || 99, createdAt: new Date()
    });
    return res.json({ success: true, id: ref.id });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /admin/nav/:collection/:id
app.put('/admin/nav/:collection/:id', async (req, res) => {
  const { collection: col, id } = req.params;
  if (!ALLOWED_NAV.includes(col)) return res.status(400).json({ success: false, message: 'Invalid collection.' });
  const { label, route, icon, description, order, price, duration, features, popular } = req.body;
  try {
    await db.collection(col).doc(id).update({
      label: (label || '').trim(), route: (route || '').trim(),
      icon: (icon || '🔹').trim(), description: (description || '').trim(),
      price: Number(price) || 0,
      duration: (duration || '').trim(),
      features: Array.isArray(features) ? features : (features || '').split('\n').map(f => f.trim()).filter(Boolean),
      popular: !!popular,
      order: Number(order) || 99, updatedAt: new Date()
    });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /admin/nav/:collection/:id
app.delete('/admin/nav/:collection/:id', async (req, res) => {
  const { collection: col, id } = req.params;
  if (!ALLOWED_NAV.includes(col)) return res.status(400).json({ success: false, message: 'Invalid collection.' });
  try {
    await db.collection(col).doc(id).delete();
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /admin/packages ────────────────────────────────────────────────────
app.post('/admin/packages', async (req, res) => {
  const { name, price, duration, features, popular } = req.body;
  if (!name || !price) return res.status(400).json({ success: false, message: 'Name and price required.' });
  try {
    const docRef = await db.collection('packages').add({
      name: name.trim(),
      price: Number(price),
      duration: (duration || '').trim(),
      features: Array.isArray(features) ? features : (features || '').split('\n').map(f => f.trim()).filter(Boolean),
      popular: !!popular,
      createdAt: new Date()
    });
    console.log(`✅ Package added: ${docRef.id}`);
    return res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('Add package error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /admin/packages/:id ─────────────────────────────────────────────────
app.put('/admin/packages/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, duration, features, popular } = req.body;
  if (!id) return res.status(400).json({ success: false, message: 'Package ID required.' });
  try {
    await db.collection('packages').doc(id).update({
      name: name.trim(),
      price: Number(price),
      duration: (duration || '').trim(),
      features: Array.isArray(features) ? features : (features || '').split('\n').map(f => f.trim()).filter(Boolean),
      popular: !!popular,
      updatedAt: new Date()
    });
    console.log(`✅ Package updated: ${id}`);
    return res.json({ success: true });
  } catch (err) {
    console.error('Update package error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /admin/packages/:id ──────────────────────────────────────────────
app.delete('/admin/packages/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, message: 'Package ID required.' });
  try {
    await db.collection('packages').doc(id).delete();
    console.log(`🗑️  Package deleted: ${id}`);
    return res.json({ success: true, message: 'Package deleted.' });
  } catch (err) {
    console.error('Delete package error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GENERIC NAV-ITEMS CRUD (Services / Challenges / Industries) ─────────────
// Collections: 'nav-services' | 'nav-challenges' | 'nav-industries'
const ALLOWED_NAV_COLLECTIONS = ['nav-services', 'nav-challenges', 'nav-industries'];

// GET all items
app.get('/admin/nav/:collection', async (req, res) => {
  const col = req.params.collection;
  if (!ALLOWED_NAV_COLLECTIONS.includes(col))
    return res.status(400).json({ success: false, message: 'Invalid collection.' });
  try {
    const snapshot = await db.collection(col).orderBy('order', 'asc').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ success: true, items });
  } catch (err) {
    // If no 'order' field yet, fallback without orderBy
    try {
      const snapshot = await db.collection(col).get();
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json({ success: true, items });
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }
});

// POST add item
app.post('/admin/nav/:collection', async (req, res) => {
  const col = req.params.collection;
  if (!ALLOWED_NAV_COLLECTIONS.includes(col))
    return res.status(400).json({ success: false, message: 'Invalid collection.' });
  const { label, route, icon, description, price, duration, features, popular, badge, badgeColor } = req.body;
  if (!label || !route)
    return res.status(400).json({ success: false, message: 'Label and route required.' });
  try {
    // Count existing docs to set order
    const snap = await db.collection(col).get();
    const docRef = await db.collection(col).add({
      label: label.trim(),
      route: route.trim(),
      icon: (icon || '🔹').trim(),
      description: (description || '').trim(),
      price: Number(price) || 0,
      duration: (duration || '').trim(),
      features: Array.isArray(features) ? features : (features || '').split('\n').map(f => f.trim()).filter(Boolean),
      popular: !!popular,
      badge: (badge || '').trim(),
      badgeColor: (badgeColor || '').trim(),
      order: snap.size,
      createdAt: new Date()
    });
    console.log(`✅ nav item added to ${col}: ${docRef.id}`);
    return res.json({ success: true, id: docRef.id });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update item
app.put('/admin/nav/:collection/:id', async (req, res) => {
  const col = req.params.collection;
  const { id } = req.params;
  if (!ALLOWED_NAV_COLLECTIONS.includes(col))
    return res.status(400).json({ success: false, message: 'Invalid collection.' });
  const { label, route, icon, description, order, price, duration, features, popular, badge, badgeColor } = req.body;
  try {
    await db.collection(col).doc(id).update({
      label: label.trim(),
      route: route.trim(),
      icon: (icon || '🔹').trim(),
      description: (description || '').trim(),
      price: Number(price) || 0,
      duration: (duration || '').trim(),
      features: Array.isArray(features) ? features : (features || '').split('\n').map(f => f.trim()).filter(Boolean),
      popular: !!popular,
      badge: (badge || '').trim(),
      badgeColor: (badgeColor || '').trim(),
      ...(order !== undefined ? { order: Number(order) } : {}),
      updatedAt: new Date()
    });
    console.log(`✅ nav item updated in ${col}: ${id}`);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE item
app.delete('/admin/nav/:collection/:id', async (req, res) => {
  const col = req.params.collection;
  const { id } = req.params;
  if (!ALLOWED_NAV_COLLECTIONS.includes(col))
    return res.status(400).json({ success: false, message: 'Invalid collection.' });
  try {
    await db.collection(col).doc(id).delete();
    console.log(`🗑️  nav item deleted from ${col}: ${id}`);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /nav-service-by-route?route=ecommerce ───────────────────────────────
// Service pages use this to load admin-managed data by their own route
// e.g. /nav-service-by-route?route=ecommerce  OR  ?route=/ecommerce
app.get('/nav-service-by-route', async (req, res) => {
  let { route } = req.query;
  if (!route) return res.status(400).json({ success: false, message: 'route query param required.' });
  // Normalize: remove leading slash for comparison
  const normalizedRoute = String(route).replace(/^\/+/, '');
  try {
    const snap = await db.collection('nav-services').get();
    let found = null;
    snap.forEach(doc => {
      const docRoute = String(doc.data().route || '').replace(/^\/+/, '');
      if (docRoute === normalizedRoute) {
        found = { id: doc.id, ...doc.data() };
      }
    });
    if (found) {
      console.log(`✅ nav-service-by-route found: ${normalizedRoute}`);
      return res.json({ success: true, item: found });
    } else {
      return res.json({ success: false, message: 'Not found in nav-services.' });
    }
  } catch (err) {
    console.error('nav-service-by-route error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /admin/applications ─────────────────────────────────────────────────
// Admin: Sab job applications fetch karo (Firestore 'job-applications' collection)
app.get('/admin/applications', async (req, res) => {
  try {
    const snapshot = await db.collection('job-applications').orderBy('appliedAt', 'desc').get();
    const applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      appliedAt: doc.data().appliedAt?.toDate?.()?.toISOString() || ''
    }));
    console.log(`✅ Admin fetched ${applications.length} job applications`);
    return res.json({ success: true, applications });
  } catch (err) {
    console.error('Fetch applications error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /admin/applications/:id ──────────────────────────────────────────
app.delete('/admin/applications/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, message: 'ID required.' });
  try {
    await db.collection('job-applications').doc(id).delete();
    console.log(`🗑️  Job application deleted: ${id}`);
    return res.json({ success: true, message: 'Application deleted.' });
  } catch (err) {
    console.error('Delete application error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /payments ───────────────────────────────────────────────────────────
// User payment complete hone par save karo Firestore 'payments' mein
app.post('/payments', async (req, res) => {
  const { userEmail, productName, price, txnId, method } = req.body;
  if (!txnId) return res.status(400).json({ success: false, message: 'txnId required.' });
  try {
    const docRef = await db.collection('payments').add({
      userEmail: userEmail || 'Guest',
      productName: productName || 'Unknown Product',
      price: price || '₹0',
      txnId,
      method: method || 'Card',
      status: 'completed',
      paidAt: new Date()
    });
    console.log(`✅ Payment saved: ${docRef.id} | ${userEmail} | ${productName} | ${price}`);
    return res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('Payment save error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /admin/payments ──────────────────────────────────────────────────────
app.get('/admin/payments', async (req, res) => {
  try {
    const snapshot = await db.collection('payments').orderBy('paidAt', 'desc').get();
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      paidAt: doc.data().paidAt?.toDate?.()?.toISOString() || ''
    }));
    console.log(`✅ Admin fetched ${payments.length} payments`);
    return res.json({ success: true, payments });
  } catch (err) {
    console.error('Fetch payments error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /admin/payments/:id ───────────────────────────────────────────────
app.delete('/admin/payments/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, message: 'ID required.' });
  try {
    await db.collection('payments').doc(id).delete();
    console.log(`🗑️  Payment deleted: ${id}`);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.send('Backend is running 🚀'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});