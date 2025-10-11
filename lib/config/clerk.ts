import type { ClerkProviderProps } from "@clerk/clerk-react";

export const clerkConfig: ClerkProviderProps = {
	children: null,
	publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
	isSatellite: false,
	proxyUrl: "",
	appearance: {
		variables: {
			colorBackground: "hsl(var(--heroui-background) / 1)",
			colorText: "hsl(var(--heroui-foreground) / 1)",
			colorBorder: "hsl(var(--heroui-default-500) / 1)",
			colorPrimary: "hsl(var(--heroui-primary) / 1)",
			colorSuccess: "hsl(var(--heroui-success) / 1)",
			colorWarning: "hsl(var(--heroui-warning) / 1)",
			colorDanger: "hsl(var(--heroui-danger) / 1)",
			colorTextSecondary: "hsl(var(--heroui-secondary) / 1)",
			colorNeutral: "hsl(var(--heroui-text) / 1)",
			colorForeground: "hsl(var(--heroui-text) / 1)",
			colorInput: "hsl(var(--heroui-background) / 1)",
			colorInputForeground: "hsl(var(--heroui-text) / 1)",
			colorMutedForeground: "hsl(var(--heroui-muted) / 1)",
			colorModalBackdrop: "hsl(var(--heroui-background) / 1)",
			colorMuted: "hsl(var(--heroui-default) / 1)",
		},
		layout: {
			termsPageUrl: "/support/terms",
			privacyPageUrl: "/support/privacy",
			helpPageUrl: "/support/help-centre",
			logoImageUrl: "/images/amsa-logo.png",
			logoPlacement: "none",
			shimmer: true,
			socialButtonsVariant: "auto",
			showOptionalFields: true,
			socialButtonsPlacement: "top",
			unsafe_disableDevelopmentModeWarnings: true,
		},
		captcha: {
			language: "en",
			theme: "dark",
			size: "normal",
		},
	},
	routerPush: (url: string) => {
		window.location.assign(url);
	},
	routerReplace: (url: string) => {
		window.location.replace(url);
	},
};
