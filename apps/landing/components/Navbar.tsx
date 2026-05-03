"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeSwitch } from "./ThemeSwitch";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@heroui/button";
import { cn } from "@heroui/react";

export default function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<nav className={cn("fixed w-full z-50 transition-all duration-500 px-4", isScrolled ? "top-4" : "top-0")}>
			<div className={cn("max-w-7xl mx-auto transition-all duration-500 rounded-[2rem]", isScrolled ? "bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-default-200/50 dark:border-default-100/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] py-2" : "bg-transparent py-6")}>
				<div className='px-6 lg:px-8 flex justify-between items-center'>
					{/* Branding */}
					<Link href='/' className='flex-shrink-0 flex items-center gap-3 group'>
						<div className='w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform'>
							<span className='font-black text-black text-sm tracking-tighter'>TC</span>
						</div>
						<span className='font-black text-2xl tracking-tightest text-default-900 dark:text-white'>TaxiCiTi</span>
					</Link>

					{/* Desktop Navigation */}
					<div className='hidden md:flex items-center gap-1 bg-default-100/50 dark:bg-default-50/5 p-1 rounded-full border border-default-200/50 dark:border-default-100/10'>
						<NavLinks />
					</div>

					{/* Right Side Actions */}
					<div className='flex items-center gap-4'>
						<Link href='https://app.taxyciti.net' className='text-sm font-bold text-default-600 dark:text-default-400 hover:text-primary transition-colors hidden lg:block'>
							Sign In
						</Link>
						<div className='h-6 w-px bg-default-200 dark:bg-default-800 mx-2 hidden lg:block' />
						<ThemeSwitch />
						<Button as={Link} href='#download' className='hidden sm:flex bg-primary text-black font-bold rounded-full px-6 hover:scale-105 transition-transform' size='md'>
							Get Started
						</Button>
						<button className='md:hidden p-2 text-default-900 dark:text-white' onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
							{isMobileMenuOpen ? <X /> : <Menu />}
						</button>
					</div>
				</div>

				{/* Mobile Menu Overlay */}
				<div className={cn("md:hidden absolute top-full left-0 right-0 mt-4 bg-white dark:bg-black border border-default-200 dark:border-default-800 rounded-3xl p-6 transition-all duration-300 origin-top shadow-2xl", isMobileMenuOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-95 opacity-0 pointer-events-none")}>
					<div className='flex flex-col gap-4'>
						<NavLinks isMobile onClick={() => setIsMobileMenuOpen(false)} />
						<hr className='border-default-100 dark:border-default-900 my-2' />
						<Link href='https://app.taxyciti.net' className='text-lg font-bold text-center py-2'>
							Sign In
						</Link>
						<Button as={Link} href='#download' className='w-full bg-primary text-black font-bold h-14 rounded-2xl' onClick={() => setIsMobileMenuOpen(false)}>
							Download App <ArrowRight className='ml-2 w-4 h-4' />
						</Button>
					</div>
				</div>
			</div>
		</nav>
	);
}

function NavLinks({ isMobile, onClick }: { isMobile?: boolean; onClick?: () => void }) {
	const links = [
		{ name: "Home", href: "/" },
		{ name: "Features", href: "#features" },
		{ name: "Ecosystem", href: "#download" },
		{ name: "FAQs", href: "/faqs" },
	];

	return (
		<>
			{links.map((link) => (
				<Link key={link.name} href={link.href} onClick={onClick} className={cn("transition-all duration-200 font-bold tracking-tight", isMobile ? "text-2xl py-2 text-default-900 dark:text-white" : "px-5 py-2 text-sm rounded-full text-default-600 dark:text-default-400 hover:text-primary dark:hover:text-primary hover:bg-default-100 dark:hover:bg-default-800")}>
					{link.name}
				</Link>
			))}
		</>
	);
}
