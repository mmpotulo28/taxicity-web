"use client";
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, Shield, BarChart3, Users, CheckCircle2, Quote, Plus, Wallet, Smartphone, Navigation2 } from "lucide-react";
import { Button } from "@heroui/button";
import { cn } from "@heroui/react";

export default function Home() {
	return (
		<div className='min-h-screen bg-background dark:bg-[#030303] font-sans selection:bg-primary selection:text-black transition-colors duration-700'>
			<Navbar />

			{/* Hero Section */}
			<section className='relative min-h-[95vh] flex items-center justify-center pt-24 lg:pt-32 pb-20 overflow-hidden'>
				{/* Dynamic Background System */}
				<div className='absolute inset-0 z-0 overflow-hidden pointer-events-none'>
					<div className='absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-primary/20 dark:bg-primary/10 blur-[140px] rounded-full animate-pulse opacity-60' />
					<div className='absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-primary/15 dark:bg-primary/5 blur-[120px] rounded-full animate-pulse opacity-40' style={{ animationDelay: "3s" }} />

					{/* Sophisticated Grid */}
					<div className='absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]' />

					{/* Subtle Grain Overlay */}
					<div className='absolute inset-0 opacity-[0.03] dark:opacity-[0.06] bg-[url("https://grainy-gradients.vercel.app/noise.svg")] brightness-100 invert dark:invert-0' />
				</div>

				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
					<div className='flex flex-col items-center text-center'>
						{/* Animated Badge */}
						<div className='inline-flex items-center gap-3 px-5 py-2 rounded-full border border-default-200 dark:border-default-100/10 bg-background/40 dark:bg-black/40 backdrop-blur-xl mb-12 shadow-xl shadow-black/5 animate-appearance-in'>
							<div className='relative flex h-3 w-3'>
								<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75'></span>
								<span className='relative inline-flex rounded-full h-3 w-3 bg-primary'></span>
							</div>
							<span className='text-[10px] font-black uppercase tracking-[0.3em] text-default-800 dark:text-primary-400'>Transport Revolution 2025</span>
						</div>

						{/* Massive Typography Treatment */}
						<h1 className='text-7xl md:text-[10rem] lg:text-[12rem] font-black tracking-tightest leading-[0.75] mb-12 select-none'>
							<span className='block text-default-900 dark:text-white'>RIDE</span>
							<span className='block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary to-primary-600'>SMARTER.</span>
						</h1>

						{/* Refined Description */}
						<p className='text-lg md:text-2xl text-default-500 dark:text-default-400 max-w-3xl mx-auto mb-16 leading-relaxed font-normal px-4'>
							The minibus taxi industry is moving digital. <br className='hidden md:block' />
							Experience zero-cash payments, live tracking, and elite safety features on South Africa&apos;s premier platform.
						</p>

						{/* Action Buttons */}
						<div className='flex flex-col sm:flex-row gap-5 w-full sm:w-auto px-6'>
							<Button as={Link} href='#download' className='h-16 px-12 text-xl font-black bg-primary text-black rounded-2xl group shadow-[0_20px_60px_rgba(251,191,36,0.3)] hover:shadow-primary/50 hover:translate-y-[-4px] transition-all duration-300'>
								Get Started
								<ArrowRight className='ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform' />
							</Button>
							<Button as={Link} href='#download' variant='flat' className='h-16 px-12 text-lg font-bold rounded-2xl backdrop-blur-xl border border-default-200/50 dark:border-default-100/10 hover:bg-default-100 dark:hover:bg-default-50/10 transition-all'>
								For Operators
							</Button>
						</div>

						{/* Floating Stats / Social Proof Bar */}
						<div className='mt-24 pt-12 border-t border-default-200/50 dark:border-default-100/10 w-full max-w-4xl flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-default'>
							<div className='flex items-center gap-3'>
								<Users className='w-5 h-5 text-primary' />
								<span className='text-sm font-black uppercase tracking-widest'>1M+ Commuters</span>
							</div>
							<div className='flex items-center gap-3'>
								<Shield className='w-5 h-5 text-primary' />
								<span className='text-sm font-black uppercase tracking-widest'>Vetted Safety</span>
							</div>
							<div className='flex items-center gap-3'>
								<Navigation2 className='w-5 h-5 text-primary' />
								<span className='text-sm font-black uppercase tracking-widest'>Live ETA</span>
							</div>
						</div>
					</div>
				</div>

				{/* Refined Scroll Indicator */}
				<div className='absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-3 animate-bounce opacity-40'>
					<span className='text-[8px] font-bold uppercase tracking-[0.4em] rotate-90 mb-4'>Explore</span>
					<div className='w-1 h-12 bg-gradient-to-b from-primary to-transparent rounded-full' />
				</div>
			</section>

			{/* Ecosystem Section */}
			<section id='download' className='py-32 relative'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6'>
						<div className='max-w-2xl'>
							<h2 className='text-sm font-bold tracking-[0.3em] uppercase text-primary mb-6'>The Ecosystem</h2>
							<h3 className='text-5xl md:text-6xl font-black text-default-900 dark:text-white leading-tight'>
								One Platform. <br />
								Infinite Journeys.
							</h3>
						</div>
						<p className='text-default-500 dark:text-default-400 text-xl max-w-sm'>Powerful tools designed for the unique needs of commuters and drivers.</p>
					</div>

					<div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
						<AppCard title='Commuter App' role='Commuter' description='Book seats, pay with your digital wallet, and track your ride in real-time.' features={["Real-time ETA", "Zero-Cash Payments", "SOS Emergency Alert"]} color='bg-primary' link='https://linkflow.mpotulo.com/taxiciti-app' isMain />
						<AppCard title='Driver Suite' role='Driver' description='Maximize earnings with intelligent trip management and digital fare collection.' features={["Route Optimization", "Instant Settlements", "Fleet Analytics"]} color='bg-background' link='https://linkflow.mpotulo.com/taxiciti-driver' />
					</div>
				</div>
			</section>

			{/* Safety Feature Highlight */}
			<section className='py-24 bg-primary text-black overflow-hidden relative'>
				<div className='absolute top-0 right-0 w-1/2 h-full bg-black/5 -skew-x-12 translate-x-32' />
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
						<div>
							<Shield className='w-16 h-16 mb-8 text-black' />
							<h2 className='text-5xl font-black mb-6 tracking-tight text-black'>
								Your Safety is <br />
								Our Priority.
							</h2>
							<p className='text-xl mb-10 font-medium opacity-80 text-black'>We&apos;ve built state-of-the-art security features directly into the app to ensure every trip is monitored and every driver is vetted.</p>
							<div className='space-y-4'>
								{["Vetted & Licensed Drivers", "Real-time Trip Sharing", "24/7 Panic Response"].map((item) => (
									<div key={item} className='flex items-center gap-3 text-black'>
										<CheckCircle2 className='w-6 h-6' />
										<span className='text-lg font-bold'>{item}</span>
									</div>
								))}
							</div>
						</div>
						<div className='relative'>
							<div className='aspect-square bg-black/10 rounded-[4rem] flex items-center justify-center rotate-3 border-4 border-black/20'>
								<div className='w-4/5 h-4/5 bg-black rounded-[3rem] p-8 flex flex-col justify-between shadow-2xl'>
									<div className='w-12 h-1 bg-primary/20 rounded-full self-center' />
									<div className='flex-1 flex items-center justify-center'>
										<div className='text-center'>
											<div className='w-20 h-20 bg-red-500 rounded-full mx-auto mb-4 animate-pulse flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)]'>
												<span className='text-white font-black'>SOS</span>
											</div>
											<p className='text-white text-xs font-bold uppercase tracking-widest'>Emergency Panic Button</p>
										</div>
									</div>
									<div className='h-2 w-full bg-background/10 rounded-full overflow-hidden'>
										<div className='h-full w-2/3 bg-primary' />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features - Modern Bento */}
			<section id='features' className='py-32 bg-default-50 dark:bg-transparent'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6'>
						{/* Feature 1: Payments - Revamped with Visuals */}
						<div className='md:col-span-2 p-6 rounded-[2.5rem] bg-default-100 dark:bg-default-100/5 border border-default-200 dark:border-default-800 flex flex-col justify-between overflow-hidden relative group'>
							<div className='relative z-10'>
								<div className='mb-8 w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary'>
									<Wallet className='w-6 h-6' />
								</div>
								<h4 className='text-3xl font-bold mb-4 tracking-tight dark:text-white'>Instant Cashless Payments</h4>
								<p className='text-lg leading-relaxed text-default-500 dark:text-default-400 font-light max-w-sm'>No more searching for change. Tap, pay, and go using our integrated wallet system.</p>
							</div>

							{/* Payment Visual Mockup */}
							<div className='absolute -right-4 -bottom-4 w-64 h-48 bg-background dark:bg-default-50 rounded-tl-[2rem] shadow-2xl p-6 transition-transform group-hover:-translate-y-2 duration-500'>
								<div className='flex justify-between items-start mb-6'>
									<div className='space-y-1'>
										<p className='text-[10px] uppercase tracking-widest text-default-400 dark:text-default-500 font-bold'>Balance</p>
										<p className='text-2xl font-black dark:text-white'>R 450.00</p>
									</div>
									<div className='w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black'>
										<Plus className='w-5 h-5' />
									</div>
								</div>
								<div className='h-12 w-full bg-default-100 dark:bg-default-800 rounded-xl flex items-center px-4 gap-3'>
									<Smartphone className='w-4 h-4 text-primary' />
									<div className='h-2 w-24 bg-default-200 dark:bg-default-700 rounded-full' />
								</div>
							</div>
						</div>

						{/* Feature 2: Tracking - Revamped with Visuals */}
						<div className='md:row-span-2 p-6 rounded-[2.5rem] bg-background dark:bg-background-200 border border-default-800 flex flex-col justify-between relative overflow-hidden group'>
							<div className='relative z-10'>
								<div className='mb-8 w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary'>
									<Navigation2 className='w-6 h-6' />
								</div>
								<h4 className='text-3xl font-bold mb-4 tracking-tight text-foreground'>Live Map Precision</h4>
								<p className='text-lg leading-relaxed text-default-400 font-light'>Track your taxi in real-time. Know exactly when it arrives with sub-meter accuracy.</p>
							</div>

							{/* Map Visual Mockup */}
							<div className='mt-12 h-64 w-full bg-default-900 rounded-3xl relative overflow-hidden'>
								<div className='absolute inset-0 opacity-20 bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")]' />
								<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50' />
								<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-[0_0_20px_#fbbf24] animate-pulse'>
									<div className='absolute inset-0 rounded-full border-2 border-primary animate-ping' />
								</div>
							</div>
						</div>

						{/* Feature 3: Security - Revamped with Visuals */}
						<div className='md:col-span-1 p-6 rounded-[2.5rem] bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20 flex flex-col justify-between overflow-hidden relative group'>
							<div className='relative z-10'>
								<div className='mb-8 w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary'>
									<Shield className='w-6 h-6' />
								</div>
								<h4 className='text-2xl font-bold mb-4 tracking-tight dark:text-white'>Verified Safety</h4>
								<p className='text-lg leading-relaxed text-default-500 dark:text-default-400 font-light'>Background-checked drivers and trip monitoring.</p>
							</div>

							{/* Driver Profile Mockup Visual */}
							<div className='absolute -right-6 -bottom-6 w-44 h-52 bg-background dark:bg-background-200 rounded-2xl shadow-2xl p-4 transition-transform group-hover:-translate-y-3 duration-500'>
								<div className='flex flex-col items-center text-center'>
									<div className='relative mb-3'>
										<div className='w-14 h-14 rounded-full bg-gradient-to-br from-primary-200 to-primary-500' />
										<div className='absolute -bottom-1 -right-1 bg-primary rounded-full p-1 border-2 border-white dark:border-default-900'>
											<CheckCircle2 className='w-3 h-3 text-black' />
										</div>
									</div>
									<p className='text-[10px] font-black uppercase tracking-widest text-primary mb-1'>Identity Verified</p>
									<div className='w-16 h-1.5 bg-default-100 dark:bg-default-800 rounded-full mb-1' />
									<div className='w-10 h-1 bg-default-100 dark:bg-default-800 rounded-full' />
								</div>
							</div>
						</div>

						{/* Feature 4: Community */}
						<BentoCard className='md:col-span-2' icon={<Users className='w-10 h-10 text-primary' />} title='Built for the Community' description='The minibus taxi industry is the pulse of our nation. We are here to empower commuters and operators alike with world-class technology.' bg='bg-default-200/50 dark:bg-default-100/5' />

						{/* Feature 5: Analytics */}
						<BentoCard className='md:col-span-1' icon={<BarChart3 className='w-8 h-8 text-primary' />} title='Smart Data' description='Fleet insights for owners.' bg='bg-default-200/50 dark:bg-default-100/5' />
					</div>
				</div>
			</section>

			{/* Testimonial Section */}
			<section className='py-24 relative overflow-hidden'>
				<div className='max-w-7xl mx-auto px-4 text-center'>
					<Quote className='w-12 h-12 text-primary mx-auto mb-8 opacity-50' />
					<h3 className='text-3xl md:text-5xl font-bold dark:text-white max-w-4xl mx-auto leading-tight italic'>&quot;TaxiCiTi has completely changed my daily commute. I no longer carry cash, and I know exactly when my taxi will arrive.&quot;</h3>
					<div className='mt-12'>
						<div className='w-16 h-16 bg-default-200 rounded-full mx-auto mb-4 overflow-hidden'>
							<div className='w-full h-full bg-gradient-to-tr from-primary to-orange-500' />
						</div>
						<p className='font-black text-lg dark:text-white'>Lerato Mokoena</p>
						<p className='text-default-500 text-sm'>Johannesburg Commuter</p>
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className='py-32 bg-default-50 dark:bg-default-100/5'>
				<div className='max-w-4xl mx-auto px-4'>
					<div className='text-center mb-20 animate-appearance-in'>
						<h2 className='text-4xl font-black mb-4 dark:text-white'>Common Questions</h2>
						<p className='text-default-500 dark:text-default-400'>Everything you need to know about South Africa&apos;s digital taxi revolution.</p>
					</div>
					<div className='space-y-4'>
						<FAQItem question='How do I pay for my ride?' answer='You can top up your TaxiCiTi wallet via Instant EFT, Card, or at any supported retail point. Once your wallet is funded, simply scan the QR code in the taxi.' />
						<FAQItem question='Is the app available nationwide?' answer='We are currently live in major routes across Gauteng, Western Cape, and KZN, with weekly expansions to other provinces.' />
						<FAQItem question='How does the SOS button work?' answer='In an emergency, holding the SOS button for 3 seconds alerts our 24/7 command center and shares your live location with local security services.' />
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<section className='py-32 bg-background dark:bg-[#030303]'>
				<div className='max-w-7xl mx-auto px-4'>
					<div className='relative bg-black rounded-[4rem] p-12 md:p-24 overflow-hidden border border-default-800 shadow-[0_40px_100px_rgba(0,0,0,0.4)]'>
						{/* High-End Visual Background */}
						<div className='absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,#fbbf2415,transparent_50%)] pointer-events-none' />
						<div className='absolute -right-20 -top-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none' />
						<div className='absolute inset-0 bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")] opacity-[0.03] pointer-events-none' />

						<div className='relative z-10 flex flex-col items-center text-center'>
							<h2 className='text-6xl md:text-8xl font-black text-white mb-8 tracking-tightest leading-[0.9] select-none'>
								READY TO MOVE <br />
								<span className='text-primary'>SMARTER?</span>
							</h2>
							<p className='text-default-400 text-xl md:text-2xl mb-12 max-w-2xl font-light leading-relaxed'>Join thousands of commuters already experiencing the digital revolution. Get the app today.</p>

							<div className='flex flex-col sm:flex-row gap-6 items-center'>
								<Button as={Link} href='#download' className='h-16 px-12 text-xl font-black bg-primary text-black rounded-2xl shadow-[0_20px_40px_rgba(251,191,36,0.2)] hover:scale-105 transition-transform'>
									Download for Android
								</Button>
								<div className='flex items-center gap-4 px-6 py-4 rounded-2xl border border-default-800 bg-background/5 backdrop-blur-md'>
									<Smartphone className='w-6 h-6 text-primary' />
									<div className='text-left'>
										<p className='text-[10px] uppercase tracking-widest text-default-500 font-bold'>iOS Version</p>
										<p className='text-sm text-white font-bold'>Coming Soon</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}

interface AppCardProps {
	title: string;
	role: string;
	description: string;
	features: string[];
	color: string;
	link: string;
	isMain?: boolean;
}

function AppCard({ title, role, description, features, color, link, isMain }: Readonly<AppCardProps>) {
	return (
		<div className={cn("relative p-12 rounded-[3rem] border border-default-200 dark:border-default-100/10 overflow-hidden group transition-all duration-500", isMain ? "bg-default-900 dark:bg-default-100/5" : "bg-background dark:bg-[#0a0a0a]")}>
			<div className='relative z-10'>
				<div className={cn("inline-block px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-6", isMain ? "bg-primary text-black" : "bg-default-100 text-default-600 dark:bg-default-800 dark:text-default-400")}>{role}</div>
				<h3 className={cn("text-4xl font-bold mb-6 tracking-tight", isMain ? "text-white" : "text-default-900 dark:text-white")}>{title}</h3>
				<p className={cn("text-xl mb-10 max-w-sm font-light", isMain ? "text-default-400" : "text-default-600 dark:text-default-500")}>{description}</p>

				<div className='space-y-4 mb-12'>
					{features.map((f) => (
						<div key={f} className='flex items-center gap-3'>
							<div className='w-2 h-2 rounded-full bg-primary' />
							<span className={cn("text-sm font-medium", isMain ? "text-default-300" : "text-default-600 dark:text-default-400")}>{f}</span>
						</div>
					))}
				</div>

				<div className='flex flex-wrap gap-4'>
					<Link href={link} target='_blank'>
						<Button className={cn("h-12 px-6 rounded-xl font-bold", isMain ? "bg-background text-black" : "bg-primary text-black")}>Download Now</Button>
					</Link>
					{!isMain && (
						<Link href={link} target='_blank' rel='noopener noreferrer'>
							<Button variant='bordered' className='h-12 px-6 rounded-xl font-bold dark:border-default-800'>
								Learn More
							</Button>
						</Link>
					)}
				</div>
			</div>

			{/* Decorative Phone Mockup */}
			<div className='absolute -right-20 -bottom-20 w-80 h-[500px] bg-default-800 dark:bg-black rounded-[3rem] border-8 border-default-700/50 shadow-2xl rotate-[12deg] transition-transform duration-700 group-hover:rotate-[8deg] group-hover:-translate-y-4 opacity-40 md:opacity-100'>
				<div className='absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 bg-default-700 rounded-b-2xl' />
				<div className='p-6 pt-12 space-y-4'>
					<div className='w-full h-8 bg-default-700/30 rounded-lg animate-pulse' />
					<div className='w-3/4 h-4 bg-default-700/30 rounded-lg' />
					<div className='w-full h-40 bg-default-700/20 rounded-2xl border border-default-700/50' />
				</div>
			</div>
		</div>
	);
}

interface BentoCardProps {
	className?: string;
	icon: React.ReactNode;
	title: string;
	description: string;
	bg: string;
	textColor?: string;
}

function BentoCard({ className, icon, title, description, bg, textColor = "text-default-900 dark:text-white" }: BentoCardProps) {
	return (
		<div className={cn("p-10 rounded-[2.5rem] flex flex-col justify-between transition-all hover:scale-[1.01] border border-transparent hover:border-primary/20 duration-300", bg, className)}>
			<div className='mb-8'>{icon}</div>
			<div>
				<h4 className={cn("text-2xl font-bold mb-4 tracking-tight", textColor)}>{title}</h4>
				<p className={cn("text-lg leading-relaxed font-light", textColor === "text-default-900 dark:text-white" ? "text-default-600 dark:text-default-400" : "opacity-70")}>{description}</p>
			</div>
		</div>
	);
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
	return (
		<div className='p-8 bg-background dark:bg-black/40 rounded-3xl border border-default-200 dark:border-default-800 hover:border-primary/50 transition-colors group'>
			<div className='flex items-center justify-between mb-4'>
				<h4 className='text-xl font-bold group-hover:text-primary transition-colors'>{question}</h4>
				<Plus className='w-5 h-5 text-default-400 group-hover:text-primary' />
			</div>
			<p className='text-default-500 dark:text-default-400 leading-relaxed'>{answer}</p>
		</div>
	);
}
