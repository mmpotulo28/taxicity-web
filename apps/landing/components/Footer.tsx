import React from "react";
import Link from "next/link";
import { Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
	return (
		<footer className='bg-default-300 border-t border-default-100 pt-16 pb-12'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='grid grid-cols-1 md:grid-cols-4 gap-12 mb-12'>
					<div className='space-y-4'>
						<div className='flex items-center gap-2'>
							<div className='w-6 h-6 bg-primary rounded flex items-center justify-center'>
								<span className='font-bold text-black text-[10px]'>TC</span>
							</div>
							<span className='font-bold text-xl text-default-900 dark:text-white'>TaxiCiTi</span>
						</div>
						<p className='text-default-700 text-sm leading-relaxed'>Transforming the shared taxi industry with digital innovation, safety, and efficiency.</p>
					</div>

					<div>
						<h3 className='font-semibold text-default-900 dark:text-white mb-4'>Platform</h3>
						<ul className='space-y-3 text-sm text-default-800'>
							<li>
								<Link href='https://linkflow.mpotulo.com/taxiciti-app' className='hover:text-primary transition-colors'>
									Passenger App
								</Link>
							</li>
							<li>
								<Link href='https://linkflow.mpotulo.com/taxiciti-driver' className='hover:text-primary transition-colors'>
									Driver Portal
								</Link>
							</li>
							<li>
								<Link href='https://mpotulo.com' className='hover:text-primary transition-colors'>
									Mpotulo Inc.
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h3 className='font-semibold text-default-900 dark:text-white mb-4'>Company</h3>
						<ul className='space-y-3 text-sm text-default-800'>
							<li>
								<Link href='/about' className='hover:text-primary transition-colors'>
									About Us
								</Link>
							</li>
							<li>
								<Link href='/safety' className='hover:text-primary transition-colors'>
									Safety
								</Link>
							</li>
							<li>
								<Link href='/contact' className='hover:text-primary transition-colors'>
									Contact
								</Link>
							</li>
							<li>
								<Link href='/faqs' className='hover:text-primary transition-colors'>
									FAQs
								</Link>
							</li>
							<li>
								<Link href='/privacy' className='hover:text-primary transition-colors'>
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link href='/terms' className='hover:text-primary transition-colors'>
									Terms of Service
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h3 className='font-semibold text-default-900 dark:text-white mb-4'>Connect</h3>
						<div className='flex space-x-4'>
							<a href='https://twitter.com' target='_blank' rel='noopener noreferrer' className='text-default-700 hover:text-primary transition-colors'>
								<Twitter className='w-5 h-5' />
							</a>
							<a href='https://instagram.com' target='_blank' rel='noopener noreferrer' className='text-default-700 hover:text-primary transition-colors'>
								<Instagram className='w-5 h-5' />
							</a>
							<a href='https://linkedin.com' target='_blank' rel='noopener noreferrer' className='text-default-700 hover:text-primary transition-colors'>
								<Linkedin className='w-5 h-5' />
							</a>
						</div>
					</div>
				</div>

				<div className='border-t border-default-200 dark:border-default-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
					<p className='text-sm text-default-700'>© {new Date().getFullYear()} TaxiCiTi Technologies. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}
