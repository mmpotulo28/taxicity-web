/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: ["@taxiciti/ui", "@taxiciti/configs"],
	experimental: {
		turbopackUseSystemTlsCerts: true,
	},
};

export default nextConfig;
