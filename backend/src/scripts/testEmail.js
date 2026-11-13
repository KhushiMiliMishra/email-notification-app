const emailService = require('../services/emailService');
const config = require('../config/environment');

async function main() {
  console.log('========================================================');
  console.log('📧 Testing SMTP Connection and Email Service Integration');
  console.log(`Environment: ${config.env}`);
  console.log(`SMTP Host:   ${config.email.host}:${config.email.port}`);
  console.log('========================================================\n');

  try {
    console.log('1. Verifying SMTP Connection...');
    const verifyResult = await emailService.verifyConnection();
    if (!verifyResult.success) {
      console.error('❌ Connection verification failed:', verifyResult.error);
      process.exit(1);
    }
    console.log('✅ Connection verification successful!\n');

    console.log('2. Sending a test Welcome Email via template...');
    const result = await emailService.sendWelcomeEmail('developer@example.com', {
      name: 'Test Engineer',
      appName: 'Email Notification App',
      dashboardLink: 'http://localhost:4200/dashboard'
    });

    console.log('✅ Test email sent successfully!');
    console.log(`- Message ID: ${result.messageId}`);
    console.log(`- Accepted:   ${result.accepted.join(', ')}`);
    if (result.previewUrl) {
      console.log(`\n🔗 View Email Preview Online: ${result.previewUrl}\n`);
    }

    console.log('🎉 SMTP Service and Nodemailer integration verified successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during email test execution:', error.message);
    process.exit(1);
  }
}

main();

