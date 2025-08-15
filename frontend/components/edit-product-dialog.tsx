"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface EditProductDialogProps {
	product: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onEditProduct: (product: any) => void;
}

export function EditProductDialog({
	product,
	open,
	onOpenChange,
	onEditProduct,
}: EditProductDialogProps) {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		price: "",
		category: "",
		stock: "",
		image: "",
		inStock: true,
	});

	const categories = [
		"Electronics",
		"Clothing",
		"Accessories",
		"Sports",
		"Home",
	];

	useEffect(() => {
		if (product) {
			setFormData({
				name: product.name || "",
				description: product.description || "",
				price: product.price?.toString() || "",
				category: product.category || "",
				stock: product.stock?.toString() || "",
				image: product.image || "",
				inStock: product.inStock || true,
			});
		}
	}, [product]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const updatedProduct = {
			...product,
			...formData,
			price: Number.parseFloat(formData.price),
			stock: Number.parseInt(formData.stock),
		};

		onEditProduct(updatedProduct);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Product</DialogTitle>
					<DialogDescription>
						Update product information
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="name">Product Name *</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({
										...formData,
										name: e.target.value,
									})
								}
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description *</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) =>
								setFormData({
									...formData,
									description: e.target.value,
								})
							}
							required
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="category">Category *</Label>
							<Select
								value={formData.category}
								onValueChange={(value) =>
									setFormData({
										...formData,
										category: value,
									})
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent>
									{categories.map((category) => (
										<SelectItem
											key={category}
											value={category}
										>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="stock">Stock Count *</Label>
							<Input
								id="stock"
								type="number"
								min="0"
								value={formData.stock}
								onChange={(e) =>
									setFormData({
										...formData,
										stock: e.target.value,
									})
								}
								required
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="price">Price *</Label>
							<Input
								id="price"
								type="number"
								step="0.01"
								min="0"
								value={formData.price}
								onChange={(e) =>
									setFormData({
										...formData,
										price: e.target.value,
									})
								}
								required
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit">Update Product</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
