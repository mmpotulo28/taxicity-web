"use client";
import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Button, Input, Switch, Avatar, Divider, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/toast";

// Mock admin user for profile settings
const currentUser = {
	id: "admin1",
	name: "Sarah Johnson",
	email: "sarah.johnson@taxicity.co.za",
	role: "Super Admin",
	avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=admin1",
	phone: "+27 71 234 5678",
	lastLogin: "2023-11-20 09:45 AM",
	department: "Operations",
	location: "Johannesburg Office",
	hireDate: "2021-03-15",
	bio: "Experienced operations manager with a focus on transportation systems and logistics optimization.",
};

export default function ProfileSettingsPage() {
	// State for form inputs
	const [profileData, setProfileData] = useState({
		name: currentUser.name,
		email: currentUser.email,
		phone: currentUser.phone,
		avatar: currentUser.avatar,
		bio: currentUser.bio,
		notifyOnLogin: true,
		twoFactorAuth: false,
		emailNotifications: true,
		mobileNotifications: false,
	});

	// State for password change
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	// Handle form inputs
	const handleChange = (field: string, value: string | boolean) => {
		setProfileData({
			...profileData,
			[field]: value,
		});
	};

	// Handle password change
	const handlePasswordChange = (field: string, value: string) => {
		setPasswordData({
			...passwordData,
			[field]: value,
		});
	};

	// Handle form submit
	const handleSaveProfile = () => {
		// In a real app, this would make API calls to save settings
		addToast({
			title: "Profile Updated",
			description: "Your profile information has been updated successfully.",
			color: "success",
		});
	};

	// Handle password update
	const handleUpdatePassword = () => {
		// Validation
		if (passwordData.newPassword !== passwordData.confirmPassword) {
			addToast({
				title: "Password Mismatch",
				description: "New password and confirmation do not match.",
				color: "danger",
			});

			return;
		}

		if (passwordData.newPassword.length < 8) {
			addToast({
				title: "Password Too Short",
				description: "Password must be at least 8 characters.",
				color: "danger",
			});

			return;
		}

		// In a real app, this would make an API call
		addToast({
			title: "Password Updated",
			description: "Your password has been changed successfully.",
			color: "success",
		});

		// Reset fields
		setPasswordData({
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		});
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold">Profile Settings</h1>
					<Breadcrumbs>
						<BreadcrumbItem>Admin</BreadcrumbItem>
						<BreadcrumbItem>Dashboard</BreadcrumbItem>
						<BreadcrumbItem>Settings</BreadcrumbItem>
						<BreadcrumbItem>Profile</BreadcrumbItem>
					</Breadcrumbs>
				</div>

				<Button
					color="primary"
					startContent={<Icon icon="lucide:refresh-cw" />}
					variant="flat">
					Reset Changes
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Profile Overview Card */}
				<Card>
					<CardBody className="p-6 flex flex-col items-center text-center">
						<div className="relative mb-4">
							<Avatar className="w-24 h-24" src={profileData.avatar} />
							<Button
								isIconOnly
								className="absolute bottom-0 right-0"
								color="primary"
								radius="full"
								size="sm">
								<Icon icon="lucide:camera" />
							</Button>
						</div>

						<h2 className="text-xl font-semibold">{profileData.name}</h2>
						<p className="text-default-500">{currentUser.role}</p>

						<Chip className="mt-2" color="success" variant="flat">
							Active
						</Chip>

						<div className="mt-6 w-full">
							<div className="flex justify-between items-center">
								<span className="text-default-500">Department:</span>
								<span>{currentUser.department}</span>
							</div>
							<Divider className="my-2" />
							<div className="flex justify-between items-center">
								<span className="text-default-500">Location:</span>
								<span>{currentUser.location}</span>
							</div>
							<Divider className="my-2" />
							<div className="flex justify-between items-center">
								<span className="text-default-500">Joined:</span>
								<span>{new Date(currentUser.hireDate).toLocaleDateString()}</span>
							</div>
							<Divider className="my-2" />
							<div className="flex justify-between items-center">
								<span className="text-default-500">Last Login:</span>
								<span>{currentUser.lastLogin}</span>
							</div>
						</div>

						<Button
							className="mt-6 w-full"
							color="default"
							startContent={<Icon icon="lucide:log-out" />}
							variant="flat">
							Sign Out
						</Button>
					</CardBody>
				</Card>

				{/* Main Settings Area */}
				<div className="lg:col-span-2 space-y-6">
					{/* Personal Information */}
					<Card>
						<CardHeader>
							<h2 className="text-lg font-medium">Personal Information</h2>
						</CardHeader>
						<CardBody className="p-6 space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<Input
									label="Full Name"
									placeholder="Enter your full name"
									value={profileData.name}
									onValueChange={(value) => handleChange("name", value)}
								/>

								<Input
									label="Email Address"
									placeholder="Enter your email"
									type="email"
									value={profileData.email}
									onValueChange={(value) => handleChange("email", value)}
								/>

								<Input
									label="Phone Number"
									placeholder="Enter your phone number"
									value={profileData.phone}
									onValueChange={(value) => handleChange("phone", value)}
								/>

								<Input isReadOnly label="Role" value={currentUser.role} />
							</div>

							<div>
								<Input
									label="Bio"
									placeholder="Tell us a little about yourself"
									value={profileData.bio}
									onValueChange={(value) => handleChange("bio", value)}
								/>
							</div>

							<div className="flex justify-end">
								<Button color="primary" onPress={handleSaveProfile}>
									Save Changes
								</Button>
							</div>
						</CardBody>
					</Card>

					{/* Security Settings */}
					<Card>
						<CardHeader>
							<h2 className="text-lg font-medium">Security Settings</h2>
						</CardHeader>
						<CardBody className="p-6 space-y-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium">Two-Factor Authentication</p>
									<p className="text-sm text-default-500">
										Add an extra layer of security to your account
									</p>
								</div>
								<Switch
									isSelected={profileData.twoFactorAuth}
									onValueChange={(value) => handleChange("twoFactorAuth", value)}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium">Login Notifications</p>
									<p className="text-sm text-default-500">
										Receive alerts when your account is accessed
									</p>
								</div>
								<Switch
									isSelected={profileData.notifyOnLogin}
									onValueChange={(value) => handleChange("notifyOnLogin", value)}
								/>
							</div>

							<Divider className="my-4" />

							<div>
								<h3 className="text-lg font-medium mb-3">Change Password</h3>
								<div className="space-y-4">
									<Input
										label="Current Password"
										placeholder="Enter current password"
										type="password"
										value={passwordData.currentPassword}
										onValueChange={(value) =>
											handlePasswordChange("currentPassword", value)
										}
									/>
									<Input
										label="New Password"
										placeholder="Enter new password"
										type="password"
										value={passwordData.newPassword}
										onValueChange={(value) =>
											handlePasswordChange("newPassword", value)
										}
									/>
									<Input
										label="Confirm New Password"
										placeholder="Confirm new password"
										type="password"
										value={passwordData.confirmPassword}
										onValueChange={(value) =>
											handlePasswordChange("confirmPassword", value)
										}
									/>
									<Button color="primary" onPress={handleUpdatePassword}>
										Update Password
									</Button>
								</div>
							</div>
						</CardBody>
					</Card>

					{/* Notification Preferences */}
					<Card>
						<CardHeader>
							<h2 className="text-lg font-medium">Notification Preferences</h2>
						</CardHeader>
						<CardBody className="p-6 space-y-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium">Email Notifications</p>
									<p className="text-sm text-default-500">
										Receive system alerts and updates via email
									</p>
								</div>
								<Switch
									isSelected={profileData.emailNotifications}
									onValueChange={(value) =>
										handleChange("emailNotifications", value)
									}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium">Mobile Notifications</p>
									<p className="text-sm text-default-500">
										Receive push notifications on your mobile device
									</p>
								</div>
								<Switch
									isSelected={profileData.mobileNotifications}
									onValueChange={(value) =>
										handleChange("mobileNotifications", value)
									}
								/>
							</div>

							<div className="mt-4">
								<Button color="primary" onPress={handleSaveProfile}>
									Save Preferences
								</Button>
							</div>
						</CardBody>
					</Card>

					{/* Session Information */}
					<Card>
						<CardHeader>
							<h2 className="text-lg font-medium">Active Sessions</h2>
						</CardHeader>
						<CardBody className="p-6">
							<div className="space-y-4">
								<div className="p-3 border border-divider rounded-lg flex justify-between items-center">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
											<Icon className="text-primary" icon="lucide:monitor" />
										</div>
										<div>
											<p className="font-medium">Windows PC - Chrome</p>
											<p className="text-xs text-default-500">
												Johannesburg, South Africa • Current session
											</p>
										</div>
									</div>
									<Chip color="success" size="sm">
										Active Now
									</Chip>
								</div>

								<div className="p-3 border border-divider rounded-lg flex justify-between items-center">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-default-100 flex items-center justify-center">
											<Icon
												className="text-default-500"
												icon="lucide:smartphone"
											/>
										</div>
										<div>
											<p className="font-medium">iPhone 13 - Safari</p>
											<p className="text-xs text-default-500">
												Johannesburg, South Africa • Last active 2 hours ago
											</p>
										</div>
									</div>
									<Button color="danger" size="sm" variant="flat">
										Logout
									</Button>
								</div>
							</div>

							<Button
								className="mt-4 w-full"
								color="danger"
								startContent={<Icon icon="lucide:log-out" />}
								variant="flat">
								Sign Out of All Devices
							</Button>
						</CardBody>
					</Card>
				</div>
			</div>
		</div>
	);
}
