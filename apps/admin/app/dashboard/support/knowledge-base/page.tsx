"use client";
import React, { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import {
	Button,
	Input,
	Tabs,
	Tab,
	Chip,
	useDisclosure,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Textarea,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/toast";

// Knowledge base categories
const categories = [
	{ key: "all", name: "All Articles", icon: "lucide:book" },
	{ key: "payment", name: "Payment Issues", icon: "lucide:credit-card" },
	{ key: "account", name: "Account Management", icon: "lucide:user-plus" },
	{ key: "taxi", name: "Taxi Services", icon: "lucide:car" },
	{ key: "safety", name: "Safety & Security", icon: "lucide:shield" },
	{ key: "app", name: "App Usage", icon: "lucide:smartphone" },
];

interface iKnowledgeBaseArticle {
	id: string;
	title: string;
	content: string;
	category: string;
	views: number;
	lastUpdated: string;
}

// Sample knowledge base articles
const knowledgeBaseArticles: iKnowledgeBaseArticle[] = [
	{
		id: "kb1",
		title: "How to troubleshoot payment issues",
		content:
			"When users encounter payment issues, they should first check their internet connection and then verify their payment method is valid. If problems persist, they can try adding a new payment method or contact support with the transaction reference number.",
		category: "payment",
		views: 1245,
		lastUpdated: "2023-10-15",
	},
	{
		id: "kb2",
		title: "Driver registration process",
		content:
			"To register as a driver, applicants must provide a valid driver's license, vehicle registration documents, proof of insurance, and undergo a background check. Applications typically take 2-3 business days to process once all required documents are submitted.",
		category: "account",
		views: 982,
		lastUpdated: "2023-09-22",
	},
	{
		id: "kb3",
		title: "Refund policy and procedures",
		content:
			"Refunds may be requested within 24 hours of trip completion if there were service issues. To request a refund, users should navigate to their trip history, select the specific trip, and tap 'Request Refund.' Refund processing typically takes 3-5 business days.",
		category: "payment",
		views: 876,
		lastUpdated: "2023-11-05",
	},
	{
		id: "kb4",
		title: "Taxi tracking features explained",
		content:
			"The taxi tracking feature allows users to monitor their taxi's location in real-time once a trip is confirmed. The system updates location every 15 seconds and provides estimated arrival times based on current traffic conditions and distance.",
		category: "taxi",
		views: 754,
		lastUpdated: "2023-10-30",
	},
	{
		id: "kb5",
		title: "Managing user account settings",
		content:
			"Users can manage their account settings by tapping the profile icon and selecting 'Settings.' From there, they can update personal information, change payment methods, manage notification preferences, and adjust privacy settings.",
		category: "account",
		views: 623,
		lastUpdated: "2023-11-12",
	},
	{
		id: "kb6",
		title: "Safety features for passengers",
		content:
			"Our app includes several safety features such as driver verification, trip sharing with trusted contacts, in-app emergency assistance, and post-trip feedback. We also conduct regular background checks on all drivers and verify their documentation.",
		category: "safety",
		views: 589,
		lastUpdated: "2023-11-10",
	},
	{
		id: "kb7",
		title: "How to update the app",
		content:
			"To ensure you have the latest features and security updates, regularly check for app updates. On iOS, visit the App Store and tap 'Updates.' On Android, open the Google Play Store, tap your profile icon, and select 'Manage apps & device' to check for updates.",
		category: "app",
		views: 512,
		lastUpdated: "2023-10-25",
	},
	{
		id: "kb8",
		title: "Understanding surge pricing",
		content:
			"Surge pricing occurs during periods of high demand when there are more ride requests than available taxis. Prices increase to encourage more drivers to become available. The app clearly displays when surge pricing is in effect and the exact fare before you confirm your trip.",
		category: "payment",
		views: 478,
		lastUpdated: "2023-09-18",
	},
];

export default function KnowledgeBasePage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeCategory, setActiveCategory] = useState("all");
	const [selectedArticle, setSelectedArticle] = useState<iKnowledgeBaseArticle | null>(null);
	const [editingArticle, setEditingArticle] = useState<iKnowledgeBaseArticle | null>(null);

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	const {
		isOpen: isEditOpen,
		onOpen: onEditOpen,
		onOpenChange: onEditOpenChange,
		onClose: onEditClose,
	} = useDisclosure();

	// Filter articles based on search query and category
	const filteredArticles = knowledgeBaseArticles.filter((article) => {
		const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory = activeCategory === "all" || article.category === activeCategory;

		return matchesSearch && matchesCategory;
	});

	// Handle article click
	const handleViewArticle = (article: iKnowledgeBaseArticle) => {
		setSelectedArticle(article);
		onOpen();
	};

	// Handle edit article
	const handleEditArticle = (article: iKnowledgeBaseArticle) => {
		setEditingArticle({
			...article,
			title: article.title,
			content: article.content,
			category: article.category,
		});
		onEditOpen();
	};

	// Handle save article changes
	const handleSaveArticle = () => {
		// In a real app, this would make an API call to update the article
		addToast({
			title: "Article Updated",
			description: "The knowledge base article has been updated successfully",
			color: "success",
		});
		onEditClose();
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold">Knowledge Base</h1>
					<Breadcrumbs>
						<BreadcrumbItem>Admin</BreadcrumbItem>
						<BreadcrumbItem>Dashboard</BreadcrumbItem>
						<BreadcrumbItem>Support</BreadcrumbItem>
						<BreadcrumbItem>Knowledge Base</BreadcrumbItem>
					</Breadcrumbs>
				</div>

				<div className="flex gap-2">
					<Button
						color="primary"
						startContent={<Icon icon="lucide:file-text" />}
						variant="flat">
						Import Articles
					</Button>
					<Button color="primary" startContent={<Icon icon="lucide:plus" />}>
						Create Article
					</Button>
				</div>
			</div>

			{/* Search and Filter */}
			<Card className="shadow-sm">
				<CardBody className="p-4">
					<div className="flex flex-col sm:flex-row gap-4 items-center">
						<Input
							className="w-full sm:w-96"
							placeholder="Search knowledge base articles..."
							startContent={<Icon icon="lucide:search" />}
							value={searchQuery}
							onValueChange={setSearchQuery}
						/>
						<div className="flex-shrink-0 flex gap-2 ml-auto">
							<Button
								color="primary"
								startContent={<Icon icon="lucide:file-export" />}
								variant="flat">
								Export Articles
							</Button>
							<Button startContent={<Icon icon="lucide:refresh-cw" />} variant="flat">
								Refresh
							</Button>
						</div>
					</div>
				</CardBody>
			</Card>

			{/* Categories */}
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
				{categories.map((category) => (
					<Card
						key={category.key}
						isPressable
						className={activeCategory === category.key ? "border-2 border-primary" : ""}
						onPress={() => setActiveCategory(category.key)}>
						<CardBody className="p-3 flex flex-col items-center text-center">
							<div
								className={`w-10 h-10 rounded-full flex items-center justify-center ${
									activeCategory === category.key
										? "bg-primary/20 text-primary"
										: "bg-default-100 text-default-500"
								}`}>
								<Icon className="text-xl" icon={category.icon} />
							</div>
							<p className="mt-2 text-sm font-medium">{category.name}</p>
						</CardBody>
					</Card>
				))}
			</div>

			{/* Articles List */}
			<Card>
				<CardHeader>
					<h2 className="text-lg font-medium">
						{activeCategory === "all"
							? "All Articles"
							: categories.find((c) => c.key === activeCategory)?.name || "Articles"}
					</h2>
				</CardHeader>
				<CardBody>
					{filteredArticles.length > 0 ? (
						<div className="space-y-4">
							{filteredArticles.map((article) => (
								<Card key={article.id} isPressable shadow="sm">
									<CardBody className="p-4">
										<div className="flex justify-between items-start">
											<button
												className="flex-1 cursor-pointer"
												onClick={() => handleViewArticle(article)}>
												<h3 className="font-medium">{article.title}</h3>
												<div className="flex items-center gap-2 mt-2">
													<Chip
														color={
															article.category === "payment"
																? "primary"
																: article.category === "account"
																	? "success"
																	: article.category === "taxi"
																		? "warning"
																		: article.category ===
																			  "safety"
																			? "danger"
																			: "default"
														}
														size="sm"
														variant="flat">
														{article.category}
													</Chip>
													<p className="text-xs text-default-500">
														{article.views} views
													</p>
													<p className="text-xs text-default-500">
														Updated: {article.lastUpdated}
													</p>
												</div>
											</button>
											<div className="flex gap-2 ml-4">
												<Button
													isIconOnly
													size="sm"
													variant="light"
													onPress={() => handleEditArticle(article)}>
													<Icon icon="lucide:edit" />
												</Button>
												<Button
													isIconOnly
													color="danger"
													size="sm"
													variant="light">
													<Icon icon="lucide:trash-2" />
												</Button>
											</div>
										</div>
									</CardBody>
								</Card>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<Icon
								className="text-4xl text-default-300 mx-auto mb-2"
								icon="lucide:file-question"
							/>
							<p className="text-default-500">No articles found</p>
							<Button
								className="mt-2"
								color="primary"
								size="sm"
								variant="flat"
								onPress={() => {
									setSearchQuery("");
									setActiveCategory("all");
								}}>
								Clear filters
							</Button>
						</div>
					)}
				</CardBody>
			</Card>

			{/* View Article Modal */}
			{selectedArticle && (
				<Modal isOpen={isOpen} size="3xl" onOpenChange={onOpenChange}>
					<ModalContent>
						{() => (
							<>
								<ModalHeader>
									<h3>{selectedArticle.title}</h3>
								</ModalHeader>

								<ModalBody>
									<div className="flex justify-between items-center mb-4">
										<div className="flex items-center gap-2">
											<Chip
												color={
													selectedArticle.category === "payment"
														? "primary"
														: selectedArticle.category === "account"
															? "success"
															: selectedArticle.category === "taxi"
																? "warning"
																: selectedArticle.category ===
																	  "safety"
																	? "danger"
																	: "default"
												}
												size="sm"
												variant="flat">
												{selectedArticle.category}
											</Chip>
											<p className="text-xs text-default-500">
												{selectedArticle.views} views
											</p>
										</div>
										<p className="text-xs text-default-500">
											Last updated: {selectedArticle.lastUpdated}
										</p>
									</div>

									<div className="prose max-w-none">
										<p>{selectedArticle.content}</p>
									</div>

									<div className="mt-6 bg-default-50 p-4 rounded-lg">
										<h4 className="font-medium mb-2">Related Articles</h4>
										<ul className="space-y-2">
											{knowledgeBaseArticles
												.filter(
													(article) =>
														article.id !== selectedArticle.id &&
														article.category ===
															selectedArticle.category,
												)
												.slice(0, 3)
												.map((article) => (
													<li key={article.id}>
														<Button
															className="w-full justify-start p-2"
															variant="light"
															onPress={() => {
																setSelectedArticle(article);
															}}>
															<div className="text-left">
																<p className="font-medium">
																	{article.title}
																</p>
																<p className="text-xs text-default-500">
																	{article.views} views
																</p>
															</div>
														</Button>
													</li>
												))}
										</ul>
									</div>
								</ModalBody>

								<ModalFooter>
									<Button
										color="primary"
										startContent={<Icon icon="lucide:edit" />}
										variant="flat"
										onPress={() => {
											onClose();
											handleEditArticle(selectedArticle);
										}}>
										Edit Article
									</Button>
									<Button color="primary" onPress={onClose}>
										Close
									</Button>
								</ModalFooter>
							</>
						)}
					</ModalContent>
				</Modal>
			)}

			{/* Edit Article Modal */}
			{editingArticle && (
				<Modal isOpen={isEditOpen} size="3xl" onOpenChange={onEditOpenChange}>
					<ModalContent>
						{() => (
							<>
								<ModalHeader>Edit Article</ModalHeader>

								<ModalBody>
									<div className="space-y-4">
										<Input
											label="Title"
											value={editingArticle.title}
											onChange={(e) =>
												setEditingArticle({
													...editingArticle,
													title: e.target.value,
												})
											}
										/>

										<Tabs
											selectedKey={editingArticle.category}
											onSelectionChange={(key) =>
												setEditingArticle({
													...editingArticle,
													category: key.toString(),
												})
											}>
											{categories
												.filter((c) => c.key !== "all")
												.map((category) => (
													<Tab
														key={category.key}
														title={
															<div className="flex items-center gap-2">
																<Icon
																	className="text-sm"
																	icon={category.icon}
																/>
																<span>{category.name}</span>
															</div>
														}
													/>
												))}
										</Tabs>

										<Textarea
											label="Content"
											minRows={10}
											placeholder="Enter article content here..."
											value={editingArticle.content}
											onChange={(e) =>
												setEditingArticle({
													...editingArticle,
													content: e.target.value,
												})
											}
										/>
									</div>
								</ModalBody>

								<ModalFooter>
									<Button variant="flat" onPress={onEditClose}>
										Cancel
									</Button>
									<Button color="primary" onPress={handleSaveArticle}>
										Save Changes
									</Button>
								</ModalFooter>
							</>
						)}
					</ModalContent>
				</Modal>
			)}
		</div>
	);
}
