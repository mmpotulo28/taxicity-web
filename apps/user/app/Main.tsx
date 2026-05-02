"use client";
import { motion } from "framer-motion";

const Main = ({ children }: { children: React.ReactNode }) => {
	return (
		<motion.main animate={{ opacity: 1 }} className='flex-1 overflow-hidden mb-16' initial={{ opacity: 0 }} transition={{ duration: 0.3 }}>
			{children}
		</motion.main>
	);
};

export { Main };
