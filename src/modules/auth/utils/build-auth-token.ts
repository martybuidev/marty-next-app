import { decodeJwt } from "jose";
import { TAuthResponse } from "../types";

export const getExpMs = (token: string) => ((decodeJwt(token).exp ?? 0) as number) * 1000;

export const buildAuthToken = <T extends object>(target: T, res: TAuthResponse) => ({
  ...target,
  id: String(res.user.id),
  role: res.user.role,
  email: res.user.email,
  accessToken: res.accessToken,
  refreshToken: res.refreshToken,
  expiresAt: getExpMs(res.accessToken),
});