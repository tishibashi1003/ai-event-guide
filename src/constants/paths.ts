export const PATHS = {
  HOME: '/',
  EXPLORE: '/explore',
  SAVED: '/saved',
  SETTINGS: '/settings',
  EVENT: (id: string) => `/events/${id}`,
} as const;
