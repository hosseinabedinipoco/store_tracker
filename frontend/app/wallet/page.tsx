"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Navbar } from "@/components/navbar";
import { toast } from "@/components/ui/use-toast";

export default function WalletPage() {
	const [walletBalance, setWalletBalance] = useState(0);
	const [topUpAmount, setTopUpAmount] = useState("");
	const [isTopUpOpen, setIsTopUpOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchWalletBalance = async () => {
			const token = localStorage.getItem("token");
			try {
				const response = await fetch(
					"http://localhost:5000/account/profile",
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
					}
				);
				if (!response.ok) {
					throw new Error("Failed to fetch wallet balance");
				}
				const data = await response.json();
				setWalletBalance(data.wallet);
			} catch (error) {
				console.error("Error fetching wallet balance:", error);
				toast({
					variant: "destructive",
					title: "Error",
					description: "Failed to fetch wallet balance",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchWalletBalance();
	}, []);

	const handleTopUp = async () => {
		const token = localStorage.getItem("token");
		const amount = Number.parseFloat(topUpAmount);
		if (amount <= 0) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Amount must be greater than 0",
			});
			return;
		}

		try {
			setIsLoading(true);
			const response = await fetch("http://localhost:5000/account/charge-wallet", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ amount }),
			});

			if (!response.ok) {
				throw new Error("Failed to charge wallet");
			}

			const data = await response.json();
			setWalletBalance(data.wallet);
			setTopUpAmount("");
			setIsTopUpOpen(false);

			toast({
				title: "Success",
				description: `$${amount} has been added to your wallet`,
			});
		} catch (error) {
			console.error("Error charging wallet:", error);
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to add money to wallet",
			});
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<main className="container mx-auto px-4 py-8">
					<div className="flex justify-center items-center h-64">
						<p>Loading wallet information...</p>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			<main className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">My Wallet</h1>
					<p className="text-muted-foreground">
						Manage your wallet balance and payment methods
					</p>
				</div>

				{/* Wallet Overview */}
				<div className="grid gap-6 md:grid-cols-3 mb-8">
					<Card className="md:col-span-2">
						<CardHeader className="pb-2">
							<CardDescription>Current Balance</CardDescription>
							<CardTitle className="text-4xl font-bold text-green-600">
								${walletBalance.toFixed(2)}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center gap-4">
								<Dialog
									open={isTopUpOpen}
									onOpenChange={setIsTopUpOpen}
								>
									<DialogTrigger asChild>
										<Button>
											<Plus className="mr-2 h-4 w-4" />
											Add Money
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>
												Add Money to Wallet
											</DialogTitle>
											<DialogDescription>
												Choose an amount to add to your
												wallet balance
											</DialogDescription>
										</DialogHeader>
										<div className="space-y-4">
											<div className="space-y-2">
												<Label htmlFor="amount">
													Amount
												</Label>
												<Input
													id="amount"
													type="number"
													placeholder="Enter amount"
													value={topUpAmount}
													onChange={(e) =>
														setTopUpAmount(
															e.target.value
														)
													}
												/>
											</div>
										</div>
										<DialogFooter>
											<Button
												variant="outline"
												onClick={() =>
													setIsTopUpOpen(false)
												}
												disabled={isLoading}
											>
												Cancel
											</Button>
											<Button
												onClick={handleTopUp}
												disabled={
													!topUpAmount ||
													Number.parseFloat(
														topUpAmount
													) <= 0 ||
													isLoading
												}
											>
												{isLoading
													? "Processing..."
													: `Add $${
															topUpAmount || "0"
													  }`}
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}
