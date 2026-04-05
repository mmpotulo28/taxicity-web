import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "taxiciti.driver.session-token";

export interface TokenCache {
  getToken: () => Promise<string | null>;
  saveToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
}

export const tokenCache: TokenCache = {
  async getToken() {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async saveToken(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async clearToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
};
