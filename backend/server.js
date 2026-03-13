const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { admin, db } = require('./firebaseAdmin');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

/* ---------------- MIDDLEWARE ---------------- */

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


/* ---------------- AUTH ---------------- */

// Check Email
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


/* ---------------- ADMIN ---------------- */

// Get All Users
app.get('/admin/users', async (req, res) => {
  try {
    const listResult = await admin.auth().listUsers(1000);

    const users = listResult.users.map(u => ({
      uid: u.uid,
      email: u.email || '',
      displayName: u.displayName || '',
      emailVerified: u.emailVerified,
      createdAt: u.metadata.creationTime,
      lastSignIn: u.metadata.lastSignInTime || ''
    }));

    res.json({ success: true, users });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// Delete User
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


/* ---------------- SERVER ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});