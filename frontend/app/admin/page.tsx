"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Plus, Edit, Trash2, Eye, Package } from "lucide-react";
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
import { AdminNavbar } from "@/components/admin-navbar";
import { AddProductDialog } from "@/components/add-product-dialog";
import { EditProductDialog } from "@/components/edit-product-dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const API_BASE_URL = "http://localhost:5000";

interface Product {
	id: number;
	name: string;
	description: string;
	price: number;
	originalPrice?: number;
	image?: string;
	category: string;	
	rating?: number;
	reviews?: number;
	stock: number;
	featured?: boolean;
	createdAt: string;
}

export default function AdminDashboard() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [selectedCategory, setSelectedCategory] = useState<string>("All");
	const [sortBy, setSortBy] = useState<string>("newest");
	const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);

	const categories: string[] = [
		"All",
		"Electronics",
		"Clothing",
		"Accessories",
		"Sports",
		"Home",
	];

	const fetchProducts = async (): Promise<void> => {
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
				err instanceof Error ? err.message : "An unknown error occurred"
			);
			console.error("Error fetching products:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, [searchQuery, selectedCategory]);

	const filteredProducts = [...products].sort((a: Product, b: Product) => {
		switch (sortBy) {
			case "newest":
				return (
					new Date(b.createdAt).getTime() -
					new Date(a.createdAt).getTime()
				);
			case "oldest":
				return (
					new Date(a.createdAt).getTime() -
					new Date(b.createdAt).getTime()
				);
			case "price-low":
				return a.price - b.price;
			case "price-high":
				return b.price - a.price;
			case "stock-low":
				return a.stock - b.stock;
			default:
				return 0;
		}
	});

	const handleAddProduct = async (
		newProduct: Omit<Product, "id" | "createdAt">
	): Promise<void> => {
		try {
			const response = await fetch(`${API_BASE_URL}/products/`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",					
					"Authorization": `Bearer ${localStorage.getItem('token')}`
				},
				body: JSON.stringify(newProduct),
			});

			if (!response.ok) throw new Error("Failed to add product");

			const createdProduct: Product = await response.json();
			setProducts([...products, createdProduct]);
			setIsAddDialogOpen(false);
		} catch (err) {
			console.error("Error adding product:", err);
			setError(
				err instanceof Error ? err.message : "Failed to add product"
			);
		}
	};

	const handleEditProduct = async (
		updatedProduct: Product
	): Promise<void> => {
		try {
			const response = await fetch(
				`${API_BASE_URL}/products/${updatedProduct.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",						
						"Authorization": `Bearer ${localStorage.getItem('token')}`
					},
					body: JSON.stringify(updatedProduct),
				}
			);

			if (!response.ok) throw new Error("Failed to update product");

			const updatedProductData: Product = await response.json();
			setProducts(
				products.map((p) =>
					p.id === updatedProductData.id ? updatedProductData : p
				)
			);
			setEditingProduct(null);
		} catch (err) {
			console.error("Error updating product:", err);
			setError(
				err instanceof Error ? err.message : "Failed to update product"
			);
		}
	};

	const handleDeleteProduct = async (productId: number): Promise<void> => {
		try {
			const response = await fetch(
				`${API_BASE_URL}/products/${productId}`,
				{
					method: "DELETE",
					headers: {												
						"Authorization": `Bearer ${localStorage.getItem('token')}`
					},
				}
			);

			if (!response.ok) throw new Error("Failed to delete product");

			setProducts(products.filter((p) => p.id !== productId));
		} catch (err) {
			console.error("Error deleting product:", err);
			setError(
				err instanceof Error ? err.message : "Failed to delete product"
			);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-background">
				<AdminNavbar />
				<main className="container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-100px)]">
					<div>Loading products...</div>
				</main>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-background">
				<AdminNavbar />
				<main className="container mx-auto px-4 py-8">
					<div className="text-red-500">Error: {error}</div>
					<Button onClick={fetchProducts}>Retry</Button>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<AdminNavbar />

			<main className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
				</div>

				{/* Search and Filters */}
				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

					<div className="flex items-center gap-2">
						<Button onClick={() => setIsAddDialogOpen(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Add Product
						</Button>
					</div>
				</div>

				{/* Products Table */}
				<Card>
					<CardHeader>
						<CardTitle>
							Products ({filteredProducts.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{filteredProducts.map((product) => (
								<div
									key={product.id}
									className="flex items-center gap-4 p-4 border rounded-lg"
								>
									<Image
										src={
											product.image || "/placeholder.svg"
										}
										alt={product.name}
										width={80}
										height={80}
										className="rounded-lg object-cover"
									/>

									<div className="flex-1 space-y-1">
										<div className="flex items-center gap-2">
											<h3 className="font-semibold">
												{product.name}
											</h3>
											{product.featured && (
												<Badge>Featured</Badge>
											)}
										</div>
										<p className="text-sm text-muted-foreground">
											{product.description}
										</p>
										<div className="flex items-center gap-4 text-sm">
											<span>
												Category: {product.category}
											</span>											
											<span>Stock: {product.stock}</span>
										</div>
									</div>

									<div className="text-right space-y-1">
										<div className="font-bold text-lg">
											${product.price}
										</div>
										{product.originalPrice && (
											<div className="text-sm text-muted-foreground line-through">
												${product.originalPrice}
											</div>
										)}
										<Badge
											variant={
												product.stock > 0
													? "default"
													: "secondary"
											}
										>
											{product.stock > 0
												? "In Stock"
												: "Out of Stock"}
										</Badge>
									</div>

									<div className="flex items-center gap-2">										
										<Button
											variant="outline"
											size="icon"
											onClick={() =>
												setEditingProduct(product)
											}
										>
											<Edit className="h-4 w-4" />
										</Button>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="outline"
													size="icon"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>
														Delete Product
													</AlertDialogTitle>
													<AlertDialogDescription>
														Are you sure you want to
														delete "{product.name}"?
														This action cannot be
														undone.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>
														Cancel
													</AlertDialogCancel>
													<AlertDialogAction
														onClick={() =>
															handleDeleteProduct(
																product.id
															)
														}
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{filteredProducts.length === 0 && (
					<div className="py-12 text-center">
						<Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">
							No products found
						</h3>
						<p className="text-muted-foreground mb-4">
							Try adjusting your search or filters
						</p>
						<Button onClick={() => setIsAddDialogOpen(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Add Your First Product
						</Button>
					</div>
				)}
			</main>

			<AddProductDialog
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				onAddProduct={handleAddProduct}
			/>

			{editingProduct && (
				<EditProductDialog
					product={editingProduct}
					open={!!editingProduct}
					onOpenChange={(open) => !open && setEditingProduct(null)}
					onEditProduct={handleEditProduct}
				/>
			)}
		</div>
	);
}
