import React from "react";
import { motion } from "framer-motion";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	CardFooter,
	Input,
	Link,
	Divider,
	Checkbox,
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface RegisterProps {
	onRegisterSuccess: () => void;
	onLogin: () => void;
	onBack: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onLogin, onBack }) => {
	const [formData, setFormData] = React.useState({
		fullName: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
		agreeTerms: false,
	});
	const [isLoading, setIsLoading] = React.useState(false);
	const [errors, setErrors] = React.useState<{
		fullName?: string;
		email?: string;
		phone?: string;
		password?: string;
		confirmPassword?: string;
		agreeTerms?: string;
	}>({});

	const handleChange = (field: string, value: string | boolean) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));

		// Clear error when user starts typing
		if (errors[field as keyof typeof errors]) {
			setErrors((prev) => ({
				...prev,
				[field]: undefined,
			}));
		}
	};

	const validateForm = () => {
		const newErrors: {
			fullName?: string;
			email?: string;
			phone?: string;
			password?: string;
			confirmPassword?: string;
			agreeTerms?: string;
		} = {};

		if (!formData.fullName) {
			newErrors.fullName = "Full name is required";
		}

		if (!formData.email) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Email is invalid";
		}

		if (!formData.phone) {
			newErrors.phone = "Phone number is required";
		}

		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		if (!formData.agreeTerms) {
			newErrors.agreeTerms = "You must agree to the terms and conditions";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = () => {
		if (!validateForm()) return;

		setIsLoading(true);

		// Simulate API call
		setTimeout(() => {
			setIsLoading(false);
			onRegisterSuccess();
		}, 1500);
	};

	return (
		<div className="min-h-screen flex flex-col bg-background">
			{/* Header */}
			<header className="flex items-center justify-between p-4">
				<Button isIconOnly variant="light" aria-label="Back" onPress={onBack}>
					<Icon icon="lucide:arrow-left" className="text-xl" />
				</Button>
			</header>

			{/* Register Form */}
			<div className="flex-1 flex items-center justify-center p-4 py-8">
				<motion.div
					className="w-full max-w-md"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}>
					<Card className="shadow-md">
						<CardHeader className="flex flex-col items-center gap-2 pb-0">
							<div className="flex items-center gap-2">
								<Icon icon="lucide:taxi" className="text-primary text-2xl" />
								<h1 className="text-xl font-semibold">TaxiCity</h1>
							</div>
							<h2 className="text-lg font-medium">Create Account</h2>
							<p className="text-sm text-default-500">
								Sign up to get started with TaxiCity
							</p>
						</CardHeader>

						<CardBody className="py-5 px-6 space-y-4">
							<Input
								label="Full Name"
								placeholder="Enter your full name"
								value={formData.fullName}
								onValueChange={(value) => handleChange("fullName", value)}
								startContent={
									<Icon icon="lucide:user" className="text-default-400" />
								}
								isInvalid={!!errors.fullName}
								errorMessage={errors.fullName}
							/>

							<Input
								label="Email"
								placeholder="Enter your email"
								type="email"
								value={formData.email}
								onValueChange={(value) => handleChange("email", value)}
								startContent={
									<Icon icon="lucide:mail" className="text-default-400" />
								}
								isInvalid={!!errors.email}
								errorMessage={errors.email}
							/>

							<Input
								label="Phone Number"
								placeholder="Enter your phone number"
								value={formData.phone}
								onValueChange={(value) => handleChange("phone", value)}
								startContent={
									<Icon icon="lucide:phone" className="text-default-400" />
								}
								isInvalid={!!errors.phone}
								errorMessage={errors.phone}
							/>

							<Input
								label="Password"
								placeholder="Create a password"
								type="password"
								value={formData.password}
								onValueChange={(value) => handleChange("password", value)}
								startContent={
									<Icon icon="lucide:lock" className="text-default-400" />
								}
								isInvalid={!!errors.password}
								errorMessage={errors.password}
							/>

							<Input
								label="Confirm Password"
								placeholder="Confirm your password"
								type="password"
								value={formData.confirmPassword}
								onValueChange={(value) => handleChange("confirmPassword", value)}
								startContent={
									<Icon icon="lucide:lock" className="text-default-400" />
								}
								isInvalid={!!errors.confirmPassword}
								errorMessage={errors.confirmPassword}
							/>

							<div>
								<Checkbox
									isSelected={formData.agreeTerms}
									onValueChange={(value) => handleChange("agreeTerms", value)}
									isInvalid={!!errors.agreeTerms}>
									<span className="text-sm">
										I agree to the{" "}
										<Link href="#" size="sm">
											Terms of Service
										</Link>{" "}
										and{" "}
										<Link href="#" size="sm">
											Privacy Policy
										</Link>
									</span>
								</Checkbox>
								{errors.agreeTerms && (
									<p className="text-xs text-danger mt-1">{errors.agreeTerms}</p>
								)}
							</div>

							<Button
								color="primary"
								className="w-full"
								onPress={handleSubmit}
								isLoading={isLoading}>
								Create Account
							</Button>

							{/* Replace Divider with children with a custom divider */}
							<div className="flex items-center my-4">
								<Divider className="flex-1" />
								<span className="mx-4 text-xs text-default-400">
									OR SIGN UP WITH
								</span>
								<Divider className="flex-1" />
							</div>

							<div className="grid grid-cols-2 gap-3">
								<Button
									variant="bordered"
									startContent={
										<Icon icon="logos:google-icon" className="text-lg" />
									}>
									Google
								</Button>
								<Button
									variant="bordered"
									startContent={
										<Icon icon="logos:facebook" className="text-lg" />
									}>
									Facebook
								</Button>
							</div>
						</CardBody>

						<CardFooter className="justify-center pt-0">
							<p className="text-sm text-default-500">
								Already have an account?{" "}
								<Link href="#" onPress={onLogin}>
									Sign in
								</Link>
							</p>
						</CardFooter>
					</Card>
				</motion.div>
			</div>
		</div>
	);
};
