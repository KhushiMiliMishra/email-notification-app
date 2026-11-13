const nodemailer = require('nodemailer');
const config = require('./environment');

let transporterInstance = null;
let testAccountCredentials = null;

/**
 * Initializes and returns the Nodemailer transporter instance.
 * In development, if no credentials are provided in .env, it automatically creates
 * an Ethereal test account for seamless local email testing.
 */
async function getTransporter() {
  if (transporterInstance) {
    return transporterInstance;
  }

  let { host, port, secure, user, pass } = config.email;

  // Auto-generate Ethereal test account if credentials are not provided in development
  if (config.isDevelopment && (!user || !pass)) {
    console.log('[Email Config] No SMTP credentials provided in .env. Creating Ethereal test account...');
    try {
      testAccountCredentials = await nodemailer.createTestAccount();
      host = testAccountCredentials.smtp.host;
      port = testAccountCredentials.smtp.port;
      secure = testAccountCredentials.smtp.secure;
      user = testAccountCredentials.user;
      pass = testAccountCredentials.pass;
      console.log(`[Email Config] Ethereal test account created successfully: ${user}`);
    } catch (err) {
      console.error('[Email Config] Failed to create Ethereal test account:', err.message);
    }
  }

  transporterInstance = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    tls: {
      // Do not fail on invalid certs in development
      rejectUnauthorized: config.isProduction
    }
  });

  return transporterInstance;
}

/**
 * Verifies the connection configuration to the SMTP server.
 */
async function verifyTransporter() {
  try {
    const transporter = await getTransporter();
    await transporter.verify();
    console.log('[Email Config] SMTP server connection verified successfully.');
    return { success: true };
  } catch (error) {
    console.error('[Email Config] SMTP connection verification failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Returns the Ethereal web preview URL for a sent message if available.
 */
function getPreviewUrl(info) {
  return nodemailer.getTestMessageUrl(info) || null;
}

module.exports = {
  getTransporter,
  verifyTransporter,
  getPreviewUrl
};

