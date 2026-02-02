"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Divider,
	Switch,
	Avatar,
	Input,
	Tabs,
	Tab,
	Select,
	SelectItem,
	Chip,
	Badge,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useLoadScript } from "@react-google-maps/api";
import { addToast } from "@heroui/toast";

import { useRide } from "@taxyciti/ui";

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

const Settings: React.FC = () => {
	const router = useRouter();
	const { isLoaded } = useLoadScript({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
		libraries,
	});

	const { setTheme, theme } = useTheme();
	const {
		clearAppData,
		savedLocations,
		isLoadingSavedLocations,
		saveLocation,
		deleteSavedLocation,
		isSavingLocation,
		isDeletingLocation,
	} = useRide();
	const { isOpen: isAddLocationOpen, onOpen: onAddLocationOpen, onOpenChange: onAddLocationOpenChange } = useDisclosure();
	const [newPlace, setNewPlace] = useState<{
		name: string;
		address: string;
		type: string;
		lat?: number;
		lng?: number;
	}>({ name: "", address: "", type: "other" });
	const [isLoadingLocation, setIsLoadingLocation] = useState(false);
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

	const toggleDarkMode = (isSelected: boolean) => {
		const newTheme = isSelected ? "dark" : "light";
		setTheme(newTheme);
		setPreferences((prev) => ({
			...prev,
			darkMode: isSelected,
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

	const handleUseCurrentLocation = () => {
		setIsLoadingLocation(true);

		if (!navigator.geolocation) {
			addToast({
				title: "Error",
				description: "Geolocation is not supported by your browser",
				color: "danger",
			});
			setIsLoadingLocation(false);

			return;
		}

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const { latitude, longitude } = position.coords;

				try {
					let address = "Current Location";

					if (globalThis.google?.maps?.Geocoder) {
						const geocoder = new google.maps.Geocoder();
						const response = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
							geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
								if (status === "OK" && results && results.length > 0) {
									resolve(results);
								} else {
									reject(new Error("Geocoder failed due to: " + status));
								}
							});
						});

						if (response[0]) {
							address = response[0].formatted_address;
						}
					}

					setNewPlace((prev) => ({
						...prev,
						address,
						lat: latitude,
						lng: longitude,
					}));
				} catch (error) {
					console.error("Error getting address:", error);
					addToast({
						title: "Error",
						description: "Failed to get address details",
						color: "warning",
					});
					// Still set coordinates even if address lookup fails
					setNewPlace((prev) => ({
						...prev,
						address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
						lat: latitude,
						lng: longitude,
					}));
				} finally {
					setIsLoadingLocation(false);
				}
			},
			(error) => {
				console.error("Geolocation error:", error);
				addToast({
					title: "Error",
					description: "Failed to get current location",
					color: "danger",
				});
				setIsLoadingLocation(false);
			},
		);
	};

	const containerVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
		exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
	};

	return (
		<div className="h-full flex flex-col bg-background relative overflow-hidden">
			{/* Decorative background elements similar to track page style */}
			<div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
			<div className="absolute bottom-[-10%] left-[-10%] w-[200px] h-[200px] bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

			<div className="p-6 pb-2 z-10">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-2xl font-bold">Settings</h1>
						<p className="text-default-500 text-sm">Manage your account and preferences</p>
					</div>
					<Button isIconOnly variant="light" radius="full" onPress={() => router.back()}>
						<Icon icon="lucide:x" className="w-6 h-6" />
					</Button>
				</div>

				<Tabs
					aria-label="Settings options"
					color="primary"
					variant="light"
					classNames={{
						tabList: "bg-default-100/50 backdrop-blur-md p-1 rounded-2xl",
						cursor: "shadow-sm rounded-xl",
						tab: "h-9",
						tabContent: "group-data-[selected=true]:text-primary font-medium",
					}}
					selectedKey={activeTab}
					onSelectionChange={(key) => setActiveTab(key as string)}>
					<Tab
						key="profile"
						title={
							<div className="flex items-center gap-2">
								<Icon icon="lucide:user" />
								<span>Profile</span>
							</div>
						}
					/>
					<Tab
						key="preferences"
						title={
							<div className="flex items-center gap-2">
								<Icon icon="lucide:settings" />
								<span>Preferences</span>
							</div>
						}
					/>
					<Tab
						key="places"
						title={
							<div className="flex items-center gap-2">
								<Icon icon="lucide:map-pin" />
								<span>Saved Places</span>
							</div>
						}
					/>
					<Tab
						key="payment"
						title={
							<div className="flex items-center gap-2">
								<Icon icon="lucide:credit-card" />
								<span>Payment</span>
							</div>
						}
					/>
				</Tabs>
			</div>

			<div className="flex-1 overflow-y-auto p-6 pt-2 scrollbar-hide z-10">
				<AnimatePresence mode="wait">
					{activeTab === "profile" && (
						<motion.div
							key="profile"
							variants={containerVariants}
							initial="hidden"
							animate="visible"
							exit="exit"
							className="space-y-6">
							<Card className="bg-background/60 backdrop-blur-md border border-default-200 shadow-sm">
								<CardBody className="flex flex-col items-center p-6 gap-4">
									<div className="relative">
										<Badge
											content={<Icon icon="lucide:camera" className="w-3 h-3 text-white" />}
											color="primary"
											placement="bottom-right"
											shape="circle"
											className="cursor-pointer">
											<Avatar
												src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
												className="w-24 h-24 text-large"
												isBordered
												color="primary"
											/>
										</Badge>
									</div>
									<div className="text-center">
										<h3 className="text-lg font-bold">{profileForm.name}</h3>
										<p className="text-default-500 text-sm">Passenger</p>
									</div>
								</CardBody>
							</Card>

							<Card className="bg-background/60 backdrop-blur-md border border-default-200 shadow-sm">
								<CardHeader className="px-6 pt-6 pb-0">
									<h4 className="text-base font-bold">Personal Information</h4>
								</CardHeader>
								<CardBody className="gap-4 p-6">
									<Input
										label="Full Name"
										placeholder="Enter your name"
										value={profileForm.name}
										onChange={(e) => handleProfileChange("name", e.target.value)}
										variant="bordered"
										labelPlacement="outside"
										startContent={<Icon icon="lucide:user" className="text-default-400" />}
									/>
									<Input
										label="Email"
										placeholder="Enter your email"
										type="email"
										value={profileForm.email}
										onChange={(e) => handleProfileChange("email", e.target.value)}
										variant="bordered"
										labelPlacement="outside"
										startContent={<Icon icon="lucide:mail" className="text-default-400" />}
									/>
									<Input
										label="Phone Number"
										placeholder="Enter your phone"
										type="tel"
										value={profileForm.phone}
										onChange={(e) => handleProfileChange("phone", e.target.value)}
										variant="bordered"
										labelPlacement="outside"
										startContent={<Icon icon="lucide:phone" className="text-default-400" />}
									/>
								</CardBody>
							</Card>

							<Card className="bg-background/60 backdrop-blur-md border border-default-200 shadow-sm">
								<CardBody className="flex flex-row items-center justify-between p-4">
									<div className="flex items-center gap-3">
										<div className="p-2 rounded-xl bg-warning/10 text-warning">
											<Icon icon="lucide:car-taxi-front" className="w-5 h-5" />
										</div>
										<div>
											<p className="font-medium">Driver Mode</p>
											<p className="text-xs text-default-500">Switch to driver dashboard</p>
										</div>
									</div>
									<Button
										size="sm"
										color="warning"
										variant="flat"
										onPress={() => router.push("/")}
									>
										Switch
									</Button>
								</CardBody>
							</Card>

							<Button
								color="primary"
								size="lg"
								className="w-full font-semibold shadow-lg shadow-primary/20"
								onPress={handleSaveProfile}
								startContent={<Icon icon="lucide:save" />}>
								Save Changes
							</Button>
						</motion.div>
					)}

					{activeTab === "preferences" && (
						<motion.div
							key="preferences"
							variants={containerVariants}
							initial="hidden"
							animate="visible"
							exit="exit"
							className="space-y-4">
							<Card className="bg-background/60 backdrop-blur-md border border-default-200 shadow-sm">
								<CardBody className="p-0">
									<div className="flex items-center justify-between p-4 hover:bg-default-100/50 transition-colors cursor-pointer">
										<div className="flex items-center gap-3">
											<div className="p-2 rounded-xl bg-primary/10 text-primary">
												<Icon icon="lucide:bell" className="w-5 h-5" />
											</div>
											<div>
												<p className="font-medium">Push Notifications</p>
												<p className="text-xs text-default-500">Receive ride updates</p>
											</div>
										</div>
										<Switch
											isSelected={preferences.notifications}
											onValueChange={(val) => handleToggleChange("notifications", val)}
											color="primary"
											size="sm"
										/>
									</div>
									<Divider className="opacity-50" />
									<div className="flex items-center justify-between p-4 hover:bg-default-100/50 transition-colors cursor-pointer">
										<div className="flex items-center gap-3">
											<div className="p-2 rounded-xl bg-secondary/10 text-secondary">
												<Icon icon="lucide:map-pin" className="w-5 h-5" />
											</div>
											<div>
												<p className="font-medium">Location Sharing</p>
												<p className="text-xs text-default-500">Share live location with driver</p>
											</div>
										</div>
										<Switch
											isSelected={preferences.locationSharing}
											onValueChange={(val) => handleToggleChange("locationSharing", val)}
											color="secondary"
											size="sm"
										/>
									</div>
									<Divider className="opacity-50" />
									<div className="flex items-center justify-between p-4 hover:bg-default-100/50 transition-colors cursor-pointer">
										<div className="flex items-center gap-3">
											<div className="p-2 rounded-xl bg-warning/10 text-warning">
												<Icon icon="lucide:moon" className="w-5 h-5" />
											</div>
											<div>
												<p className="font-medium">Dark Mode</p>
												<p className="text-xs text-default-500">Toggle app theme</p>
											</div>
										</div>
										<Switch
											isSelected={theme === "dark"}
											onValueChange={toggleDarkMode}
											color="warning"
											size="sm"
											thumbIcon={({ isSelected, className }) =>
												isSelected ? (
													<Icon icon="lucide:moon" className={className} />
												) : (
													<Icon icon="lucide:sun" className={className} />
												)
											}
										/>
									</div>
								</CardBody>
							</Card>

							<Card className="bg-background/60 backdrop-blur-md border border-default-200 shadow-sm">
								<CardBody className="p-4 gap-4">
									<div className="flex items-center gap-3 mb-2">
										<div className="p-2 rounded-xl bg-success/10 text-success">
											<Icon icon="lucide:globe" className="w-5 h-5" />
										</div>
										<div>
											<p className="font-medium">Language</p>
											<p className="text-xs text-default-500">Select your preferred language</p>
										</div>
									</div>
									<Select
										selectedKeys={[preferences.language]}
										onChange={(e) => handleLanguageChange(e.target.value)}
										variant="bordered"
										labelPlacement="outside"
										classNames={{
											trigger: "bg-default-100/50",
										}}>
										<SelectItem key="english" startContent={<span className="text-lg">🇬🇧</span>}>
											English
										</SelectItem>
										<SelectItem key="spanish" startContent={<span className="text-lg">🇪🇸</span>}>
											Spanish
										</SelectItem>
										<SelectItem key="french" startContent={<span className="text-lg">🇫🇷</span>}>
											French
										</SelectItem>
										<SelectItem key="zulu" startContent={<span className="text-lg">🇿🇦</span>}>
											Zulu
										</SelectItem>
									</Select>
								</CardBody>
							</Card>

							<Card className="bg-danger/5 backdrop-blur-md border border-danger/20 shadow-sm">
								<CardBody className="p-4 gap-4">
									<div className="flex items-center gap-3 mb-2">
										<div className="p-2 rounded-xl bg-danger/10 text-danger">
											<Icon icon="lucide:alert-triangle" className="w-5 h-5" />
										</div>
										<div>
											<p className="font-medium text-danger">Danger Zone</p>
											<p className="text-xs text-default-500">Reset application data</p>
										</div>
									</div>
									<Button
										color="danger"
										variant="flat"
										onPress={() => {
											if (confirm("Are you sure you want to reset the app? This will clear all data and log you out.")) {
												clearAppData();
											}
										}}
									>
										Reset App Data
									</Button>
								</CardBody>
							</Card>
						</motion.div>
					)}

					{activeTab === "places" && (
						<motion.div
							key="places"
							variants={containerVariants}
							initial="hidden"
							animate="visible"
							exit="exit"
							className="space-y-4">
							<Card className="bg-background/60 backdrop-blur-md border border-default-200 shadow-sm">
								<CardBody className="p-0">
									{isLoadingSavedLocations && (
										<div className="p-8 text-center text-default-500">Loading...</div>
									)}

									{savedLocations?.length === 0 && !isLoadingSavedLocations && (
										<div className="flex flex-col items-center justify-center p-8 text-center text-default-500">
											<div className="p-4 bg-default-100 rounded-full mb-3">
												<Icon icon="lucide:map-pin-off" className="w-6 h-6" />
											</div>
											<p>No saved places yet.</p>
										</div>
									)}


									{!isLoadingSavedLocations && savedLocations?.map((place: any, i: number) => (
										<React.Fragment key={place.id}>
											<div className="flex items-center justify-between p-4 hover:bg-default-100/50 transition-colors cursor-pointer">
												<div className="flex items-center gap-3">
													<div
														className={`p-2 rounded-xl ${place.name.toLowerCase() === "home"
															? "bg-primary/10 text-primary"
															: place.name.toLowerCase() === "work"
																? "bg-secondary/10 text-secondary"
																: "bg-default-100 text-default-500"
															}`}>
														<Icon
															icon={
																place.name.toLowerCase() === "home"
																	? "lucide:home"
																	: place.name.toLowerCase() === "work"
																		? "lucide:briefcase"
																		: "lucide:map-pin"
															}
															className="w-5 h-5"
														/>
													</div>
													<div>
														<p className="font-medium capitalization">{place.name}</p>
														<p className="text-xs text-default-500 line-clamp-1">{place.address}</p>
													</div>
												</div>
												<div className="flex items-center gap-2">
													<Button
														isIconOnly
														size="sm"
														variant="light"
														color="danger"
														isDisabled={isDeletingLocation}
														onPress={() => deleteSavedLocation(place.id)}>
														<Icon icon="lucide:trash-2" className="w-4 h-4" />
													</Button>
												</div>
											</div>
											{i < (savedLocations?.length || 0) - 1 && <Divider className="opacity-50" />}
										</React.Fragment>
									))
									}

								</CardBody>
							</Card>

							<Button
								color="primary"
								variant="flat"
								className="w-full"
								startContent={<Icon icon="lucide:plus" />}
								onPress={() => {
									setNewPlace({ name: "", address: "", type: "other" });
									onAddLocationOpen();
								}}>
								Add New Place
							</Button>
						</motion.div>
					)}

					{activeTab === "payment" && (
						<motion.div
							key="payment"
							variants={containerVariants}
							initial="hidden"
							animate="visible"
							exit="exit"
							className="space-y-6">
							{/* Credit Card Visual */}
							<div className="relative h-48 w-full rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-primary to-secondary p-6 text-white">
								<div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
								<div className="relative z-10 flex flex-col justify-between h-full">
									<div className="flex justify-between items-start">
										<Icon icon="lucide:credit-card" className="w-8 h-8 opacity-80" />
										<Icon icon="lucide:wifi" className="w-6 h-6 opacity-60" />
									</div>
									<div>
										<p className="text-sm opacity-80 mb-1">Card Number</p>
										<p className="text-xl font-mono tracking-wider">•••• •••• •••• 4242</p>
									</div>
									<div className="flex justify-between items-end">
										<div>
											<p className="text-xs opacity-80">Card Holder</p>
											<p className="font-medium tracking-wide">{profileForm.name.toUpperCase()}</p>
										</div>
										<div>
											<p className="text-xs opacity-80">Expires</p>
											<p className="font-medium">12/25</p>
										</div>
									</div>
								</div>
							</div>

							<Button
								variant="flat"
								color="primary"
								className="w-full"
								startContent={<Icon icon="lucide:plus" />}>
								Add New Payment Method
							</Button>

							<div>
								<h4 className="text-base font-bold mb-3 px-1">Recent Transactions</h4>
								<Card className="bg-background/60 backdrop-blur-md border border-default-200 shadow-sm">
									<CardBody className="p-0">
										{[
											{
												id: 1,
												dest: "Sandton City Mall",
												date: "Today, 10:23 AM",
												amount: "R45.00",
												status: "Completed",
											},
											{
												id: 2,
												dest: "Rosebank Station",
												date: "Yesterday, 14:30 PM",
												amount: "R32.50",
												status: "Completed",
											},
											{
												id: 3,
												dest: "OR Tambo Airport",
												date: "2 Oct, 08:15 AM",
												amount: "R250.00",
												status: "Completed",
											},
										].map((tx, i) => (
											<React.Fragment key={tx.id}>
												<div className="flex items-center justify-between p-4 hover:bg-default-100/50 transition-colors cursor-pointer">
													<div className="flex items-center gap-3">
														<div className="p-2 rounded-full bg-default-100 text-default-500">
															<Icon icon="lucide:car" className="w-4 h-4" />
														</div>
														<div>
															<p className="font-medium text-sm">{tx.dest}</p>
															<p className="text-xs text-default-400">{tx.date}</p>
														</div>
													</div>
													<div className="text-right">
														<p className="font-bold text-sm">{tx.amount}</p>
														<Chip size="sm" variant="flat" color="success" className="h-5 text-[10px]">
															{tx.status}
														</Chip>
													</div>
												</div>
												{i < 2 && <Divider className="opacity-50" />}
											</React.Fragment>
										))}
									</CardBody>
								</Card>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<Modal isOpen={isAddLocationOpen} onOpenChange={onAddLocationOpenChange} placement="center">
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className="flex flex-col gap-1">Add Saved Place</ModalHeader>
							<ModalBody>
								<Input
									autoFocus
									label="Name"
									placeholder="e.g. Home, Work, Gym"
									variant="bordered"
									value={newPlace.name}
									onValueChange={(val) => setNewPlace((prev) => ({ ...prev, name: val }))}
									startContent={<Icon icon="lucide:tag" className="mb-0.5 text-default-400 pointer-events-none flex-shrink-0" />}
								/>
								<Input
									label="Address"
									placeholder="Enter address"
									variant="bordered"
									value={newPlace.address}
									onValueChange={(val) => setNewPlace((prev) => ({ ...prev, address: val }))}
									startContent={
										<Icon icon="lucide:map-pin" className="mb-0.5 text-default-400 pointer-events-none flex-shrink-0" />
									}
								/>
								<div className="flex justify-end">
									<Button
										size="sm"
										variant="flat"
										color="secondary"
										isLoading={isLoadingLocation}
										isDisabled={isLoadingLocation || !isLoaded}
										startContent={!isLoadingLocation && <Icon icon="lucide:crosshair" />}
										onPress={handleUseCurrentLocation}>
										Use current location
									</Button>
								</div>
								<div className="flex gap-2 mt-2">
									{["Home", "Work", "School", "Gym"].map((preset) => (
										<Chip
											key={preset}
											variant="flat"
											color={newPlace.name === preset ? "primary" : "default"}
											className="cursor-pointer hover:bg-default-200"
											onClick={() => setNewPlace((prev) => ({ ...prev, name: preset }))}>
											{preset}
										</Chip>
									))}
								</div>
							</ModalBody>
							<ModalFooter>
								<Button color="danger" variant="light" onPress={onClose}>
									Cancel
								</Button>
								<Button
									color="primary"
									isLoading={isSavingLocation}
									onPress={async () => {
										if (!newPlace.name || !newPlace.address) return;
										await saveLocation({
											name: newPlace.name,
											address: newPlace.address,
											lat: newPlace.lat || -26.2041,
											lng: newPlace.lng || 28.0473,
											type: newPlace.name.toLowerCase(),
										});
										onClose();
									}}>
									Save Place
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
};

export default Settings;