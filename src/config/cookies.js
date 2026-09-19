const isProduction = process.env.NODE_ENV === 'production';

export const refreshCookieOptions = {
  httpOnly: true,
  // SameSite=None is only accepted by browsers when Secure is also enabled.
  // Local development runs over HTTP, so use Lax for the same-site localhost/LAN setup.
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};
