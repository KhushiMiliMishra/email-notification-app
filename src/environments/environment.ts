export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5000/api',
  featureFlags: {
    emailNotifications: true,
    deliveryAnalytics: false,
  },
} as const;
