// One-time script: Firebase me admin user create karta hai
const admin = require('firebase-admin');

try {
    const serviceAccount = require('./serviceAccountKey.json');
    if (!admin.apps.length) {
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
} catch (e) {
    console.error('❌ serviceAccountKey.json nahi mila:', e.message);
    process.exit(1);
}

const ADMIN_EMAIL = 'admin@pixelroot.com';
const ADMIN_PASSWORD = 'Admin@123';

(async () => {
    try {
        // Check if already exists
        let existing = null;
        try {
            existing = await admin.auth().getUserByEmail(ADMIN_EMAIL);
        } catch (_) { }

        if (existing) {
            // Update password if already exists
            await admin.auth().updateUser(existing.uid, { password: ADMIN_PASSWORD });
            console.log(`✅ Admin user already exists — password update kar diya!`);
            console.log(`   Email: ${ADMIN_EMAIL}`);
            console.log(`   Password: ${ADMIN_PASSWORD}`);
        } else {
            // Create new admin user
            const user = await admin.auth().createUser({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                displayName: 'Admin',
                emailVerified: true,
            });
            console.log(`✅ Admin user successfully create ho gaya!`);
            console.log(`   UID: ${user.uid}`);
            console.log(`   Email: ${ADMIN_EMAIL}`);
            console.log(`   Password: ${ADMIN_PASSWORD}`);
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
})();
