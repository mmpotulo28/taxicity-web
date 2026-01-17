/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	transpilePackages: ["@taxicity/ui", "@taxicity/utils"],
};

export default nextConfig;
