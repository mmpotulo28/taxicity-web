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

interface LoginProps {
	onLoginSuccess: () => void;
	onRegister: () => void;
	onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onRegister, onBack }) => {
	const [formData, setFormData] = React.useState({
		email: "",
		password: "",
		rememberMe: false,
	});
	const [isLoading, setIsLoading] = React.useState(false);
	const [errors, setErrors] = React.useState<{
		email?: string;
		password?: string;
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
			email?: string;
			password?: string;
		} = {};

		if (!formData.email) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Email is invalid";
		}

		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
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
			onLoginSuccess();
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

			{/* Login Form */}
			<div className="flex-1 flex items-center justify-center p-4">
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
							<h2 className="text-lg font-medium">Welcome Back</h2>
							<p className="text-sm text-default-500">
								Sign in to your account to continue
							</p>
						</CardHeader>

						<CardBody className="py-5 px-6 space-y-4">
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
								label="Password"
								placeholder="Enter your password"
								type="password"
								value={formData.password}
								onValueChange={(value) => handleChange("password", value)}
								startContent={
									<Icon icon="lucide:lock" className="text-default-400" />
								}
								isInvalid={!!errors.password}
								errorMessage={errors.password}
							/>

							<div className="flex justify-between items-center">
								<Checkbox
									isSelected={formData.rememberMe}
									onValueChange={(value) => handleChange("rememberMe", value)}>
									<span className="text-sm">Remember me</span>
								</Checkbox>

								<Link href="#" size="sm">
									Forgot password?
								</Link>
							</div>

							<Button
								color="primary"
								className="w-full"
								onPress={handleSubmit}
								isLoading={isLoading}>
								Sign In
							</Button>

							{/* Replace Divider with children with a custom divider */}
							<div className="flex items-center my-4">
								<Divider className="flex-1" />
								<span className="mx-4 text-xs text-default-400">
									OR CONTINUE WITH
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
								Don't have an account?{" "}
								<Link href="#" onPress={onRegister}>
									Sign up
								</Link>
							</p>
						</CardFooter>
					</Card>
				</motion.div>
			</div>
		</div>
	);
};
