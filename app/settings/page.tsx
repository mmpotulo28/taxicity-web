import React from "react";
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

export const Settings: React.FC = () => {
	const [activeTab, setActiveTab] = React.useState("profile");
	const [profileForm, setProfileForm] = React.useState({
		name: "John Doe",
		email: "john.doe@example.com",
		phone: "071 234 5678",
	});

	const [preferences, setPreferences] = React.useState({
		notifications: true,
		locationSharing: true,
		darkMode: false,
		language: "english",
	});

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
			className="h-full flex flex-col"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}>
			<div className="p-4 bg-white shadow-sm">
				<h2 className="text-lg font-semibold mb-4">Settings</h2>

				<Tabs
					aria-label="Settings options"
					color="primary"
					variant="underlined"
					selectedKey={activeTab}
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
									src="https://img.heroui.chat/image/avatar?w=100&h=100&u=user1"
									className="w-20 h-20"
								/>
								<Button size="sm" variant="flat" color="primary" className="mt-2">
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
									color="primary"
									className="w-full"
									onPress={handleSaveProfile}>
									Save Changes
								</Button>
							</div>

							<Divider className="my-6" />

							<div className="space-y-4">
								<h3 className="font-medium">Account Security</h3>

								<Button
									variant="flat"
									color="primary"
									className="w-full"
									startContent={<Icon icon="lucide:lock" />}>
									Change Password
								</Button>

								<Button
									variant="flat"
									color="primary"
									className="w-full"
									startContent={<Icon icon="lucide:shield" />}>
									Two-Factor Authentication
								</Button>

								<Button
									variant="flat"
									color="danger"
									className="w-full"
									startContent={<Icon icon="lucide:log-out" />}>
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
											isSelected={preferences.notifications}
											onValueChange={(value) =>
												handleToggleChange("notifications", value)
											}
											color="primary"
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
											isSelected={preferences.locationSharing}
											onValueChange={(value) =>
												handleToggleChange("locationSharing", value)
											}
											color="primary"
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
											isSelected={preferences.darkMode}
											onValueChange={(value) =>
												handleToggleChange("darkMode", value)
											}
											color="primary"
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
											<Icon icon="lucide:banknote" className="text-success" />
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
											<Icon icon="lucide:qr-code" className="text-primary" />
										</div>
										<div className="flex-1">
											<p className="font-medium">QR Code Payment</p>
											<p className="text-xs text-default-500">
												Scan to pay and confirm rides
											</p>
										</div>
										<Button size="sm" variant="flat" color="primary">
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
							variant="flat"
							color="primary"
							className="w-full"
							startContent={<Icon icon="lucide:receipt" />}>
							View Payment History
						</Button>
					</div>
				)}
			</div>
		</motion.div>
	);
};
