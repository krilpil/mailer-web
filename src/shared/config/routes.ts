export const routes = {
  AUTH_PAGE: '/sign-in',
  REGISTER_PAGE: '/sign-up',
  NOT_FOUND: '/not-found',

  HOME_PAGE: '/',
  NEW_MAILING_PAGE: '/mailing',
  MAILBOXES_PAGE: '/mailboxes',
  SETTINGS_PAGE: '/settings',
} as const;

export const publicRoutes: string[] = [routes.AUTH_PAGE, routes.REGISTER_PAGE, routes.NOT_FOUND];

export const privateRoutes: string[] = [
  ...Object.values(routes).filter((route) => !publicRoutes.includes(route)),
  routes.NOT_FOUND,
];

export type RouteKey = keyof typeof routes;
export type RouteValue = (typeof routes)[keyof typeof routes];
