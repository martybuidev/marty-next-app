export type TUserRole = 'ADMIN' | 'USER';
export type TAuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type TAuthUser = {
  id: number;
  email: string;
  role: TUserRole;
};

export type TAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type TAuthSession = {
  accessToken: string;
  user: TAuthUser;
};
