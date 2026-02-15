"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	Table,
	TableHeader,
	TableBody,
	TableColumn,
	TableRow,
	TableCell,
	Button,
	Chip,
	Input,
	Pagination,
	Select,
	SelectItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRanks, type RankWithRelations } from "@/hooks/useRanks";
import Link from "next/link";

export default function RanksPage() {
	const { ranks = [], isLoading, deleteRank } = useRanks();
	const [searchQuery, setSearchQuery] = useState("");
	const [regionFilter, setRegionFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);

	const rowsPerPage = 10;

	// Derive unique regions from ranks using useMemo
	const uniqueRegions = useMemo(() => {
		return Array.from(
			new Set(ranks.map((rank) => rank.region).filter(Boolean))
		);
	}, [ranks]);

	// Derive filtered ranks using useMemo instead of useState + useEffect
	const filteredRanks = useMemo<RankWithRelations[]>(() => {
		let filtered: RankWithRelations[] = [...ranks];

		// Apply region filter
		if (regionFilter !== "all") {
			filtered = filtered.filter((rank) => rank.region === regionFilter);
		}

		// Apply search query filter
		if (searchQuery) {
			filtered = filtered.filter(
				(rank) =>
					rank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					rank.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
					rank.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
					(rank.region || "").toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		return filtered;
	}, [ranks, searchQuery, regionFilter]);

	// Reset to page 1 when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, regionFilter]);

	// Memoize selectedKeys to prevent infinite re-renders
	const selectedRegionKeys = useMemo(() => new Set([regionFilter]), [regionFilter]);

	// Memoize region items for Select component
	const regionItems = useMemo(
		() => [{ key: "all", label: "All Regions" }, ...uniqueRegions.map(r => ({ key: r, label: r }))],
		[uniqueRegions]
	);

	// Pagination
	const pages = useMemo(() => Math.ceil(filteredRanks.length / rowsPerPage), [filteredRanks.length]);
	const paginatedRanks = useMemo<RankWithRelations[]>(() => {
		return filteredRanks.slice(
			(currentPage - 1) * rowsPerPage,
			currentPage * rowsPerPage
		);
	}, [filteredRanks, currentPage]);

	const handleDelete = async (id: string, name: string) => {
		if (globalThis.confirm(`Are you sure you want to delete "${name}"?`)) {
			try {
				await deleteRank(id);
			} catch (error) {
				console.error("Error deleting rank:", error);
			}
		}
	};

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Taxi Ranks</h1>
					<p className="text-default-500 mt-1">Manage taxi ranks and locations</p>
				</div>
				<Link href="/dashboard/ranks/new">
					<Button color="primary" startContent={<Icon icon="lucide:plus" />}>
						Create New Rank
					</Button>
				</Link>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardBody className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-default-500">Total Ranks</p>
								<p className="text-2xl font-bold mt-1">{ranks.length}</p>
							</div>
							<div className="p-3 rounded-full bg-primary-100">
								<Icon icon="lucide:map-pin" className="text-2xl text-primary" />
							</div>
						</div>
					</CardBody>
				</Card>

				<Card>
					<CardBody className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-default-500">Active Ranks</p>
								<p className="text-2xl font-bold mt-1">
									{ranks.filter((r) => r.isActive).length}
								</p>
							</div>
							<div className="p-3 rounded-full bg-success-100">
								<Icon icon="lucide:check-circle" className="text-2xl text-success" />
							</div>
						</div>
					</CardBody>
				</Card>

				<Card>
					<CardBody className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-default-500">Regions</p>
								<p className="text-2xl font-bold mt-1">{uniqueRegions.length}</p>
							</div>
							<div className="p-3 rounded-full bg-warning-100">
								<Icon icon="lucide:map" className="text-2xl text-warning" />
							</div>
						</div>
					</CardBody>
				</Card>

				<Card>
					<CardBody className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-default-500">Total Trips</p>
								<p className="text-2xl font-bold mt-1">N/A</p>
							</div>
							<div className="p-3 rounded-full bg-secondary-100">
								<Icon icon="lucide:car" className="text-2xl text-secondary" />
							</div>
						</div>
					</CardBody>
				</Card>
			</div>

			{/* Filters and Table */}
			<Card>
				<CardHeader className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between px-6 pt-6 pb-0">
					<div className="flex gap-3 w-full md:w-auto">
						<Input
							placeholder="Search ranks..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							startContent={<Icon icon="lucide:search" />}
							className="w-full md:w-80"
							variant="bordered"
						/>
						<Select
							placeholder="All Regions"
							selectedKeys={selectedRegionKeys}
							onSelectionChange={(keys) => {
								const selected = Array.from(keys)[0] as string;
								setRegionFilter(selected || "all");
							}}
							className="w-48"
							variant="bordered"
							items={regionItems}
						>
							{(item) => (
								<SelectItem key={item.key}>
									{item.label}
								</SelectItem>
							)}
						</Select>
					</div>

					<Chip variant="flat" color="default">
						{filteredRanks.length} ranks
					</Chip>
				</CardHeader>

				<CardBody>
					<Table
						aria-label="Ranks table"
						bottomContent={
							pages > 1 ? (
								<div className="flex w-full justify-center">
									<Pagination
										isCompact
										showControls
										showShadow
										color="primary"
										page={currentPage}
										total={pages}
										onChange={(page) => setCurrentPage(page)}
									/>
								</div>
							) : null
						}
					>
						<TableHeader>
							<TableColumn>NAME</TableColumn>
							<TableColumn>LOCATION</TableColumn>
							<TableColumn>REGION</TableColumn>
							<TableColumn>CAPACITY</TableColumn>
							<TableColumn>ROUTES</TableColumn>
							<TableColumn>STATUS</TableColumn>
							<TableColumn>ACTIONS</TableColumn>
						</TableHeader>
						<TableBody
							emptyContent={isLoading ? "Loading..." : "No ranks found"}
							items={paginatedRanks}
						>
							{(rank) => (
								<TableRow key={rank.id}>
									<TableCell>
										<div>
											<p className="font-medium">{rank.name}</p>
											<p className="text-xs text-default-500">{rank.address}</p>
										</div>
									</TableCell>
									<TableCell>
										<div>
											<p className="text-sm">{rank.city}</p>
											<p className="text-xs text-default-500">{rank.province}</p>
										</div>
									</TableCell>
									<TableCell>
										<Chip size="sm" variant="flat">
											{rank.region}
										</Chip>
									</TableCell>
									<TableCell>{rank.capacity || "N/A"}</TableCell>
									<TableCell>
										<Chip size="sm" variant="flat" color="primary">
											{rank._count?.sourceRoutes || 0}
										</Chip>
									</TableCell>
									<TableCell>
										<Chip
											size="sm"
											color={rank.isActive ? "success" : "default"}
											variant="dot"
										>
											{rank.isActive ? "Active" : "Inactive"}
										</Chip>
									</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Link href={`/dashboard/ranks/${rank.id}`}>
												<Button size="sm" variant="flat" isIconOnly>
													<Icon icon="lucide:eye" />
												</Button>
											</Link>
											<Link href={`/dashboard/ranks/${rank.id}/performance`}>
												<Button size="sm" variant="flat" color="primary" isIconOnly>
													<Icon icon="lucide:bar-chart" />
												</Button>
											</Link>
											<Button
												size="sm"
												variant="flat"
												color="danger"
												isIconOnly
												onPress={() => handleDelete(rank.id, rank.name)}
											>
												<Icon icon="lucide:trash-2" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardBody>
			</Card>
		</div>
	);
}
