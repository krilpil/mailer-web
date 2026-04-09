export const routes = {
  AUTH_PAGE: '/sign-in',
  REGISTER_PAGE: '/sign-up',
  NOT_FOUND: '/not-found',

  HOME_PAGE: '/',
  MAILINGS_PAGE: '/mailings',
  NEW_TEMPLATE_PAGE: '/mailing',
  TEMPLATES_PAGE: '/templates',
  CONTACTS_PAGE: '/contacts',
  MAILBOXES_PAGE: '/mailboxes',
  SETTINGS_PAGE: '/settings',

  SUPPORT_PAGE: 'https://t.me/Mailfinch',
} as const;

export const publicRoutes: string[] = [routes.AUTH_PAGE, routes.REGISTER_PAGE, routes.NOT_FOUND];

export const privateRoutes: string[] = [
  ...Object.values(routes).filter((route) => !publicRoutes.includes(route)),
  routes.NOT_FOUND,
];

export type RouteKey = keyof typeof routes;
export type RouteValue = (typeof routes)[keyof typeof routes];
