const fs = require('fs');
const path = require('path');
const config = require('../config/environment');
const { getTransporter, verifyTransporter, getPreviewUrl } = require('../config/mailer');

/**
 * Loads an HTML template and replaces {{placeholder}} tokens with data values.
 *
 * @param {string} templateName - Name of template (e.g. 'welcome', 'verification')
 * @param {object} data - Key-value map for placeholder replacements
 * @returns {string} - Rendered HTML
 */
function renderTemplate(templateName, data = {}) {
  const fileName = templateName.endsWith('.html') ? templateName : `${templateName}.html`;
  const templatePath = path.join(__dirname, '../templates', fileName);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Email template "${fileName}" not found in templates directory.`);
  }

  let html = fs.readFileSync(templatePath, 'utf8');

  // Standard defaults for common variables
  const defaultData = {
    appName: 'Notification App',
    currentYear: new Date().getFullYear().toString(),
    supportEmail: 'support@notificationapp.com',
    supportLink: '#',
    privacyLink: '#',
    unsubscribeLink: '#'
  };

  const mergedData = { ...defaultData, ...data };

  // Replace all {{key}} placeholders
  Object.keys(mergedData).forEach((key) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    html = html.replace(regex, mergedData[key]);
  });

  return html;
}

/**
 * Core reusable email-sending function.
 *
 * @param {object} options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject line
 * @param {string} [options.text] - Plain text body
 * @param {string} [options.html] - HTML body
 * @param {string} [options.template] - Template file name (e.g. 'welcome')
 * @param {object} [options.data] - Data payload for template placeholders
 * @param {string} [options.from] - Sender address override
 * @param {Array} [options.attachments] - Nodemailer attachments
 * @returns {Promise<object>} Result object with status, messageId, and previewUrl
 */
async function sendEmail({ to, subject, text, html, template, data, from, attachments }) {
  if (!to) {
    throw new Error('Email recipient ("to") is required.');
  }
  if (!subject) {
    throw new Error('Email "subject" is required.');
  }

  let finalHtml = html;
  if (template) {
    finalHtml = renderTemplate(template, data);
  }

  if (!finalHtml && !text) {
    throw new Error('Either "html", "template", or "text" content must be provided.');
  }

  const transporter = await getTransporter();

  const mailOptions = {
    from: from || config.email.from,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    text: text || undefined,
    html: finalHtml || undefined,
    attachments: attachments || []
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = getPreviewUrl(info);

    const result = {
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      previewUrl: previewUrl || null
    };

    console.log(`[Email Service] Email sent successfully to: ${mailOptions.to} (MessageId: ${info.messageId})`);
    if (previewUrl) {
      console.log(`[Email Service] Preview URL: ${previewUrl}`);
    }

    return result;
  } catch (error) {
    console.error('[Email Service] Failed to send email:', error.message);
    throw error;
  }
}

/**
 * Pre-configured helpers for common notification types
 */
async function sendWelcomeEmail(to, data = {}) {
  return sendEmail({
    to,
    subject: `Welcome to ${data.appName || 'Notification App'}!`,
    template: 'welcome',
    data: {
      name: data.name || 'User',
      userEmail: to,
      dashboardLink: data.dashboardLink || 'http://localhost:4200/dashboard',
      ...data
    }
  });
}

async function sendVerificationEmail(to, data = {}) {
  return sendEmail({
    to,
    subject: `Verify your email address - ${data.appName || 'Notification App'}`,
    template: 'verification',
    data: {
      name: data.name || 'User',
      verificationCode: data.verificationCode || Math.floor(100000 + Math.random() * 900000).toString(),
      verificationLink: data.verificationLink || 'http://localhost:4200/verify?token=example-token',
      expiresIn: data.expiresIn || '15 minutes',
      ...data
    }
  });
}

async function sendPasswordResetEmail(to, data = {}) {
  return sendEmail({
    to,
    subject: `Password Reset Request - ${data.appName || 'Notification App'}`,
    template: 'passwordReset',
    data: {
      name: data.name || 'User',
      userEmail: to,
      resetLink: data.resetLink || 'http://localhost:4200/reset-password?token=example-token',
      expiresIn: data.expiresIn || '30 minutes',
      requestedAt: data.requestedAt || new Date().toUTCString(),
      requestIp: data.requestIp || '127.0.0.1 (Localhost)',
      ...data
    }
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  renderTemplate,
  verifyConnection: verifyTransporter
};

