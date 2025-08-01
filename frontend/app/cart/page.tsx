"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	Minus,
	Plus,
	Trash2,
	ShoppingBag,
	ArrowLeft,
	Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/navbar";
import { toast } from "sonner";

interface CartItem {
	id: number;
	name: string;
	price: number;
	originalPrice?: number;
	image?: string;
	quantity: number;
	stock: boolean;
	category: string;
}

interface OrderItem {
	productId: number;
	quantity: number;
	price: number;
}

interface OrderResponse {
	id: number;
	status: string;
	total: number;
	items: string;
}

export default function CartPage() {
	const router = useRouter();
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [isCreatingOrder, setIsCreatingOrder] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadCart = () => {
			try {
				const savedCart = localStorage.getItem("cart");
				if (savedCart) {
					const parsedCart = JSON.parse(savedCart);
					if (Array.isArray(parsedCart)) {
						setCartItems(parsedCart);
					} else {
						console.error("Invalid cart data structure");
						localStorage.removeItem("cart");
					}
				}
			} catch (error) {
				console.error("Error loading cart:", error);
				localStorage.removeItem("cart");
			} finally {
				setLoading(false);
			}
		};

		loadCart();
	}, []);

	useEffect(() => {
		if (cartItems.length > 0) {
			localStorage.setItem("cart", JSON.stringify(cartItems));
		}
	}, [cartItems]);

	const updateQuantity = (id: number, newQuantity: number) => {
		if (newQuantity < 1) return;
		setCartItems((items) =>
			items.map((item) =>
				item.id === id ? { ...item, quantity: newQuantity } : item
			)
		);
	};

	const removeItem = (id: number) => {
		setCartItems((items) => items.filter((item) => item.id !== id));
	};

	const moveToWishlist = (id: number) => {
		removeItem(id);
		toast.success("Item moved to wishlist");
	};

	const total = cartItems.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);

	const createOrder = async () => {
		setIsCreatingOrder(true);
		setError(null);

		try {
			const outOfStockItems = cartItems.filter((item) => !item.stock);
			if (outOfStockItems.length > 0) {
				throw new Error(
					`Some items are out of stock: ${outOfStockItems
						.map((item) => item.name)
						.join(", ")}`
				);
			}

			const orderItems: OrderItem[] = cartItems.map((item) => ({
				productId: item.id,
				quantity: item.quantity,
				price: item.price,
			}));

			const token = localStorage.getItem("token");
			if (!token) {
				throw new Error("You need to be logged in to place an order");
			}

			const response = await fetch("http://localhost:5000/orders/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ items: orderItems }),
			});

			if (response.ok) {
				const order: OrderResponse = await response.json();

				setCartItems([]);
				localStorage.removeItem("cart");

				toast.success("Order placed successfully!");
				router.push("/orders");
			} else {
				const errorData = await response.json();
				setError(errorData.message);				
			}
		} catch (err) {
			console.error("Order creation error:", err);
			const errorMessage =
				err instanceof Error ? err.message : "Failed to create order";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsCreatingOrder(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar cartCount={0} />
				<main className="container mx-auto px-4 py-8">
					<div className="text-center py-16">
						<ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
						<h2 className="text-2xl font-bold mb-2">
							Loading your cart...
						</h2>
					</div>
				</main>
			</div>
		);
	}

	if (cartItems.length === 0) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar cartCount={0} />
				<main className="container mx-auto px-4 py-8">
					<div className="text-center py-16">
						<ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
						<h2 className="text-2xl font-bold mb-2">
							Your cart is empty
						</h2>
						<p className="text-muted-foreground mb-6">
							Looks like you haven't added anything to your cart
							yet
						</p>
						<Button asChild>
							<Link href="/home">Continue Shopping</Link>
						</Button>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<Navbar
				cartCount={cartItems.reduce(
					(sum, item) => sum + item.quantity,
					0
				)}
			/>

			<main className="container mx-auto px-4 py-8">
				<div className="mb-8 flex items-center gap-4">
					<Button variant="outline" size="icon" asChild>
						<Link href="/home">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div>
						<h1 className="text-3xl font-bold">Shopping Cart</h1>
						<p className="text-muted-foreground">
							{cartItems.length} item
							{cartItems.length !== 1 ? "s" : ""} in your cart
						</p>
					</div>
				</div>

				<div className="grid gap-8 lg:grid-cols-3">
					{/* Cart Items */}
					<div className="lg:col-span-2 space-y-4">
						{cartItems.map((item) => (
							<Card key={item.id}>
								<CardContent className="p-6">
									<div className="flex gap-4">
										<div className="relative">
											<Image
												src={
													item.image ||
													"/placeholder.svg"
												}
												alt={item.name}
												width={120}
												height={120}
												className="rounded-lg object-cover"
											/>
											{!item.stock && (
												<Badge className="absolute -top-2 -right-2 bg-red-500">
													Out of Stock
												</Badge>
											)}
										</div>

										<div className="flex-1 space-y-2">
											<div className="flex items-start justify-between">
												<div>
													<h3 className="font-semibold text-lg">
														{item.name}
													</h3>
													<p className="text-sm text-muted-foreground">
														{item.category}
													</p>
													<div className="flex items-center gap-2 mt-1">
														<span className="font-bold text-lg">
															$
															{item.price.toFixed(
																2
															)}
														</span>
														{item.originalPrice && (
															<span className="text-sm text-muted-foreground line-through">
																$
																{item.originalPrice.toFixed(
																	2
																)}
															</span>
														)}
														{item.originalPrice && (
															<Badge
																variant="secondary"
																className="text-xs"
															>
																Save $
																{(
																	item.originalPrice -
																	item.price
																).toFixed(2)}
															</Badge>
														)}
													</div>
												</div>

												<div className="flex items-center gap-2">													
													<Button
														variant="outline"
														size="icon"
														onClick={() =>
															removeItem(item.id)
														}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>

											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="icon"
														onClick={() =>
															updateQuantity(
																item.id,
																item.quantity -
																	1
															)
														}
														disabled={
															item.quantity <= 1
														}
													>
														<Minus className="h-4 w-4" />
													</Button>
													<span className="w-12 text-center font-medium">
														{item.quantity}
													</span>
													<Button
														variant="outline"
														size="icon"
														onClick={() =>
															updateQuantity(
																item.id,
																item.quantity +
																	1
															)
														}
														disabled={!item.stock}
													>
														<Plus className="h-4 w-4" />
													</Button>
												</div>

												<div className="text-right">
													<p className="font-bold text-lg">
														$
														{(
															item.price *
															item.quantity
														).toFixed(2)}
													</p>
													{!item.stock && (
														<p className="text-sm text-red-500">
															Currently
															unavailable
														</p>
													)}
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Order Summary */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Order Summary</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex justify-between">
									<span>Subtotal</span>
									<span>${total.toFixed(2)}</span>
								</div>

								<div className="flex justify-between">
									<span>Items</span>
									<span>
										{cartItems.reduce(
											(sum, item) => sum + item.quantity,
											0
										)}
									</span>
								</div>

								{cartItems.some((item) => !item.stock) && (
									<div className="text-red-500 text-sm">
										Some items are out of stock
									</div>
								)}

								<Separator />

								<div className="flex justify-between font-bold text-lg">
									<span>Total</span>
									<span>${total.toFixed(2)}</span>
								</div>
							</CardContent>
							<CardFooter className="flex-col gap-4">
								<Button
									className="w-full"
									size="lg"
									onClick={createOrder}
									disabled={
										isCreatingOrder ||
										cartItems.some((item) => !item.stock)
									}
								>
									{isCreatingOrder
										? "Processing..."
										: "Proceed to Checkout"}
								</Button>

								{error && (
									<div className="text-red-500 text-sm text-center">
										{error}
									</div>
								)}

								<Button
									variant="outline"
									className="w-full bg-transparent"
									asChild
								>
									<Link href="/home">Continue Shopping</Link>
								</Button>
							</CardFooter>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
