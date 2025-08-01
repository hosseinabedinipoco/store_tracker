"use client";

import { useState } from "react";
import Link from "next/link";
import {
	Search,
	ShoppingCart,
	User,
	Wallet,
	Package,
	Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavbarProps {
	cartCount?: number;
}

export function Navbar({ cartCount = 0 }: NavbarProps) {	

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				{/* Logo */}
				<Link href="/home" className="flex items-center space-x-2">
					<div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600" />
					<span className="text-xl font-bold">Shop Tracker</span>
				</Link>

				{/* Right Side Actions */}
				<div className="flex items-center space-x-2">
					{/* Cart */}
					<Button
						variant="ghost"
						size="icon"
						className="relative"
						asChild
					>
						<Link href="/cart">
							<ShoppingCart className="h-5 w-5" />
							{cartCount > 0 && (
								<Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
									{cartCount}
								</Badge>
							)}
							<span className="sr-only">Shopping cart</span>
						</Link>
					</Button>

					{/* User Menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<User className="h-5 w-5" />
								<span className="sr-only">User menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuItem asChild>
								<Link href="/orders">My Orders</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/wallet">Wallet</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link
									href="/login"
									className="text-red-600 hover:!text-red-500"
									onClick={() => localStorage.removeItem("token")}
								>
									Sign Out
								</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
