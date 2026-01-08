"use client";
import React, { useState } from "react";
import { Card, CardBody, Input, Button, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/toast";

export default function AdminLogin() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			// In a real app, this would be an actual API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Success - redirect to dashboard
			addToast({
				title: "Login successful",
				description: "Welcome to TaxiCity Admin Dashboard",
				color: "success",
			});

			router.push("/secure/dashboard");
		} catch (error) {
			console.error("Login error:", error);
			addToast({
				title: "Login failed",
				description: "Invalid credentials. Please try again.",
				color: "danger",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-6">
					<div className="flex items-center justify-center gap-2 mb-2">
						<Icon className="text-primary text-3xl" icon="lucide:taxi" />
						<h1 className="text-2xl font-bold">TaxiCity Admin</h1>
					</div>
					<p className="text-default-500 text-sm">Sign in to access the dashboard</p>
				</div>

				<Card className="shadow-lg">
					<CardBody className="p-6">
						<form className="space-y-4" onSubmit={handleSubmit}>
							<Input
								isRequired
								label="Email"
								placeholder="admin@taxicity.co.za"
								startContent={
									<Icon className="text-default-400" icon="lucide:mail" />
								}
								type="email"
								value={formData.email}
								onValueChange={(value) => handleChange("email", value)}
							/>

							<Input
								isRequired
								label="Password"
								placeholder="••••••••"
								startContent={
									<Icon className="text-default-400" icon="lucide:lock" />
								}
								type="password"
								value={formData.password}
								onValueChange={(value) => handleChange("password", value)}
							/>

							<Button
								className="w-full"
								color="primary"
								isLoading={isLoading}
								size="lg"
								type="submit">
								Sign In
							</Button>

							<div className="text-center mt-4">
								<button
									className="text-primary text-sm"
									style={{
										background: "none",
										border: "none",
										padding: 0,
										cursor: "pointer",
									}}
									type="button"
									onClick={() => {
										// TODO: Implement forgot password logic
									}}>
									Forgot password?
								</button>
							</div>

							<Divider className="my-4" />

							<div className="text-center text-xs text-default-500">
								<p>For support, contact IT department</p>
								<p>© 2023 TaxiCity. All rights reserved.</p>
							</div>
						</form>
					</CardBody>
				</Card>
			</div>
		</div>
	);
}
