export type TAuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: { id: number; email: string; role: string };
};

export const AUTH_PROVIDER = {
  credentials: 'credentials',
  google: 'google',
  github: 'github',
  facebook: 'facebook',
} as const;

export type TAuthProvider = keyof typeof AUTH_PROVIDER;
