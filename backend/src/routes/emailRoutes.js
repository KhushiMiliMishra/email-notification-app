const express = require('express');
const router = express.Router();
const config = require('../config/environment');
const emailService = require('../services/emailService');

/**
 * @route   GET /api/email/test-smtp
 * @desc    Verify SMTP transporter connectivity and trigger a test email
 * @access  Public
 */
router.get('/test-smtp', async (req, res) => {
  try {
    const status = await emailService.verifyConnection();
    if (!status.success) {
      return res.status(500).json({
        success: false,
        message: 'SMTP connection failed',
        error: status.error
      });
    }

    const testResult = await emailService.sendEmail({
      to: 'test-recipient@example.com',
      subject: 'Test Email - Nodemailer & SMTP Setup Verification',
      text: 'This is a test email sent from the Node.js backend to verify SMTP integration.',
      html: '<p>This is a <strong>test email</strong> sent from the Node.js backend to verify SMTP integration.</p>'
    });

    res.status(200).json({
      success: true,
      message: 'SMTP connection verified and test email sent successfully.',
      details: testResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to test SMTP connection or send email.',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/email/send
 * @desc    Generic email sending endpoint (supports raw text, html or template)
 * @access  Public
 */
router.post('/send', async (req, res) => {
  try {
    const { to, subject, text, html, template, data } = req.body;

    if (!to || !subject) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: "to" and "subject" are required.'
      });
    }

    const result = await emailService.sendEmail({ to, subject, text, html, template, data });
    res.status(200).json({
      success: true,
      message: 'Email dispatched successfully.',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send email.',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/email/welcome
 * @desc    Send welcome notification email (Feature-flag checked for Person 2 integration)
 * @access  Public
 */
router.post('/welcome', async (req, res) => {
  if (!config.featureFlags.welcomeEmail) {
    return res.status(403).json({
      success: false,
      message: 'Welcome email feature is disabled by feature flags.'
    });
  }

  try {
    const { to, name, dashboardLink } = req.body;
    if (!to) {
      return res.status(400).json({ success: false, error: 'Recipient email "to" is required.' });
    }

    const result = await emailService.sendWelcomeEmail(to, { name, dashboardLink });
    res.status(200).json({
      success: true,
      message: 'Welcome email dispatched successfully.',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send welcome email.',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/email/verify
 * @desc    Send verification email (Feature-flag checked for Person 2 integration)
 * @access  Public
 */
router.post('/verify', async (req, res) => {
  if (!config.featureFlags.verificationEmail) {
    return res.status(403).json({
      success: false,
      message: 'Verification email feature is disabled by feature flags.'
    });
  }

  try {
    const { to, name, verificationCode, verificationLink } = req.body;
    if (!to) {
      return res.status(400).json({ success: false, error: 'Recipient email "to" is required.' });
    }

    const result = await emailService.sendVerificationEmail(to, { name, verificationCode, verificationLink });
    res.status(200).json({
      success: true,
      message: 'Verification email dispatched successfully.',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email.',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/email/reset-password
 * @desc    Send password reset email (Feature-flag checked for Person 2 integration)
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
  if (!config.featureFlags.passwordResetEmail) {
    return res.status(403).json({
      success: false,
      message: 'Password reset email feature is disabled by feature flags.'
    });
  }

  try {
    const { to, name, resetLink, expiresIn } = req.body;
    if (!to) {
      return res.status(400).json({ success: false, error: 'Recipient email "to" is required.' });
    }

    const result = await emailService.sendPasswordResetEmail(to, { name, resetLink, expiresIn });
    res.status(200).json({
      success: true,
      message: 'Password reset email dispatched successfully.',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send password reset email.',
      error: error.message
    });
  }
});

module.exports = router;
