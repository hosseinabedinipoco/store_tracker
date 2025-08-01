"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/navbar";

interface Product {
	id: number;
	name: string;
	price: number;
	image?: string;
	category: string;
	stock: number;
	description: string;
}

interface CartItem extends Product {
	quantity: number;
}

const API_BASE_URL = "http://localhost:5000";

const categories = [
	"All",
	"Electronics",
	"Clothing",
	"Accessories",
	"Sports",
	"Home",
];

export default function HomePage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [selectedCategory, setSelectedCategory] = useState<string>("All");
	const [sortBy, setSortBy] = useState<string>("featured");
	const [cart, setCart] = useState<CartItem[]>([]);

	useEffect(() => {
		const savedCart = localStorage.getItem("cart");
		if (savedCart) {
			setCart(JSON.parse(savedCart));
		}
	}, []);

	useEffect(() => {
		localStorage.setItem("cart", JSON.stringify(cart));
	}, [cart]);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setLoading(true);
				let url = `${API_BASE_URL}/products/`;
				const params = new URLSearchParams();

				if (searchQuery) params.append("search", searchQuery);
				if (selectedCategory !== "All")
					params.append("category", selectedCategory);

				if (params.toString()) url += `?${params.toString()}`;

				const response = await fetch(url);
				if (!response.ok) throw new Error("Failed to fetch products");

				const data: Product[] = await response.json();
				setProducts(data);
				setError(null);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "An unknown error occurred"
				);
				console.error("Error fetching products:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchProducts();
	}, [searchQuery, selectedCategory]);

	const filteredProducts = useMemo(() => {
		return [...products].sort((a: Product, b: Product) => {
			switch (sortBy) {
				case "price-low":
					return a.price - b.price;
				case "price-high":
					return b.price - a.price;
				default:
					return 0;
			}
		});
	}, [products, sortBy]);

	const addToCart = (product: Product) => {
		setCart((prev) => {
			const existing = prev.find((item) => item.id === product.id);
			let newCart;

			if (existing) {
				newCart = prev.map((item) =>
					item.id === product.id
						? { ...item, quantity: item.quantity + 1 }
						: item
				);
			} else {
				newCart = [...prev, { ...product, quantity: 1 }];
			}

			return newCart;
		});
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar
					cartCount={cart.reduce(
						(sum, item) => sum + item.quantity,
						0
					)}
				/>
				<main className="container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-100px)]">
					<div>Loading products...</div>
				</main>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar
					cartCount={cart.reduce(
						(sum, item) => sum + item.quantity,
						0
					)}
				/>
				<main className="container mx-auto px-4 py-8">
					<div className="text-red-500">Error: {error}</div>
					<Button onClick={() => window.location.reload()}>
						Retry
					</Button>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<Navbar
				cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
			/>

			<main className="container mx-auto px-4 py-8">
				{/* Search and Filters */}
				<div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex flex-1 items-center gap-4">
						<div className="relative flex-1 max-w-md">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search products..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>

						<Select
							value={selectedCategory}
							onValueChange={(value: string) =>
								setSelectedCategory(value)
							}
						>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								{categories.map((category) => (
									<SelectItem key={category} value={category}>
										{category}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Select
						value={sortBy}
						onValueChange={(value: string) => setSortBy(value)}
					>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="featured">Featured</SelectItem>
							<SelectItem value="price-low">
								Price: Low to High
							</SelectItem>
							<SelectItem value="price-high">
								Price: High to Low
							</SelectItem>
							<SelectItem value="rating">
								Highest Rated
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Products Grid */}
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{filteredProducts.map((product) => (
						<Card
							key={product.id}
							className="group overflow-hidden transition-all hover:shadow-lg"
						>
							<div className="relative aspect-square overflow-hidden">
								<Image
									src={product.image || "/placeholder.svg"}
									alt={product.name}
									fill
									className="object-cover transition-transform group-hover:scale-105"
								/>
								<Button
									size="icon"
									variant="secondary"
									className="absolute right-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100"
								>
									<Heart className="h-4 w-4" />
								</Button>
							</div>

							<CardContent className="p-4">
								<h3 className="mb-1 font-semibold line-clamp-1">
									{product.name}
								</h3>
								<p className="mb-2 text-xs text-muted-foreground line-clamp-2">
									{product.description}
								</p>

								<div className="flex items-center gap-2">
									<span className="font-bold text-lg">
										${product.price}
									</span>
								</div>

								<Badge
									variant={
										product.stock > 0
											? "default"
											: "secondary"
									}
									className="mt-2"
								>
									{product.stock > 0
										? "In Stock"
										: "Out of Stock"}
								</Badge>
							</CardContent>

							<CardFooter className="p-4 pt-0">
								<div className="flex w-full gap-2">
									<Button
										className="flex-1"
										disabled={!product.stock}
										onClick={() => addToCart(product)}
									>
										<ShoppingCart className="mr-2 h-4 w-4" />
										Add to Cart
									</Button>
								</div>
							</CardFooter>
						</Card>
					))}
				</div>

				{filteredProducts.length === 0 && (
					<div className="py-12 text-center">
						<p className="text-muted-foreground">
							No products found matching your criteria.
						</p>
					</div>
				)}
			</main>
		</div>
	);
}
