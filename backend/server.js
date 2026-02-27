
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { admin } = require('./firebaseAdmin');

const serviceAccount = require('./serviceAccountKey.json');



const contactRoutes = require('./routes/contactRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api', contactRoutes);

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});