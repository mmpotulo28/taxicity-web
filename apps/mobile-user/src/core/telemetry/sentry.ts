import * as Sentry from "@sentry/react-native";

export function initSentry() {
Sentry.init({
dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
enabled: Boolean(process.env.EXPO_PUBLIC_SENTRY_DSN),
});
}
