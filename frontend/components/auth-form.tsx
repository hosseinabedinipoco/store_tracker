"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type AuthMode = "login" | "register";

interface AuthFormProps {
	mode: AuthMode;
}

export function AuthForm({ mode }: AuthFormProps) {
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();

	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const endpoint =
				mode === "login"
					? "http://localhost:5000/account/login"
					: "http://localhost:5000/account/register";
			const body = {
				username: formData.username,
				password: formData.password,
			};

			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			});

			const data = await response.json();
			console.log(data);

			if (!response.ok) {
				throw new Error(
					data.message || data.error || "Authentication failed"
				);
			}

			if (mode === "login") {
				localStorage.setItem("token", data.token);
				toast.success("Login successful!");
				data.is_admin === true
					? router.push("/admin")
					: router.push("/home");
			} else {
				toast.success(
					"Registration successful! Redirecting to login..."
				);
				setTimeout(() => router.push("/login"), 1500);
			}
		} catch (error: any) {
			toast.error(
				error.message ||
					`${
						mode === "login" ? "Login" : "Registration"
					} failed. Please try again.`
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600" />
					<CardTitle className="text-2xl font-bold">
						{mode === "login"
							? "Welcome Back"
							: "Create an Account"}
					</CardTitle>					
				</CardHeader>

				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="username">Username</Label>
							<div className="relative">
								<UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id="username"
									type="text"
									placeholder={
										mode === "login"
											? "Enter your username"
											: "Choose a username"
									}
									className="pl-10"
									value={formData.username}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											username: e.target.value,
										}))
									}
									required
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder={
										mode === "login"
											? "Enter your password"
											: "Create a password"
									}
									className="pl-10 pr-10"
									value={formData.password}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											password: e.target.value,
										}))
									}
									required
									minLength={
										mode === "register" ? 6 : undefined
									}
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute right-0 top-0 h-full px-3"
									onClick={() =>
										setShowPassword(!showPassword)
									}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
						<Button
							type="submit"
							className="w-full"
							disabled={isSubmitting}
						>
							{isSubmitting
								? mode === "login"
									? "Signing in..."
									: "Creating account..."
								: mode === "login"
								? "Sign In"
								: "Sign Up"}
						</Button>
					</form>
				</CardContent>

				<CardFooter className="text-center">
					<p className="text-sm text-muted-foreground">
						{mode === "login"
							? "Don't have an account? "
							: "Already have an account? "}
						<Link
							href={mode === "login" ? "/register" : "/login"}
							className="text-primary hover:underline"
						>
							{mode === "login" ? "Sign up" : "Sign in"}
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
