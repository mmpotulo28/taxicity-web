import React from "react";
import Link from "next/link";
import { ThemeSwitch } from "./ThemeSwitch";

export default function Navbar() {
	return (
		<nav className='fixed w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center h-16'>
					<div className='flex-shrink-0 flex items-center gap-2'>
						{/* Logo placeholder - replace with actual Image component */}
						<div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
							<span className='font-bold text-black text-xs'>TC</span>
						</div>
						<span className='font-bold text-xl tracking-tight text-default-900 dark:text-white'>TaxiCiTi</span>
					</div>

					<div className='hidden md:flex items-center space-x-8 text'>
						<Link href='/' className='text-primary hover:text-primary-400 font-medium transition-colors'>
							Home
						</Link>
						<Link href='#features' className='text-default-800 hover:text-primary-400 font-medium transition-colors'>
							Features
						</Link>
						<Link href='#solutions' className='text-default-800 hover:text-primary-400 font-medium transition-colors'>
							Solutions
						</Link>
						<Link href='#download' className='text-default-800 hover:text-primary-400 font-medium transition-colors'>
							Download
						</Link>
					</div>

					<div className='flex items-center gap-4'>
						<Link href='https://app.taxyciti.net' className='text-sm font-medium text-default-800 hover:text-primary hidden sm:block'>
							Sign In
						</Link>
						<ThemeSwitch />
						<Link href='#download' className='bg-primary text-white px-5 py-2.5 rounded-full font-medium text-sm hover:bg-default-800 dark:hover:bg-default-200 transition-all shadow-lg shadow-default-200 dark:shadow-none'>
							Get Started
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
}
