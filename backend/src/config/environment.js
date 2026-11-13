const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const isDevelopment = NODE_ENV === 'development';

const config = {
  env: NODE_ENV,
  isProduction,
  isDevelopment,
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrls: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(url => url.trim()) : ['http://localhost:4200'],
  email: {
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_PORT === '465',
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || '"Notification App" <no-reply@notificationapp.com>'
  },
  featureFlags: {
    welcomeEmail: process.env.FEATURE_WELCOME_EMAIL !== 'false',
    verificationEmail: process.env.FEATURE_VERIFICATION_EMAIL !== 'false',
    passwordResetEmail: process.env.FEATURE_PASSWORD_RESET_EMAIL !== 'false',
    promotionalEmail: process.env.FEATURE_PROMOTIONAL_EMAIL === 'true'
  }
};

// Validate production requirements
if (isProduction) {
  const missing = [];
  if (!process.env.EMAIL_HOST) missing.push('EMAIL_HOST');
  if (!process.env.EMAIL_USER) missing.push('EMAIL_USER');
  if (!process.env.EMAIL_PASS) missing.push('EMAIL_PASS');
  if (missing.length > 0) {
    console.warn(`[WARNING] Running in production but missing critical email credentials: ${missing.join(', ')}`);
  }
}

module.exports = config;
