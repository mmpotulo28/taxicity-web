import * as SecureStore from "expo-secure-store";

export const tokenCache = {
getToken: async (key: string): Promise<string | null> => {
try {
return await SecureStore.getItemAsync(key);
} catch {
return null;
}
},
saveToken: async (key: string, token: string): Promise<void> => {
await SecureStore.setItemAsync(key, token);
},
clearToken: async (key: string): Promise<void> => {
await SecureStore.deleteItemAsync(key);
},
};
