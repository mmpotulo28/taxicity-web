"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Icon } from "@iconify/react";
import { Select, SelectItem } from "@heroui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@taxiciti/ui";
import { useDriver } from "@/context/DriverContext";
import { apiGet, apiPost, apiRequest } from "@/lib/api-client";

interface DriverRouteOption {
	id: string;
	name: string;
}

export default function DriverApplicationPage() {
	const router = useRouter();
	const { driver, isLoading } = useDriver();
	const [submitting, setSubmitting] = useState(false);
	const [step, setStep] = useState(1);
	const [routes, setRoutes] = useState<DriverRouteOption[]>([]);
	const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
	const [routesError, setRoutesError] = useState<string | null>(null);
	const [routeSearch, setRouteSearch] = useState("");

	// Form State
	const [formData, setFormData] = useState({
		licenseNumber: "",
		licenseExpiry: "",
		licenseImageFront: "",
		licenseImageBack: "",
		plateNumber: "",
		make: "",
		model: "",
		year: "",
		color: "",
		capacity: "",
		routeId: "",
		registrationDoc: "",
		insuranceDoc: "",
		permitDoc: "",
	});

	const [uploading, setUploading] = useState<string | null>(null);

	// --- Pricing / Marketing Data ---
	const pricingBenefits = [
		{
			title: "Transparent Fees",
			desc: "Only 5% fee per passenger trip. One of the lowest in the market.",
			icon: "solar:wallet-bold-duotone",
		},
		{
			title: "Volume Incentives",
			desc: "Do >100 trips? Your fee drops to 3.5% for the month.",
			icon: "solar:graph-up-bold-duotone",
		},
		{
			title: "Long Distance Cap",
			desc: "Fees are capped at R10.00 for trips over R200.",
			icon: "solar:shield-check-bold-duotone",
		},
	];
	// --------------------------------

	useEffect(() => {
		const fetchRoutes = async () => {
			setIsLoadingRoutes(true);
			setRoutesError(null);

			try {
				const limit = 200;
				let page = 1;
				let totalPages = 1;
				const allRoutes: DriverRouteOption[] = [];

				do {
					const data = await apiGet<{
						routes?: DriverRouteOption[];
						pagination?: { pages?: number };
					}>(`/api/user/routes?page=${page}&limit=${limit}`);

					allRoutes.push(...(data.routes || []));
					totalPages = data.pagination?.pages || 1;
					page += 1;
				} while (page <= totalPages);

				const dedupedRoutes = Array.from(new Map(allRoutes.map((route) => [route.id, route])).values());
				setRoutes(dedupedRoutes);
			} catch (err) {
				console.error("Failed to fetch routes", err);
				setRoutesError("Failed to load routes. Please refresh and try again.");
			} finally {
				setIsLoadingRoutes(false);
			}
		};

		fetchRoutes();
	}, []);

	const filteredRoutes = useMemo(() => {
		const query = routeSearch.trim().toLowerCase();
		if (!query) return routes;

		return routes.filter((route) => route.name.toLowerCase().includes(query));
	}, [routeSearch, routes]);

	useEffect(() => {
		if (!isLoading && driver) {
			if (driver.status === "ACTIVE") {
				router.push("/");
			} else if (driver.status === "PENDING_VERIFICATION") {
				router.push("/status");
			}
		}
	}, [driver, isLoading, router]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
		if (!e.target.files?.[0]) return;

		setUploading(field);
		const file = e.target.files[0];

		try {
			const newBlob = await apiRequest<{ url: string }>(`/api/upload?filename=${file.name}`, {
				method: "POST",
				body: file,
			});
			setFormData((prev) => ({ ...prev, [field]: newBlob.url }));
		} catch (error) {
			console.error("Error uploading file:", error);
			alert("Failed to upload file");
		} finally {
			setUploading(null);
		}
	};

	const handleSubmit = async () => {
		setSubmitting(true);
		try {
			await apiPost("/api/driver/apply", formData);
			router.push("/status");
		} catch (error) {
			console.error("Application error:", error);
			alert("Something went wrong. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	if (isLoading)
		return (
			<div className='flex justify-center items-center h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
			</div>
		);

	const steps = [
		{ id: 1, title: "Driver Info", icon: "lucide:user" },
		{ id: 2, title: "Vehicle Info", icon: "lucide:car" },
		{ id: 3, title: "Route", icon: "lucide:map" },
		{ id: 4, title: "Documents", icon: "lucide:file-text" },
	];

	return (
		<div className='min-h-screen bg-default-50'>
			<Header />
			<div className='max-w-2xl mx-auto p-4 pb-24 pt-20'>
				<header className='mb-8 text-center'>
					<h1 className='text-3xl font-bold mb-2'>Become a Driver</h1>
					<p className='text-default-500'>Complete the application to start earning</p>
				</header>

				{/* Pricing Info Card */}
				<div className='mb-8 grid grid-cols-1 md:grid-cols-3 gap-4'>
					{pricingBenefits.map((benefit, idx) => (
						<Card key={idx} className='bg-primary-50 items-center text-center p-4 border border-primary-100 shadow-sm'>
							<div className='p-3 rounded-full bg-primary/10 mb-3 text-primary'>
								<Icon icon={benefit.icon} width={24} />
							</div>
							<h3 className='font-semibold text-primary-900 mb-1'>{benefit.title}</h3>
							<p className='text-tiny text-primary-700'>{benefit.desc}</p>
						</Card>
					))}
				</div>

				{/* Stepper */}
				<div className='flex justify-between mb-8 px-4'>
					{steps.map((s, index) => (
						<div key={s.id} className='flex flex-col items-center relative z-10'>
							<div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${step >= s.id ? "bg-primary text-white" : "bg-default-200 text-default-500"}`}>
								<Icon icon={s.icon} width={20} />
							</div>
							<span className={`text-xs font-medium ${step >= s.id ? "text-primary" : "text-default-500"}`}>{s.title}</span>
							{index < steps.length - 1 && <div className={`absolute top-5 left-1/2 w-full h-[2px] -z-10 ${step > s.id ? "bg-primary" : "bg-default-200"}`} style={{ width: "calc(100% + 2rem)", transform: "translateX(50%)" }} />}
						</div>
					))}
				</div>

				<Card className='overflow-visible'>
					<CardBody className='p-6'>
						<AnimatePresence mode='wait'>
							<motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
								{step === 1 && (
									<div className='space-y-6'>
										<h2 className='text-xl font-semibold'>Driver Information</h2>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
											<Input label="Driver's License Number" name='licenseNumber' placeholder='Enter your license number' value={formData.licenseNumber} onChange={handleChange} isRequired variant='bordered' />
											<Input type='date' label='License Expiry Date' name='licenseExpiry' placeholder='Select expiry date' value={formData.licenseExpiry} onChange={handleChange} isRequired variant='bordered' />
										</div>

										<div className='grid grid-cols-2 gap-4'>
											<div>
												<p className='text-small mb-2 font-medium'>License Front</p>
												<Card isPressable className='w-full h-32 border-2 border-dashed border-default-300 bg-transparent hover:bg-default-100 flex items-center justify-center' onPress={() => document.getElementById("licenseFront")?.click()}>
													{formData.licenseImageFront ? (
														<img src={formData.licenseImageFront} alt='Front' className='w-full h-full object-cover rounded-lg' />
													) : (
														<div className='flex flex-col items-center'>
															<Icon icon='lucide:camera' className='w-6 h-6 mb-1 text-default-500' />
															<span className='text-xs text-default-500'>{uploading === "licenseImageFront" ? "Uploading..." : "Upload Front"}</span>
														</div>
													)}
													<input id='licenseFront' type='file' className='hidden' accept='image/*' onChange={(e) => handleFileUpload(e, "licenseImageFront")} />
												</Card>
											</div>
											<div>
												<p className='text-small mb-2 font-medium'>License Back</p>
												<Card isPressable className='w-full h-32 border-2 border-dashed border-default-300 bg-transparent hover:bg-default-100 flex items-center justify-center' onPress={() => document.getElementById("licenseBack")?.click()}>
													{formData.licenseImageBack ? (
														<img src={formData.licenseImageBack} alt='Back' className='w-full h-full object-cover rounded-lg' />
													) : (
														<div className='flex flex-col items-center'>
															<Icon icon='lucide:camera' className='w-6 h-6 mb-1 text-default-500' />
															<span className='text-xs text-default-500'>{uploading === "licenseImageBack" ? "Uploading..." : "Upload Back"}</span>
														</div>
													)}
													<input id='licenseBack' type='file' className='hidden' accept='image/*' onChange={(e) => handleFileUpload(e, "licenseImageBack")} />
												</Card>
											</div>
										</div>

										<Button color='primary' className='w-full mt-4' size='lg' onPress={() => setStep(2)} isDisabled={!formData.licenseNumber || !formData.licenseExpiry || !formData.licenseImageFront || !formData.licenseImageBack}>
											Next Step
										</Button>
									</div>
								)}

								{step === 2 && (
									<div className='space-y-6'>
										<h2 className='text-xl font-semibold'>Vehicle Information</h2>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
											<Input label='Vehicle Plate Number' name='plateNumber' placeholder='ABC 123 GP' value={formData.plateNumber} onChange={handleChange} isRequired variant='bordered' />
											<Input label='Vehicle Make' name='make' placeholder='Toyota' value={formData.make} onChange={handleChange} isRequired variant='bordered' />
											<Input label='Vehicle Model' name='model' placeholder='Toyota Quantum' value={formData.model} onChange={handleChange} isRequired variant='bordered' />
											<Input label='Vehicle Color' name='color' placeholder='White' value={formData.color} onChange={handleChange} isRequired variant='bordered' />
											<Input type='number' label='Year' name='year' placeholder='2020' value={formData.year} onChange={handleChange} isRequired variant='bordered' />
											<Input type='number' label='Capacity' name='capacity' placeholder='15' value={formData.capacity} onChange={handleChange} isRequired variant='bordered' />
										</div>
										<div className='flex gap-4 mt-6'>
											<Button variant='flat' onPress={() => setStep(1)} className='flex-1'>
												Back
											</Button>
											<Button color='primary' className='flex-1' onPress={() => setStep(3)} isDisabled={!formData.plateNumber || !formData.make || !formData.model || !formData.year || !formData.color || !formData.capacity}>
												Next Step
											</Button>
										</div>
									</div>
								)}

								{step === 3 && (
									<div className='space-y-6'>
										<h2 className='text-xl font-semibold'>Route Selection</h2>
										<p className='text-small text-default-500'>Select the primary route you will be operating on. You must provide a valid operating permit for this route in the next step.</p>

										{isLoadingRoutes ? (
											<div className='flex items-center gap-3 rounded-large border border-default-200 bg-default-50 p-4'>
												<div className='animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent' />
												<div>
													<p className='text-sm font-medium'>Loading routes...</p>
													<p className='text-xs text-default-500'>Please wait while we fetch available routes.</p>
												</div>
											</div>
										) : (
											<>
												<Input label='Search Route' placeholder='Type route name to filter (e.g. Soweto - CBD)' value={routeSearch} onChange={(e) => setRouteSearch(e.target.value)} startContent={<Icon icon='lucide:search' className='text-default-400' />} variant='bordered' isClearable onClear={() => setRouteSearch("")} />

												{!routesError && (
													<p className='text-xs text-default-500'>
														Showing {filteredRoutes.length} of {routes.length} routes
													</p>
												)}

												<Select label='Select Route' placeholder={filteredRoutes.length > 0 ? "Choose a route" : "No routes found"} selectedKeys={formData.routeId ? [formData.routeId] : []} onChange={(e) => setFormData({ ...formData, routeId: e.target.value })} variant='bordered' isDisabled={filteredRoutes.length === 0}>
													{filteredRoutes.map((route) => (
														<SelectItem key={route.id}>{route.name}</SelectItem>
													))}
												</Select>

												{routesError && <p className='text-danger text-sm'>{routesError}</p>}
												{!routesError && filteredRoutes.length === 0 && <p className='text-default-500 text-sm'>{routeSearch ? "No routes match your search. Try a different keyword." : "No routes are currently available."}</p>}
											</>
										)}

										<div className='flex gap-4 mt-6'>
											<Button variant='flat' onPress={() => setStep(2)} className='flex-1'>
												Back
											</Button>
											<Button color='primary' className='flex-1' onPress={() => setStep(4)} isDisabled={!formData.routeId || isLoadingRoutes}>
												Next Step
											</Button>
										</div>
									</div>
								)}

								{step === 4 && (
									<div className='space-y-6'>
										<h2 className='text-xl font-semibold'>Document Upload</h2>

										{/* Registration Document */}
										<Card isPressable className={`border-2 border-dashed p-4 w-full ${formData.registrationDoc ? "border-success bg-success-50" : "border-default-300 hover:bg-default-100"}`} onPress={() => document.getElementById("regDoc")?.click()}>
											<CardBody className='flex flex-row items-center gap-4'>
												{formData.registrationDoc ? <Icon icon='lucide:check-circle' className='w-8 h-8 text-success' /> : <Icon icon='lucide:file-text' className='w-8 h-8 text-default-500' />}
												<div className='text-left'>
													<p className={`text-sm font-medium ${formData.registrationDoc ? "text-success-700" : ""}`}>{formData.registrationDoc ? "Registration Document Uploaded" : "Upload Registration Document"}</p>
													{!formData.registrationDoc && <p className='text-xs text-default-400'>{uploading === "registrationDoc" ? "Uploading..." : "Tap to select file"}</p>}
												</div>
											</CardBody>
											<input id='regDoc' type='file' className='hidden' accept='.pdf,image/*' onChange={(e) => handleFileUpload(e, "registrationDoc")} />
										</Card>

										{/* Insurance Document */}
										<Card isPressable className={`border-2 border-dashed p-4 w-full ${formData.insuranceDoc ? "border-success bg-success-50" : "border-default-300 hover:bg-default-100"}`} onPress={() => document.getElementById("insDoc")?.click()}>
											<CardBody className='flex flex-row items-center gap-4'>
												{formData.insuranceDoc ? <Icon icon='lucide:check-circle' className='w-8 h-8 text-success' /> : <Icon icon='lucide:shield-check' className='w-8 h-8 text-default-500' />}
												<div className='text-left'>
													<p className={`text-sm font-medium ${formData.insuranceDoc ? "text-success-700" : ""}`}>{formData.insuranceDoc ? "Insurance Document Uploaded" : "Upload Insurance Document"}</p>
													{!formData.insuranceDoc && <p className='text-xs text-default-400'>{uploading === "insuranceDoc" ? "Uploading..." : "Tap to select file"}</p>}
												</div>
											</CardBody>
											<input id='insDoc' type='file' className='hidden' accept='.pdf,image/*' onChange={(e) => handleFileUpload(e, "insuranceDoc")} />
										</Card>

										{/* Permit Document */}
										<Card isPressable className={`border-2 border-dashed p-4 w-full ${formData.permitDoc ? "border-success bg-success-50" : "border-default-300 hover:bg-default-100"}`} onPress={() => document.getElementById("permitDoc")?.click()}>
											<CardBody className='flex flex-row items-center gap-4'>
												{formData.permitDoc ? <Icon icon='lucide:check-circle' className='w-8 h-8 text-success' /> : <Icon icon='lucide:badge-check' className='w-8 h-8 text-default-500' />}
												<div className='text-left'>
													<p className={`text-sm font-medium ${formData.permitDoc ? "text-success-700" : ""}`}>{formData.permitDoc ? "Operating Permit Uploaded" : "Upload Operating Permit"}</p>
													{!formData.permitDoc && <p className='text-xs text-default-400'>{uploading === "permitDoc" ? "Uploading..." : "Tap to select file"}</p>}
												</div>
											</CardBody>
											<input id='permitDoc' type='file' className='hidden' accept='.pdf,image/*' onChange={(e) => handleFileUpload(e, "permitDoc")} />
										</Card>

										<div className='flex gap-4 mt-6'>
											<Button variant='flat' onPress={() => setStep(3)} className='flex-1'>
												Back
											</Button>
											<Button color='primary' className='flex-1' onPress={handleSubmit} isLoading={submitting} isDisabled={!formData.registrationDoc || !formData.insuranceDoc || !formData.permitDoc}>
												Submit Application
											</Button>
										</div>
									</div>
								)}
							</motion.div>
						</AnimatePresence>
					</CardBody>
				</Card>
			</div>
		</div>
	);
}
