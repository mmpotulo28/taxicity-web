import { ClerkProvider } from "@clerk/nextjs";
import { ComponentProps } from "react";

export const clerkConfig: ComponentProps<typeof ClerkProvider> = {
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
		},
	},
};
