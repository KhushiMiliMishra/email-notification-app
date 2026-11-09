export const environment = {
  production: true,
  apiBaseUrl: 'https://api.your-domain.com/api',
  featureFlags: {
    emailNotifications: true,
    deliveryAnalytics: true,
  },
} as const;
