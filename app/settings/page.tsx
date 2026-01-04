"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
	Button,
	Card,
	CardBody,
	Divider,
	Switch,
	Avatar,
	Input,
	Tabs,
	Tab,
	Select,
	SelectItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

const Settings: React.FC = () => {
	const router = useRouter();
	const { setTheme, theme } = useTheme();
	const [activeTab, setActiveTab] = useState("profile");
	const [profileForm, setProfileForm] = useState({
		name: "John Doe",
		email: "john.doe@example.com",
		phone: "071 234 5678",
	});

	const [preferences, setPreferences] = useState({
		notifications: true,
		locationSharing: true,
		darkMode: false,
		language: "english",
	});

	const toggleDarkMode = () => {
		const newTheme = theme === "dark" ? "light" : "dark";

		setTheme(newTheme);
		setPreferences((prev) => ({
			...prev,
			darkMode: !prev.darkMode,
		}));
	};

	const handleProfileChange = (field: string, value: string) => {
		setProfileForm((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleToggleChange = (field: string, value: boolean) => {
		setPreferences((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleLanguageChange = (value: string) => {
		setPreferences((prev) => ({
			...prev,
			language: value,
		}));
	};

	const handleSaveProfile = () => {
		// In a real app, this would save the profile data to a server
		alert("Profile updated successfully");
	};

	return (
		<motion.div
			animate={{ opacity: 1 }}
			className="h-full flex flex-col"
			initial={{ opacity: 0 }}
			transition={{ duration: 0.3 }}>
			<div className="p-4 bg-background shadow-sm">
				<h2 className="text-lg font-semibold mb-4">Settings</h2>

				<Tabs
					aria-label="Settings options"
					color="primary"
					selectedKey={activeTab}
					variant="underlined"
					onSelectionChange={(key) => setActiveTab(key as string)}>
					<Tab key="profile" title="Profile" />
					<Tab key="preferences" title="Preferences" />
					<Tab key="payment" title="Payment" />
				</Tabs>
			</div>

			<div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
				{activeTab === "profile" && (
					<Card>
						<CardBody className="p-4">
							<div className="flex flex-col items-center mb-6">
								<Avatar
									className="w-20 h-20"
									src="https://img.heroui.chat/image/avatar?w=100&h=100&u=user1"
								/>
								<Button className="mt-2" color="primary" size="sm" variant="flat">
									Change Photo
								</Button>
							</div>

							<div className="space-y-4">
								<Input
									label="Full Name"
									value={profileForm.name}
									onValueChange={(value) => handleProfileChange("name", value)}
								/>

								<Input
									label="Email Address"
									type="email"
									value={profileForm.email}
									onValueChange={(value) => handleProfileChange("email", value)}
								/>

								<Input
									label="Phone Number"
									value={profileForm.phone}
									onValueChange={(value) => handleProfileChange("phone", value)}
								/>

								<Button
									className="w-full"
									color="primary"
									onPress={handleSaveProfile}>
									Save Changes
								</Button>
							</div>

							<div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-900/50">
								<div className="flex items-center gap-3 mb-3">
									<div className="p-2 bg-primary text-white rounded-lg">
										<Icon icon="lucide:car-taxi-front" className="text-xl" />
									</div>
									<div>
										<h3 className="font-bold text-primary-900 dark:text-primary-100">Driver Mode</h3>
										<p className="text-xs text-primary-600 dark:text-primary-300">Earn money by driving with TaxiCity</p>
									</div>
								</div>
								<Button
									className="w-full font-semibold"
									color="primary"
									onPress={() => router.push("/driver")}
								>
									Switch to Driver App
								</Button>
							</div>

							<Divider className="my-6" />

							<div className="space-y-4">
								<h3 className="font-medium">Account Security</h3>

								<Button
									className="w-full"
									color="primary"
									startContent={<Icon icon="lucide:lock" />}
									variant="flat">
									Change Password
								</Button>

								<Button
									className="w-full"
									color="primary"
									startContent={<Icon icon="lucide:shield" />}
									variant="flat">
									Two-Factor Authentication
								</Button>

								<Button
									className="w-full"
									color="danger"
									startContent={<Icon icon="lucide:log-out" />}
									variant="flat">
									Sign Out
								</Button>
							</div>
						</CardBody>
					</Card>
				)}

				{activeTab === "preferences" && (
					<div className="space-y-4">
						<Card>
							<CardBody className="p-4">
								<h3 className="font-medium mb-4">App Preferences</h3>

								<div className="space-y-4">
									<div className="flex justify-between items-center">
										<div>
											<p className="font-medium">Push Notifications</p>
											<p className="text-xs text-default-500">
												Receive alerts about your rides
											</p>
										</div>
										<Switch
											color="primary"
											isSelected={preferences.notifications}
											onValueChange={(value) =>
												handleToggleChange("notifications", value)
											}
										/>
									</div>

									<Divider />

									<div className="flex justify-between items-center">
										<div>
											<p className="font-medium">Location Sharing</p>
											<p className="text-xs text-default-500">
												Allow app to access your location
											</p>
										</div>
										<Switch
											color="primary"
											isSelected={preferences.locationSharing}
											onValueChange={(value) =>
												handleToggleChange("locationSharing", value)
											}
										/>
									</div>

									<Divider />

									<div className="flex justify-between items-center">
										<div>
											<p className="font-medium">Dark Mode</p>
											<p className="text-xs text-default-500">
												Use dark theme for the app
											</p>
										</div>
										<Switch
											color="primary"
											isSelected={preferences.darkMode}
											onValueChange={toggleDarkMode}
										/>
									</div>
								</div>
							</CardBody>
						</Card>

						<Card>
							<CardBody className="p-4">
								<h3 className="font-medium mb-4">Language & Region</h3>

								<Select
									label="Language"
									selectedKeys={[preferences.language]}
									onSelectionChange={(keys) => {
										const selected = Array.from(keys)[0] as string;

										handleLanguageChange(selected);
									}}>
									<SelectItem key="english">English</SelectItem>
									<SelectItem key="afrikaans">Afrikaans</SelectItem>
									<SelectItem key="zulu">isiZulu</SelectItem>
									<SelectItem key="xhosa">isiXhosa</SelectItem>
									<SelectItem key="sotho">Sesotho</SelectItem>
								</Select>
							</CardBody>
						</Card>

						<Card>
							<CardBody className="p-4">
								<h3 className="font-medium mb-4">Privacy Settings</h3>

								<div className="space-y-4">
									<div className="flex justify-between items-center">
										<div>
											<p className="font-medium">Trip History</p>
											<p className="text-xs text-default-500">
												Store your trip history
											</p>
										</div>
										<Switch defaultSelected color="primary" />
									</div>

									<Divider />

									<div className="flex justify-between items-center">
										<div>
											<p className="font-medium">Data Collection</p>
											<p className="text-xs text-default-500">
												Allow anonymous usage data collection
											</p>
										</div>
										<Switch defaultSelected color="primary" />
									</div>
								</div>
							</CardBody>
						</Card>
					</div>
				)}

				{activeTab === "payment" && (
					<div className="space-y-4">
						<Card>
							<CardBody className="p-4">
								<h3 className="font-medium mb-4">Payment Methods</h3>

								<div className="space-y-4">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-default-100 rounded-full flex items-center justify-center">
											<Icon className="text-success" icon="lucide:banknote" />
										</div>
										<div className="flex-1">
											<p className="font-medium">Cash</p>
											<p className="text-xs text-default-500">
												Default payment method
											</p>
										</div>
										<div className="bg-success-100 text-success-600 text-xs px-2 py-0.5 rounded-full">
											Active
										</div>
									</div>

									<Divider />

									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-default-100 rounded-full flex items-center justify-center">
											<Icon className="text-primary" icon="lucide:qr-code" />
										</div>
										<div className="flex-1">
											<p className="font-medium">QR Code Payment</p>
											<p className="text-xs text-default-500">
												Scan to pay and confirm rides
											</p>
										</div>
										<Button color="primary" size="sm" variant="flat">
											Setup
										</Button>
									</div>
								</div>
							</CardBody>
						</Card>

						<Card>
							<CardBody className="p-4">
								<h3 className="font-medium mb-4">Fare Preferences</h3>

								<div className="space-y-4">
									<div className="flex justify-between items-center">
										<div>
											<p className="font-medium">Fare Estimates</p>
											<p className="text-xs text-default-500">
												Show fare estimates before booking
											</p>
										</div>
										<Switch defaultSelected color="primary" />
									</div>

									<Divider />

									<div className="flex justify-between items-center">
										<div>
											<p className="font-medium">Receipt by Email</p>
											<p className="text-xs text-default-500">
												Send trip receipts to your email
											</p>
										</div>
										<Switch color="primary" />
									</div>
								</div>
							</CardBody>
						</Card>

						<Button
							className="w-full"
							color="primary"
							startContent={<Icon icon="lucide:receipt" />}
							variant="flat">
							View Payment History
						</Button>
					</div>
				)}
			</div>
		</motion.div>
	);
};

export default Settings;
