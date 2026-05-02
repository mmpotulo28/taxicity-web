export type SiteConfig = typeof siteConfig;

export const siteConfig = {
	name: "TaxiCity",
	description: "South Africa's premier taxi booking platform. Connect with registered taxi drivers for safe, reliable transportation across major cities.",
	navItems: [
		{
			label: "Home",
			href: "/",
		},
		{
			label: "Book Ride",
			href: "/ride/route",
		},
		{
			label: "Trip History",
			href: "/ride/trip/history",
		},
		{
			label: "Support",
			href: "/support",
		},
		{
			label: "Settings",
			href: "/settings",
		},
	],
	navMenuItems: [
		{
			label: "Profile",
			href: "/profile",
		},
		{
			label: "Trip History",
			href: "/ride/trip/history",
		},
		{
			label: "Settings",
			href: "/settings",
		},
		{
			label: "Support",
			href: "/support",
		},
		{
			label: "Help & Feedback",
			href: "/help-feedback",
		},
		{
			label: "Sign Out",
			href: "/sign-out",
		},
	],
	links: {
		github: "https://github.com/taxiciti/taxiciti-app",
		twitter: "https://twitter.com/taxiciti_za",
		docs: "https://docs.taxiciti.co.za",
		discord: "https://discord.gg/taxiciti",
		sponsor: "https://taxiciti.co.za/sponsor",
	},
};
