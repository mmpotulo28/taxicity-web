"use client";
import React, { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import {
	Button,
	Input,
	Switch,
	Tabs,
	Tab,
	Select,
	SelectItem,
	Divider,
	Avatar,
	Chip,
	useDisclosure,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";

// Mock admin user for profile settings
const currentUser = {
	id: "admin1",
	name: "Sarah Johnson",
	email: "sarah.johnson@taxicity.co.za",
	role: "Super Admin",
	avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=admin1",
	phone: "+27 71 234 5678",
	lastLogin: "2023-11-20 09:45 AM",
};

export default function SettingsPage() {
	const router = useRouter();

	// State for form inputs
	const [generalSettings, setGeneralSettings] = useState({
		appName: "TaxiCity Admin",
		contactEmail: "admin@taxicity.co.za",
		supportPhone: "+27 86 000 8324",
		timeZone: "Africa/Johannesburg",
		dateFormat: "DD/MM/YYYY",
		timeFormat: "24h",
	});

	const [notificationSettings, setNotificationSettings] = useState({
		emailNotifications: true,
		pushNotifications: false,
		smsNotifications: true,
		newDriverAlerts: true,
		systemUpdateAlerts: true,
		revenueReports: false,
		supportTickets: true,
		dailySummary: true,
	});

	const [securitySettings, setSecuritySettings] = useState({
		twoFactorAuth: false,
		sessionTimeout: "30",
		passwordExpiry: "90",
		minPasswordLength: "8",
		requireSpecialChars: true,
		ipRestriction: false,
		autoLogout: true,
	});

	const [profileSettings, setProfileSettings] = useState({
		name: currentUser.name,
		email: currentUser.email,
		phone: currentUser.phone,
		avatar: currentUser.avatar,
		notifyOnLogin: true,
	});

	const [apiSettings, setApiSettings] = useState({
		apiKey: "sk_test_TaxiCity2023SecureAPIKeyExample",
		webhookUrl: "https://api.taxicity.co.za/webhooks/events",
		rateLimit: "100",
		enableTracking: true,
		logLevel: "info",
	});

	const { isOpen, onOpen, onClose } = useDisclosure();
	const [isRegeneratingKey, setIsRegeneratingKey] = useState(false);

	// Handle form submit
	const handleSaveSettings = (settingType: string) => {
		// In a real app, this would make API calls to save settings
		addToast({
			title: "Settings Saved",
			description: `Your ${settingType} settings have been updated successfully.`,
			color: "success",
		});
	};

	// Handle API key regeneration
	const handleRegenerateApiKey = () => {
		setIsRegeneratingKey(true);

		// Simulate API call
		setTimeout(() => {
			setApiSettings({
				...apiSettings,
				apiKey: `sk_test_TaxiCity${Date.now().toString(36)}`,
			});
			setIsRegeneratingKey(false);
			onClose();
			addToast({
				title: "API Key Regenerated",
				description: "Your new API key has been generated successfully.",
				color: "success",
			});
		}, 1500);
	};

	// Add additional quick-nav sections
	const settingsSections = [
		{
			title: "Profile",
			description: "Manage your personal information and account settings",
			icon: "lucide:user",
			path: "/dashboard/settings/profile",
		},
		{
			title: "Security",
			description: "Configure security settings and authentication methods",
			icon: "lucide:shield",
			path: "/dashboard/settings/security",
		},
		{
			title: "Notifications",
			description: "Set up your notification preferences and alerts",
			icon: "lucide:bell",
			path: "/dashboard/settings/notifications",
		},
		{
			title: "API",
			description: "Manage API keys and integration settings",
			icon: "lucide:code",
			path: "/dashboard/settings/api",
		},
		{
			title: "System",
			description: "Configure global system settings and preferences",
			icon: "lucide:settings",
			path: "/dashboard/settings/system",
		},
		{
			title: "Support",
			description: "Access help resources and contact support",
			icon: "lucide:help-circle",
			path: "/dashboard/support",
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold">System Settings</h1>
					<Breadcrumbs>
						<BreadcrumbItem>Admin</BreadcrumbItem>
						<BreadcrumbItem>Dashboard</BreadcrumbItem>
						<BreadcrumbItem>Settings</BreadcrumbItem>
					</Breadcrumbs>
				</div>

				<div className="flex gap-2">
					<Button
						color="primary"
						startContent={<Icon icon="lucide:rotate-ccw" />}
						variant="flat">
						Reset to Default
					</Button>
				</div>
			</div>

			{/* Settings Navigation Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
				{settingsSections.map((section) => (
					<Card
						key={section.title}
						isPressable
						shadow="sm"
						onPress={() => router.push(section.path)}>
						<CardBody className="p-6">
							<div className="flex items-start gap-4">
								<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
									<Icon className="text-primary text-xl" icon={section.icon} />
								</div>
								<div>
									<h3 className="text-lg font-medium">{section.title}</h3>
									<p className="text-sm text-default-500 mt-1">
										{section.description}
									</p>
								</div>
							</div>
						</CardBody>
					</Card>
				))}
			</div>

			<Card>
				<CardBody className="p-0">
					<Tabs aria-label="Settings categories" color="primary" variant="bordered">
						<Tab
							key="general"
							title={
								<div className="flex items-center gap-2">
									<Icon icon="lucide:settings" />
									<span>General</span>
								</div>
							}>
							<div className="p-6">
								<h2 className="text-xl font-semibold mb-4">General Settings</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<Input
										label="System Name"
										value={generalSettings.appName}
										onValueChange={(value) =>
											setGeneralSettings({
												...generalSettings,
												appName: value,
											})
										}
									/>

									<Input
										label="Contact Email"
										type="email"
										value={generalSettings.contactEmail}
										onValueChange={(value) =>
											setGeneralSettings({
												...generalSettings,
												contactEmail: value,
											})
										}
									/>

									<Input
										label="Support Phone"
										value={generalSettings.supportPhone}
										onValueChange={(value) =>
											setGeneralSettings({
												...generalSettings,
												supportPhone: value,
											})
										}
									/>

									<Select
										label="Time Zone"
										selectedKeys={[generalSettings.timeZone]}
										onChange={(e) =>
											setGeneralSettings({
												...generalSettings,
												timeZone: e.target.value,
											})
										}>
										<SelectItem key="Africa/Johannesburg">
											Africa/Johannesburg (GMT+2)
										</SelectItem>
										<SelectItem key="Africa/Cairo">
											Africa/Cairo (GMT+2)
										</SelectItem>
										<SelectItem key="Europe/London">
											Europe/London (GMT+0)
										</SelectItem>
										<SelectItem key="America/New_York">
											America/New_York (GMT-5)
										</SelectItem>
									</Select>

									<Select
										label="Date Format"
										selectedKeys={[generalSettings.dateFormat]}
										onChange={(e) =>
											setGeneralSettings({
												...generalSettings,
												dateFormat: e.target.value,
											})
										}>
										<SelectItem key="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
										<SelectItem key="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
										<SelectItem key="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
									</Select>

									<Select
										label="Time Format"
										selectedKeys={[generalSettings.timeFormat]}
										onChange={(e) =>
											setGeneralSettings({
												...generalSettings,
												timeFormat: e.target.value,
											})
										}>
										<SelectItem key="12h">12-hour (AM/PM)</SelectItem>
										<SelectItem key="24h">24-hour</SelectItem>
									</Select>
								</div>

								<div className="mt-8 flex justify-end">
									<Button
										color="primary"
										onPress={() => handleSaveSettings("general")}>
										Save Changes
									</Button>
								</div>
							</div>
						</Tab>

						<Tab
							key="notifications"
							title={
								<div className="flex items-center gap-2">
									<Icon icon="lucide:bell" />
									<span>Notifications</span>
								</div>
							}>
							<div className="p-6">
								<h2 className="text-xl font-semibold mb-4">
									Notification Settings
								</h2>

								<div className="space-y-6">
									<div>
										<h3 className="text-lg font-medium mb-3">
											Notification Channels
										</h3>
										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<div>
													<p className="font-medium">
														Email Notifications
													</p>
													<p className="text-sm text-default-500">
														Receive notifications via email
													</p>
												</div>
												<Switch
													isSelected={
														notificationSettings.emailNotifications
													}
													onValueChange={(value) =>
														setNotificationSettings({
															...notificationSettings,
															emailNotifications: value,
														})
													}
												/>
											</div>
											<div className="flex items-center justify-between">
												<div>
													<p className="font-medium">
														Push Notifications
													</p>
													<p className="text-sm text-default-500">
														Receive push notifications on your browser
													</p>
												</div>
												<Switch
													isSelected={
														notificationSettings.pushNotifications
													}
													onValueChange={(value) =>
														setNotificationSettings({
															...notificationSettings,
															pushNotifications: value,
														})
													}
												/>
											</div>
											<div className="flex items-center justify-between">
												<div>
													<p className="font-medium">SMS Notifications</p>
													<p className="text-sm text-default-500">
														Receive important alerts via SMS
													</p>
												</div>
												<Switch
													isSelected={
														notificationSettings.smsNotifications
													}
													onValueChange={(value) =>
														setNotificationSettings({
															...notificationSettings,
															smsNotifications: value,
														})
													}
												/>
											</div>
										</div>
									</div>

									<Divider />

									<div>
										<h3 className="text-lg font-medium mb-3">
											Notification Types
										</h3>
										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<div>
													<p className="font-medium">New Driver Alerts</p>
													<p className="text-sm text-default-500">
														Notify when new drivers register
													</p>
												</div>
												<Switch
													isSelected={
														notificationSettings.newDriverAlerts
													}
													onValueChange={(value) =>
														setNotificationSettings({
															...notificationSettings,
															newDriverAlerts: value,
														})
													}
												/>
											</div>
											<div className="flex items-center justify-between">
												<div>
													<p className="font-medium">System Updates</p>
													<p className="text-sm text-default-500">
														Notify about system maintenance and updates
													</p>
												</div>
												<Switch
													isSelected={
														notificationSettings.systemUpdateAlerts
													}
													onValueChange={(value) =>
														setNotificationSettings({
															...notificationSettings,
															systemUpdateAlerts: value,
														})
													}
												/>
											</div>
											<div className="flex items-center justify-between">
												<div>
													<p className="font-medium">Revenue Reports</p>
													<p className="text-sm text-default-500">
														Daily and weekly revenue summary reports
													</p>
												</div>
												<Switch
													isSelected={notificationSettings.revenueReports}
													onValueChange={(value) =>
														setNotificationSettings({
															...notificationSettings,
															revenueReports: value,
														})
													}
												/>
											</div>
											<div className="flex items-center justify-between">
												<div>
													<p className="font-medium">Support Tickets</p>
													<p className="text-sm text-default-500">
														Notifications about new and updated support
														tickets
													</p>
												</div>
												<Switch
													isSelected={notificationSettings.supportTickets}
													onValueChange={(value) =>
														setNotificationSettings({
															...notificationSettings,
															supportTickets: value,
														})
													}
												/>
											</div>
											<div className="flex items-center justify-between">
												<div>
													<p className="font-medium">Daily Summary</p>
													<p className="text-sm text-default-500">
														Receive an end-of-day system activity
														summary
													</p>
												</div>
												<Switch
													isSelected={notificationSettings.dailySummary}
													onValueChange={(value) =>
														setNotificationSettings({
															...notificationSettings,
															dailySummary: value,
														})
													}
												/>
											</div>
										</div>
									</div>
								</div>

								<div className="mt-8 flex justify-end">
									<Button
										color="primary"
										onPress={() => handleSaveSettings("notification")}>
										Save Changes
									</Button>
								</div>
							</div>
						</Tab>

						<Tab
							key="security"
							title={
								<div className="flex items-center gap-2">
									<Icon icon="lucide:shield" />
									<span>Security</span>
								</div>
							}>
							<div className="p-6">
								<h2 className="text-xl font-semibold mb-4">Security Settings</h2>

								<div className="space-y-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium">Two-Factor Authentication</p>
											<p className="text-sm text-default-500">
												Require 2FA for all admin logins
											</p>
										</div>
										<Switch
											isSelected={securitySettings.twoFactorAuth}
											onValueChange={(value) =>
												setSecuritySettings({
													...securitySettings,
													twoFactorAuth: value,
												})
											}
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<Input
											label="Session Timeout (minutes)"
											max="120"
											min="5"
											type="number"
											value={securitySettings.sessionTimeout}
											onValueChange={(value) =>
												setSecuritySettings({
													...securitySettings,
													sessionTimeout: value,
												})
											}
										/>

										<Input
											label="Password Expiry (days)"
											max="365"
											min="30"
											type="number"
											value={securitySettings.passwordExpiry}
											onValueChange={(value) =>
												setSecuritySettings({
													...securitySettings,
													passwordExpiry: value,
												})
											}
										/>

										<Input
											label="Minimum Password Length"
											max="20"
											min="8"
											type="number"
											value={securitySettings.minPasswordLength}
											onValueChange={(value) =>
												setSecuritySettings({
													...securitySettings,
													minPasswordLength: value,
												})
											}
										/>
									</div>

									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<div>
												<p className="font-medium">
													Require Special Characters
												</p>
												<p className="text-sm text-default-500">
													Passwords must include special characters
												</p>
											</div>
											<Switch
												isSelected={securitySettings.requireSpecialChars}
												onValueChange={(value) =>
													setSecuritySettings({
														...securitySettings,
														requireSpecialChars: value,
													})
												}
											/>
										</div>

										<div className="flex items-center justify-between">
											<div>
												<p className="font-medium">IP Restriction</p>
												<p className="text-sm text-default-500">
													Limit access to specific IP addresses
												</p>
											</div>
											<Switch
												isSelected={securitySettings.ipRestriction}
												onValueChange={(value) =>
													setSecuritySettings({
														...securitySettings,
														ipRestriction: value,
													})
												}
											/>
										</div>

										<div className="flex items-center justify-between">
											<div>
												<p className="font-medium">
													Auto Logout on Inactivity
												</p>
												<p className="text-sm text-default-500">
													Automatically log out inactive users
												</p>
											</div>
											<Switch
												isSelected={securitySettings.autoLogout}
												onValueChange={(value) =>
													setSecuritySettings({
														...securitySettings,
														autoLogout: value,
													})
												}
											/>
										</div>
									</div>

									<div className="mt-6">
										<Button
											className="mb-4"
											color="danger"
											startContent={<Icon icon="lucide:shield-alert" />}
											variant="flat">
											Security Audit Log
										</Button>

										<p className="text-sm text-default-500">
											Last security scan: 2023-11-18 09:15 AM
										</p>
									</div>
								</div>

								<div className="mt-8 flex justify-end">
									<Button
										color="primary"
										onPress={() => handleSaveSettings("security")}>
										Save Changes
									</Button>
								</div>
							</div>
						</Tab>

						<Tab
							key="profile"
							title={
								<div className="flex items-center gap-2">
									<Icon icon="lucide:user" />
									<span>Profile</span>
								</div>
							}>
							<div className="p-6">
								<h2 className="text-xl font-semibold mb-4">Profile Settings</h2>

								<div className="flex flex-col md:flex-row gap-8 items-start">
									<div className="flex flex-col items-center">
										<Avatar
											className="w-24 h-24 mb-3"
											src={profileSettings.avatar}
										/>
										<Button
											size="sm"
											startContent={<Icon icon="lucide:upload" />}
											variant="flat">
											Change Avatar
										</Button>
										<div className="mt-4 text-center">
											<p className="font-medium">{profileSettings.name}</p>
											<p className="text-sm text-default-500">
												{currentUser.role}
											</p>
											<Chip
												className="mt-2"
												color="success"
												size="sm"
												variant="flat">
												Active
											</Chip>
										</div>
										<p className="text-xs text-default-400 mt-2">
											Last login: {currentUser.lastLogin}
										</p>
									</div>

									<div className="flex-1 space-y-6">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<Input
												label="Full Name"
												value={profileSettings.name}
												onValueChange={(value) =>
													setProfileSettings({
														...profileSettings,
														name: value,
													})
												}
											/>

											<Input
												label="Email Address"
												type="email"
												value={profileSettings.email}
												onValueChange={(value) =>
													setProfileSettings({
														...profileSettings,
														email: value,
													})
												}
											/>

											<Input
												label="Phone Number"
												value={profileSettings.phone}
												onValueChange={(value) =>
													setProfileSettings({
														...profileSettings,
														phone: value,
													})
												}
											/>

											<div />

											<div className="flex items-center justify-between col-span-2">
												<div>
													<p className="font-medium">
														Login Notification
													</p>
													<p className="text-sm text-default-500">
														Receive email alerts when account is
														accessed
													</p>
												</div>
												<Switch
													isSelected={profileSettings.notifyOnLogin}
													onValueChange={(value) =>
														setProfileSettings({
															...profileSettings,
															notifyOnLogin: value,
														})
													}
												/>
											</div>
										</div>

										<Divider className="my-4" />

										<div>
											<h3 className="text-lg font-medium mb-3">
												Change Password
											</h3>
											<div className="space-y-4">
												<Input
													label="Current Password"
													placeholder="Enter current password"
													type="password"
												/>
												<Input
													label="New Password"
													placeholder="Enter new password"
													type="password"
												/>
												<Input
													label="Confirm New Password"
													placeholder="Confirm new password"
													type="password"
												/>
												<Button color="primary">Update Password</Button>
											</div>
										</div>
									</div>
								</div>

								<div className="mt-8 flex justify-end">
									<Button
										color="primary"
										onPress={() => handleSaveSettings("profile")}>
										Save Changes
									</Button>
								</div>
							</div>
						</Tab>

						<Tab
							key="api"
							title={
								<div className="flex items-center gap-2">
									<Icon icon="lucide:code" />
									<span>API</span>
								</div>
							}>
							<div className="p-6">
								<h2 className="text-xl font-semibold mb-4">API Settings</h2>
								<div className="space-y-6">
									<div>
										<h3 className="text-lg font-medium mb-3">API Keys</h3>
										<div className="flex items-center gap-4 mb-4">
											<Input
												readOnly
												className="flex-grow"
												endContent={
													<Button
														isIconOnly
														variant="light"
														onPress={() => {
															navigator.clipboard.writeText(
																apiSettings.apiKey,
															);
															addToast({
																title: "Copied",
																description:
																	"API key copied to clipboard",
																color: "success",
															});
														}}>
														<Icon icon="lucide:copy" />
													</Button>
												}
												label="Primary API Key"
												type="password"
												value={apiSettings.apiKey}
											/>
											<Button color="danger" variant="flat" onPress={onOpen}>
												Regenerate
											</Button>
										</div>

										<Input
											className="mb-4"
											label="Webhook URL"
											value={apiSettings.webhookUrl}
											onValueChange={(value) =>
												setApiSettings({
													...apiSettings,
													webhookUrl: value,
												})
											}
										/>

										<Input
											className="mb-4"
											label="Rate Limit (requests per minute)"
											type="number"
											value={apiSettings.rateLimit}
											onValueChange={(value) =>
												setApiSettings({
													...apiSettings,
													rateLimit: value,
												})
											}
										/>
									</div>

									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<div>
												<p className="font-medium">Enable API Tracking</p>
												<p className="text-sm text-default-500">
													Log all API requests for monitoring
												</p>
											</div>
											<Switch
												isSelected={apiSettings.enableTracking}
												onValueChange={(value) =>
													setApiSettings({
														...apiSettings,
														enableTracking: value,
													})
												}
											/>
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<Select
											label="Log Level"
											selectedKeys={[apiSettings.logLevel]}
											onChange={(e) =>
												setApiSettings({
													...apiSettings,
													logLevel: e.target.value,
												})
											}>
											<SelectItem key="error">Error only</SelectItem>
											<SelectItem key="warn">Warning & Errors</SelectItem>
											<SelectItem key="info">Info & above</SelectItem>
											<SelectItem key="debug">Debug (All logs)</SelectItem>
										</Select>
									</div>

									<div className="mt-4">
										<Button
											startContent={<Icon icon="lucide:book-open" />}
											variant="flat"
											onPress={() =>
												window.open(
													"https://docs.taxicity.co.za/api",
													"_blank",
												)
											}>
											View API Documentation
										</Button>
									</div>
								</div>

								<div className="mt-8 flex justify-end">
									<Button
										color="primary"
										onPress={() => handleSaveSettings("api")}>
										Save Changes
									</Button>
								</div>
							</div>
						</Tab>
					</Tabs>
				</CardBody>
			</Card>

			{/* API Key Regeneration Modal */}
			<Modal isOpen={isOpen} onOpenChange={onClose}>
				<ModalContent>
					{() => (
						<>
							<ModalHeader className="flex flex-col gap-1">
								Regenerate API Key
							</ModalHeader>
							<ModalBody>
								<p className="text-default-500">
									Are you sure you want to regenerate your API key? This will
									invalidate your current API key and you&apos;ll need to update
									all applications using it.
								</p>
								<p className="font-medium text-danger mt-2">
									This action cannot be undone.
								</p>
							</ModalBody>
							<ModalFooter>
								<Button variant="flat" onPress={onClose}>
									Cancel
								</Button>
								<Button
									color="danger"
									isLoading={isRegeneratingKey}
									onPress={handleRegenerateApiKey}>
									Regenerate Key
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}
