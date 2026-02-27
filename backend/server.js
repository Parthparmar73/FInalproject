const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { admin } = require('./firebaseAdmin');

const serviceAccount = require('./serviceAccountKey.json');



// ─── Shared Firebase Admin (single init for ALL routes) ────────────────────
const { admin, db } = require('./firebaseAdmin');

const contactRoutes = require('./routes/contactRoutes');

const app = express();
<<<<<<< HEAD

app.use(cors());
app.use(bodyParser.json());
=======
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());
>>>>>>> 0326bca (admin layout)


// Contact form route (saves to Firestore)
app.use('/api', contactRoutes);

// ─── GET /admin/users ───────────────────────────────────────────────────────
app.get('/admin/users', async (req, res) => {
  try {
    const listResult = await admin.auth().listUsers(1000);
    const users = listResult.users.map(u => ({
      uid: u.uid,
      email: u.email || '',
      displayName: u.displayName || '',
      emailVerified: u.emailVerified,
      createdAt: u.metadata.creationTime,
      lastSignIn: u.metadata.lastSignInTime || '',
    }));
    console.log(`✅ Admin fetched ${users.length} users`);
    return res.json({ success: true, users });
  } catch (err) {
    console.error('Admin users error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

<<<<<<< HEAD
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

//update password
app.post('/update-password', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { password: newPassword });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
});

=======
// ─── DELETE /admin/delete-user ──────────────────────────────────────────────
app.delete('/admin/delete-user/:uid', async (req, res) => {
  const { uid } = req.params;
  if (!uid) return res.status(400).json({ success: false, message: 'UID required.' });
  try {
    await admin.auth().deleteUser(uid);
    console.log(`🗑️  User deleted: ${uid}`);
    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Delete user error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /admin/messages ────────────────────────────────────────────────────
// Firestore `contacts` collection se form submissions fetch karta hai
app.get('/admin/messages', async (req, res) => {
  try {
    const snapshot = await db.collection('contacts')
      .orderBy('createdAt', 'desc')
      .get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || ''
    }));

    console.log(`✅ Admin fetched ${messages.length} messages`);
    return res.json({ success: true, messages });
  } catch (err) {
    console.error('Admin messages error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /admin/verify-email ───────────────────────────────────────────────
app.post('/admin/verify-email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required.' });
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { emailVerified: true });
    console.log(`✅ Email verified: ${email}`);
    return res.json({ success: true });
  } catch (err) {
    console.error('Verify email error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE/POST /admin/delete-message/:id ──────────────────────────────────
// Firestore contacts collection se ek message delete karta hai
const deleteMessageHandler = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, message: 'Document ID required.' });
  try {
    await db.collection('contacts').doc(id).delete();
    console.log(`🗑️  Message deleted: ${id}`);
    return res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    console.error('Delete message error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
app.delete('/admin/delete-message/:id', deleteMessageHandler);
app.post('/admin/delete-message/:id', deleteMessageHandler);  // POST alias


// ─── Health check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.send('Backend is running 🚀'));

>>>>>>> 0326bca (admin layout)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
