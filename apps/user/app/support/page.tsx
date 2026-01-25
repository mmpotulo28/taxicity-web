"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
	Accordion,
	AccordionItem,
	Button,
	Card,
	CardBody,
	Input,
	Textarea,
	Divider,
	Tabs,
	Tab,
} from "@heroui/react";
import { Icon } from "@iconify/react";

const Support: React.FC = () => {
	const [activeTab, setActiveTab] = useState("faq");
	const [contactForm, setContactForm] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});

	const handleFormChange = (field: string, value: string) => {
		setContactForm((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmitForm = () => {
		// In a real app, this would send the form data to a server
		alert("Thank you for your message. Our support team will get back to you soon.");
		setContactForm({
			name: "",
			email: "",
			subject: "",
			message: "",
		});
	};

	return (
		<motion.div
			animate={{ opacity: 1 }}
			className="h-full flex flex-col"
			initial={{ opacity: 0 }}
			transition={{ duration: 0.3 }}>
			<div className="p-4 bg-background shadow-sm">
				<h2 className="text-lg font-semibold mb-4">Support Center</h2>

				<Tabs
					aria-label="Support options"
					color="primary"
					selectedKey={activeTab}
					variant="underlined"
					onSelectionChange={(key) => setActiveTab(key as string)}>
					<Tab key="faq" title="FAQ" />
					<Tab key="contact" title="Contact Us" />
					<Tab key="help" title="Help Topics" />
				</Tabs>
			</div>

			<div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
				{activeTab === "faq" && (
					<div className="flex flex-1 flex-col	gap-4 justify-between h-full">
						<Accordion variant="splitted">
							<AccordionItem
								key="1"
								aria-label="How does TaxiCity work?"
								title="How does TaxiCity work?">
								<p className="text-sm text-default-600">
									TaxiCity connects passengers with South African taxi drivers.
									You can select a route, specify your pickup and drop-off
									locations, and request a ride. The app matches you with
									available taxis on your route. You can pay with cash or scan a
									QR code for added security.
								</p>
							</AccordionItem>

							<AccordionItem
								key="2"
								aria-label="How do I pay for my ride?"
								title="How do I pay for my ride?">
								<p className="text-sm text-default-600">
									TaxiCity supports cash payments, which is the traditional
									payment method for South African taxis. For added security and
									convenience, you can also scan the driver&apos;s QR code to
									confirm confirm confirm your ride and payment. The fare is
									calculated route and distance.
								</p>
							</AccordionItem>

							<AccordionItem
								key="3"
								aria-label="What if my driver doesn't arrive?"
								title="What if my driver doesn't arrive?">
								<p className="text-sm text-default-600">
									If your driver doesn&apos;t arrive within the estimated time,
									you can cancel the ride without any penalty and request a new
									one. You can also contact our support team for assistance by
									using the &quot;Contact Us&quot; tab in the Support Center.
								</p>
							</AccordionItem>

							<AccordionItem
								key="4"
								aria-label="How do I report an issue with my ride?"
								title="How do I report an issue with my ride?">
								<p className="text-sm text-default-600">
									You can report issues through the app by going to your Trip
									History, selecting the specific trip, and using the &quot;Report
									Issue&quot; option. Alternatively, you can contact our support
									team directly through the &quot;Contact Us&quot; section in
									Center.
								</p>
							</AccordionItem>

							<AccordionItem
								key="5"
								aria-label="Is TaxiCity available in all South African cities?"
								title="Is TaxiCity available in all South African cities?">
								<p className="text-sm text-default-600">
									TaxiCity is currently available in major South African cities
									including Johannesburg, Pretoria, Cape Town, and Durban.
									We&apos;re continuously expanding to more areas. Check the app
									for available routes and ranks in your area.
								</p>
							</AccordionItem>
						</Accordion>

						<div className="bg-default-50 p-4 rounded-medium">
							<div className="flex items-start gap-3">
								<Icon className="text-primary mt-1" icon="lucide:phone" />
								<div>
									<h4 className="font-medium">Emergency Contact</h4>
									<p className="text-sm text-default-500 mt-1">
										For urgent assistance, call our 24/7 support line:
									</p>
									<p className="text-sm font-medium mt-1">0800 123 456</p>
								</div>
							</div>
						</div>
					</div>
				)}

				{activeTab === "contact" && (
					<Card>
						<CardBody className="p-4">
							<h3 className="font-medium mb-4">Contact Support Team</h3>

							<div className="space-y-4">
								<Input
									label="Your Name"
									placeholder="Enter your full name"
									value={contactForm.name}
									onValueChange={(value) => handleFormChange("name", value)}
								/>

								<Input
									label="Email Address"
									placeholder="Enter your email"
									type="email"
									value={contactForm.email}
									onValueChange={(value) => handleFormChange("email", value)}
								/>

								<Input
									label="Subject"
									placeholder="What is this regarding?"
									value={contactForm.subject}
									onValueChange={(value) => handleFormChange("subject", value)}
								/>

								<Textarea
									label="Message"
									minRows={4}
									placeholder="Please describe your issue or question in detail"
									value={contactForm.message}
									onValueChange={(value) => handleFormChange("message", value)}
								/>

								<Button
									className="w-full"
									color="primary"
									isDisabled={
										!contactForm.name ||
										!contactForm.email ||
										!contactForm.message
									}
									onPress={handleSubmitForm}>
									Submit
								</Button>
							</div>

							<Divider className="my-4" />

							<div className="space-y-3">
								<div className="flex items-center gap-2">
									<Icon className="text-primary" icon="lucide:phone" />
									<div>
										<p className="text-sm font-medium">Call Support</p>
										<p className="text-xs text-default-500">
											0800 123 456 (Toll-free)
										</p>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<Icon className="text-primary" icon="lucide:mail" />
									<div>
										<p className="text-sm font-medium">Email Support</p>
										<p className="text-xs text-default-500">
											support@taxyciti.co.za
										</p>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<Icon className="text-primary" icon="lucide:clock" />
									<div>
										<p className="text-sm font-medium">Operating Hours</p>
										<p className="text-xs text-default-500">
											Monday to Sunday: 6:00 AM - 10:00 PM
										</p>
									</div>
								</div>
							</div>
						</CardBody>
					</Card>
				)}

				{activeTab === "help" && (
					<div className="space-y-4">
						<Card>
							<CardBody className="p-4">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
										<Icon className="text-primary" icon="lucide:user" />
									</div>
									<div>
										<h3 className="font-medium">Account & Profile</h3>
										<p className="text-xs text-default-500">
											Manage your account settings and personal information
										</p>
									</div>
									<Button
										isIconOnly
										aria-label="View account help topics"
										className="ml-auto"
										variant="light">
										<Icon icon="lucide:chevron-right" />
									</Button>
								</div>
							</CardBody>
						</Card>

						<Card>
							<CardBody className="p-4">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
										<Icon className="text-primary" icon="lucide:taxi" />
									</div>
									<div>
										<h3 className="font-medium">Booking & Rides</h3>
										<p className="text-xs text-default-500">
											Learn how to book and manage your taxi rides
										</p>
									</div>
									<Button
										isIconOnly
										aria-label="View booking help topics"
										className="ml-auto"
										variant="light">
										<Icon icon="lucide:chevron-right" />
									</Button>
								</div>
							</CardBody>
						</Card>

						<Card>
							<CardBody className="p-4">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
										<Icon className="text-primary" icon="lucide:credit-card" />
									</div>
									<div>
										<h3 className="font-medium">Payments & Billing</h3>
										<p className="text-xs text-default-500">
											Information about payment methods and fares
										</p>
									</div>
									<Button
										isIconOnly
										aria-label="View payment help topics"
										className="ml-auto"
										variant="light">
										<Icon icon="lucide:chevron-right" />
									</Button>
								</div>
							</CardBody>
						</Card>

						<Card>
							<CardBody className="p-4">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
										<Icon className="text-primary" icon="lucide:shield" />
									</div>
									<div>
										<h3 className="font-medium">Safety & Security</h3>
										<p className="text-xs text-default-500">
											Tips and information about staying safe while using
											TaxiCity
										</p>
									</div>
									<Button
										isIconOnly
										aria-label="View safety help topics"
										className="ml-auto"
										variant="light">
										<Icon icon="lucide:chevron-right" />
									</Button>
								</div>
							</CardBody>
						</Card>

						<Card>
							<CardBody className="p-4">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
										<Icon className="text-primary" icon="lucide:map" />
									</div>
									<div>
										<h3 className="font-medium">Routes & Ranks</h3>
										<p className="text-xs text-default-500">
											Information about taxi routes and ranks in your area
										</p>
									</div>
									<Button
										isIconOnly
										aria-label="View routes help topics"
										className="ml-auto"
										variant="light">
										<Icon icon="lucide:chevron-right" />
									</Button>
								</div>
							</CardBody>
						</Card>
					</div>
				)}
			</div>
		</motion.div>
	);
};

export default Support;
