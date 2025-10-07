"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button, Input, Textarea, Card, CardBody, RadioGroup, Radio, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/toast";

const issues = [
	"Driver behavior",
	"Vehicle condition",
	"Route deviation",
	"Overcharging",
	"Safety concerns",
	"Cleanliness",
	"Other",
];

const ReportTaxi = () => {
	const router = useRouter();
	const [registrationNumber, setRegistrationNumber] = useState("");
	const [selectedIssue, setSelectedIssue] = useState("");
	const [details, setDetails] = useState("");
	const [isFormValid, setIsFormValid] = useState(false);

	// Validate form
	React.useEffect(() => {
		setIsFormValid(!!registrationNumber && !!selectedIssue && details.length >= 10);
	}, [registrationNumber, selectedIssue, details]);

	const handleSubmit = () => {
		if (!isFormValid) return;

		// In a real app, this would send the report to a server
		addToast({
			title: "Report Submitted",
			description: "Thank you for helping us improve our service.",
			color: "success",
		});

		router.push("/");
	};

	return (
		<motion.div
			animate={{ opacity: 1 }}
			className="h-full flex flex-col"
			initial={{ opacity: 0 }}
			transition={{ duration: 0.3 }}>
			<div className="p-4 bg-background shadow-sm">
				<h2 className="text-lg font-semibold mb-2">Report a Problem</h2>
				<p className="text-sm text-default-500">
					Help us improve our service by reporting issues
				</p>
			</div>

			<div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
				<Card className="mb-4">
					<CardBody className="p-4">
						<h3 className="text-sm font-semibold mb-3">Taxi Information</h3>

						<Input
							label="Registration Number"
							placeholder="e.g. GP ABC 123"
							value={registrationNumber}
							onValueChange={setRegistrationNumber}
						/>

						<div className="mt-4">
							<p className="text-sm mb-2">Or scan the QR code from the taxi</p>
							<Button
								className="w-full"
								color="primary"
								startContent={<Icon icon="lucide:qr-code" />}
								variant="flat">
								Scan QR Code
							</Button>
						</div>
					</CardBody>
				</Card>

				<Card className="mb-4">
					<CardBody className="p-4">
						<h3 className="text-sm font-semibold mb-3">Issue Type</h3>

						<RadioGroup value={selectedIssue} onValueChange={setSelectedIssue}>
							{issues.map((issue) => (
								<Radio key={issue} value={issue}>
									{issue}
								</Radio>
							))}
						</RadioGroup>
					</CardBody>
				</Card>

				<Card className="mb-4">
					<CardBody className="p-4">
						<h3 className="text-sm font-semibold mb-3">Details</h3>

						<Textarea
							label="Please describe the issue"
							minRows={4}
							placeholder="Provide as many details as possible..."
							value={details}
							onValueChange={setDetails}
						/>

						<div className="mt-3">
							<Button
								className="w-full"
								color="primary"
								variant="light"
								onPress={() => {
									// This would open the camera in a real app
									addToast({
										title: "Camera Access",
										description: "Camera functionality would open here",
										color: "primary",
									});
								}}>
								<Icon className="mr-1" icon="lucide:camera" />
								Add Photos
							</Button>
						</div>
					</CardBody>
				</Card>

				<Divider className="my-4" />

				<div className="text-xs text-default-500 mb-4">
					Your report will be reviewed by our team. We may contact you for more
					information.
				</div>

				<Button
					className="w-full"
					color="primary"
					isDisabled={!isFormValid}
					onPress={handleSubmit}>
					Submit Report
				</Button>
			</div>
		</motion.div>
	);
};

export default ReportTaxi;
