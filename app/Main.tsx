"use client";
import { motion } from "framer-motion";

const Main = ({ children }: { children: React.ReactNode }) => {
	return (
		<motion.main
			className="flex-1 overflow-hidden"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}>
			{children}
		</motion.main>
	);
};

export { Main };
