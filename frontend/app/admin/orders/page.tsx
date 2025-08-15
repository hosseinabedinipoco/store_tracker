"use client";

import { useState, useEffect, JSX } from "react";
import Image from "next/image";
import {
	Search,
	Package,
	Truck,
	CheckCircle,
	XCircle,
	Clock,
	Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminNavbar } from "@/components/admin-navbar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

interface OrderItem {
	productId: number;
	quantity: number;
	price: number;
	name: string;
	image: string;
}

interface Order {
	id: string;
	customerName: string;
	customerEmail: string;
	date: string;
	status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
	total: number;
	items: OrderItem[];	
	userId: number;
}

const getStatusIcon = (status: string) => {
	switch (status) {
		case "delivered":
			return <CheckCircle className="h-4 w-4 text-green-500" />;
		case "shipped":
			return <Truck className="h-4 w-4 text-blue-500" />;
		case "processing":
		case "pending":
			return <Clock className="h-4 w-4 text-yellow-500" />;
		case "cancelled":
			return <XCircle className="h-4 w-4 text-red-500" />;
		default:
			return <Package className="h-4 w-4 text-gray-500" />;
	}
};

const getStatusColor = (status: string) => {
	switch (status) {
		case "delivered":
			return "bg-green-100 text-green-800";
		case "shipped":
			return "bg-blue-100 text-blue-800";
		case "processing":
		case "pending":
			return "bg-yellow-100 text-yellow-800";
		case "cancelled":
			return "bg-red-100 text-red-800";
		default:
			return "bg-gray-100 text-gray-800";
	}
};

export default function AdminOrdersPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [sortBy, setSortBy] = useState("newest");
	const [editingOrder, setEditingOrder] = useState<Order | null>(null);
	const [newStatus, setNewStatus] = useState("");

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				const response = await fetch("http://localhost:5000/orders/", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem(
							"token"
						)}`,
					},
				});

				if (!response.ok) {
					throw new Error(
						`Failed to fetch orders: ${response.status}`
					);
				}

				const data = await response.json();

				const transformedOrders: Order[] = data.map((order: any) => {
					let items: OrderItem[] = [];
					try {
						const parsedItems = JSON.parse(order.items);
						items = parsedItems.map((item: any) => ({
							...item,
							name: `Product ${item.productId}`,
							image: "/placeholder.svg",
						}));
					} catch (e) {
						console.error("Failed to parse order items", e);
					}

					return {
						id: `ORD-${order.id.toString().padStart(3, "0")}`,
						customerName: `User ${order.user_id}`,						
						date: order.createdAt,
						status: order.status.toLowerCase(),
						total: order.total,
						items: items,
						shippingAddress: "123 Shipping Address",
						trackingNumber: null,
						notes: "",
						userId: order.user_id,
					};
				});

				setOrders(transformedOrders);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "An unknown error occurred"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchOrders();
	}, []);

	const filteredOrders = orders
		.filter((order) => {
			const matchesSearch =
				order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				order.customerName
					.toLowerCase()
					.includes(searchQuery.toLowerCase())
			const matchesStatus =
				statusFilter === "all" || order.status === statusFilter;
			return matchesSearch && matchesStatus;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case "newest":
					return (
						new Date(b.date).getTime() - new Date(a.date).getTime()
					);
				case "oldest":
					return (
						new Date(a.date).getTime() - new Date(b.date).getTime()
					);
				case "amount-high":
					return b.total - a.total;
				case "amount-low":
					return a.total - b.total;
				default:
					return 0;
			}
		});

	const ordersByStatus = {
		all: orders,
		pending: orders.filter((order) => order.status === "pending"),
		processing: orders.filter((order) => order.status === "processing"),
		shipped: orders.filter((order) => order.status === "shipped"),
		delivered: orders.filter((order) => order.status === "delivered"),
		cancelled: orders.filter((order) => order.status === "cancelled"),
	};

	const handleUpdateOrder = async () => {
		if (!editingOrder) return;

		try {
			const orderId = editingOrder.id.replace("ORD-", "");            
			const response = await fetch(
				`http://localhost:5000/orders/${orderId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem(
							"token"
						)}`,
					},
					body: JSON.stringify({
						status: newStatus,						
					}),
				}
			);

			if (!response.ok) {
				throw new Error(`Failed to update order: ${response.status}`);
			}

			const updatedOrder = await response.json();

			setOrders(
				orders.map((order) =>
					order.id === editingOrder.id
						? {
								...order,
								status: newStatus as
									| "pending"
									| "processing"
									| "shipped"
									| "delivered"
									| "cancelled",								
						  }
						: { ...order }
				)
			);

			toast({
				title: "Order updated successfully",
				description: `Order ${editingOrder.id} has been updated to ${newStatus}`,
			});

			setEditingOrder(null);
			setNewStatus("");			
		} catch (err) {
			toast({
				title: "Error updating order",
				description:
					err instanceof Error
						? err.message
						: "An unknown error occurred",
				variant: "destructive",
			});
		}
	};

	const openEditDialog = (order: Order) => {
		setEditingOrder(order);
		setNewStatus(order.status);		
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-background">
				<AdminNavbar />
				<main className="container mx-auto px-4 py-8">
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
					</div>
				</main>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-background">
				<AdminNavbar />
				<main className="container mx-auto px-4 py-8">
					<div className="py-12 text-center">
						<XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
						<h3 className="text-lg font-semibold mb-2">
							Error loading orders
						</h3>
						<p className="text-muted-foreground mb-4">{error}</p>
						<Button onClick={() => window.location.reload()}>
							Try Again
						</Button>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<AdminNavbar />

			<main className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">
						Order Management
					</h1>					
				</div>

				{/* Search and Filters */}
				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-1 items-center gap-4">
						<div className="relative flex-1 max-w-md">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search orders, customers..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>

						<Select
							value={statusFilter}
							onValueChange={setStatusFilter}
						>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="processing">
									Processing
								</SelectItem>
								<SelectItem value="shipped">Shipped</SelectItem>
								<SelectItem value="delivered">
									Delivered
								</SelectItem>
								<SelectItem value="cancelled">
									Cancelled
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<Select value={sortBy} onValueChange={setSortBy}>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="newest">Newest First</SelectItem>
							<SelectItem value="oldest">Oldest First</SelectItem>
							<SelectItem value="amount-high">
								Amount: High to Low
							</SelectItem>
							<SelectItem value="amount-low">
								Amount: Low to High
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Orders Tabs */}
				<Tabs defaultValue="all" className="space-y-6">
					<TabsList className="grid w-full grid-cols-6">
						<TabsTrigger value="all">
							All ({ordersByStatus.all.length})
						</TabsTrigger>
						<TabsTrigger value="pending">
							Pending ({ordersByStatus.pending.length})
						</TabsTrigger>
						<TabsTrigger value="processing">
							Processing ({ordersByStatus.processing.length})
						</TabsTrigger>
						<TabsTrigger value="shipped">
							Shipped ({ordersByStatus.shipped.length})
						</TabsTrigger>
						<TabsTrigger value="delivered">
							Delivered ({ordersByStatus.delivered.length})
						</TabsTrigger>
						<TabsTrigger value="cancelled">
							Cancelled ({ordersByStatus.cancelled.length})
						</TabsTrigger>
					</TabsList>

					<TabsContent value="all" className="space-y-4">
						{filteredOrders.map((order) => (
							<OrderCard
								key={order.id}
								order={order}
								getStatusIcon={getStatusIcon}
								getStatusColor={getStatusColor}
								onEditClick={openEditDialog}
							/>
						))}
					</TabsContent>

					{[
						"pending",
						"processing",
						"shipped",
						"delivered",
						"cancelled",
					].map((status) => (
						<TabsContent
							key={status}
							value={status}
							className="space-y-4"
						>
							{ordersByStatus[
								status as keyof typeof ordersByStatus
							].map((order) => (
								<OrderCard
									key={order.id}
									order={order}
									getStatusIcon={getStatusIcon}
									getStatusColor={getStatusColor}
									onEditClick={openEditDialog}
								/>
							))}
						</TabsContent>
					))}
				</Tabs>

				{filteredOrders.length === 0 && (
					<div className="py-12 text-center">
						<Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">
							No orders found
						</h3>
						<p className="text-muted-foreground">
							{searchQuery || statusFilter !== "all"
								? "Try adjusting your search or filters"
								: "No orders have been placed yet"}
						</p>
					</div>
				)}

				{/* Edit Order Dialog */}
				{editingOrder && (
					<Dialog
						open={!!editingOrder}
						onOpenChange={() => setEditingOrder(null)}
					>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									Update Order {editingOrder.id}
								</DialogTitle>
								<DialogDescription>
									Update the order status and tracking
									information
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="status">Order Status</Label>
									<Select
										value={newStatus}
										onValueChange={setNewStatus}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="pending">
												Pending
											</SelectItem>
											<SelectItem value="processing">
												Processing
											</SelectItem>
											<SelectItem value="shipped">
												Shipped
											</SelectItem>
											<SelectItem value="delivered">
												Delivered
											</SelectItem>
											<SelectItem value="cancelled">
												Cancelled
											</SelectItem>
										</SelectContent>
									</Select>
								</div>								
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setEditingOrder(null)}
								>
									Cancel
								</Button>
								<Button onClick={handleUpdateOrder}>
									Update Order
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				)}
			</main>
		</div>
	);
}

function OrderCard({
	order,
	getStatusIcon,
	getStatusColor,
	onEditClick,
}: {
	order: Order;
	getStatusIcon: (status: string) => JSX.Element;
	getStatusColor: (status: string) => string;
	onEditClick: (order: Order) => void;
}) {
	return (
		<Card>
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div>
							<CardTitle className="text-lg">
								Order {order.id}
							</CardTitle>
							<p className="text-sm text-muted-foreground">
								{order.customerName}
							</p>
							<p className="text-sm text-muted-foreground">
								Placed on{" "}
								{new Date(order.date).toLocaleDateString()}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-4">
						<Badge className={getStatusColor(order.status)}>
							<div className="flex items-center gap-1">
								{getStatusIcon(order.status)}
								{order.status.charAt(0).toUpperCase() +
									order.status.slice(1)}
							</div>
						</Badge>
						<div className="text-right">
							<p className="font-semibold">
								${order.total.toFixed(2)}
							</p>
							<p className="text-sm text-muted-foreground">
								{order.items.length} item
								{order.items.length > 1 ? "s" : ""}
							</p>
						</div>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<div className="space-y-4">
					<div className="space-y-3">
						{order.items.map((item) => (
							<div
								key={`${item.productId}-${order.id}`}
								className="flex items-center gap-4"
							>
								<Image
									src={item.image || "/placeholder.svg"}
									alt={item.name}
									width={60}
									height={60}
									className="rounded-lg object-cover"
								/>
								<div className="flex-1">
									<h4 className="font-medium">{item.name}</h4>
									<p className="text-sm text-muted-foreground">
										Quantity: {item.quantity} × $
										{item.price.toFixed(2)}
									</p>
								</div>
								<div className="text-right">
									<p className="font-medium">
										$
										{(item.price * item.quantity).toFixed(
											2
										)}
									</p>
								</div>
							</div>
						))}
					</div>

					<div className="flex items-center justify-end gap-2 pt-4 border-t">						
						<Button
							variant="outline"
							size="sm"
							onClick={() => onEditClick(order)}
						>
							<Edit className="mr-2 h-4 w-4" />
							Update Status
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
