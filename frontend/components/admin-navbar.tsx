"use client";

import { useState } from "react";
import Link from "next/link";
import {
	Package,
	ShoppingCart,
	Users,
	BarChart3,
	Settings,
	Menu,
	LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function AdminNavbar() {
	const [isOpen, setIsOpen] = useState(false);

	const navigation = [
		{ name: "Dashboard", href: "/admin", icon: BarChart3 },
		{ name: "Products", href: "/admin", icon: Package },
		{ name: "Orders", href: "/admin/orders", icon: ShoppingCart },
		{ name: "Users", href: "/admin/users", icon: Users },
	];

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				{/* Logo */}
				<Link href="/admin" className="flex items-center space-x-2">
					<div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600" />
					<span className="text-xl font-bold">Shop Tracker</span>
				</Link>

				{/* Right Side Actions */}
				<div className="flex items-center space-x-2">
					{/* Admin Menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="flex items-center gap-2"
							>
								<div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
								<span className="hidden sm:block">Admin</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuItem asChild>
								<Link href="/">View Store</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link
									href="/login"
									className="text-red-600 hover:!text-red-500"
									onClick={() =>
										localStorage.removeItem("token")
									}
								>
									Sign Out
								</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Mobile Menu */}
					<Sheet open={isOpen} onOpenChange={setIsOpen}>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="md:hidden"
							>
								<Menu className="h-5 w-5" />
								<span className="sr-only">Menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent side="right" className="w-80">
							<div className="flex flex-col space-y-4 mt-6">
								{navigation.map((item) => (
									<Link
										key={item.name}
										href={item.href}
										className="flex items-center gap-2 text-lg font-medium"
										onClick={() => setIsOpen(false)}
									>
										<item.icon className="h-5 w-5" />
										{item.name}
									</Link>
								))}
								<div className="border-t pt-4">
									<Link
										href="/admin/settings"
										className="flex items-center gap-2 text-lg font-medium mb-2"
										onClick={() => setIsOpen(false)}
									>
										<Settings className="h-5 w-5" />
										Settings
									</Link>
									<Link
										href="/"
										className="block text-lg font-medium"
										onClick={() => setIsOpen(false)}
									>
										View Store
									</Link>
								</div>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
