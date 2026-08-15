import 'client-only'

let accessToken: string | null = null;

export const tokenStore = {
    get: (): string | null => accessToken,
    set:(token: string) => accessToken = token,
    clear: (): void => {accessToken = null}
};