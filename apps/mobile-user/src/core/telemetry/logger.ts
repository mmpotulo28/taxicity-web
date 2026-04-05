export const logger = {
info: (message: string, payload?: unknown) => console.log(message, payload),
warn: (message: string, payload?: unknown) => console.warn(message, payload),
error: (message: string, payload?: unknown) => console.error(message, payload),
};
