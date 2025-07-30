"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Filter, ShoppingCart, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Navbar } from "@/components/navbar"

const products = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    price: 79.99,
    originalPrice: 99.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "Electronics",
    brand: "TechSound",
    rating: 4.5,
    reviews: 128,
    inStock: true,
    featured: true,
    description: "Premium wireless headphones with noise cancellation",
  },
  {
    id: 2,
    name: "Organic Cotton T-Shirt",
    price: 24.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "Clothing",
    brand: "EcoWear",
    rating: 4.2,
    reviews: 89,
    inStock: true,
    featured: false,
    description: "Comfortable organic cotton t-shirt in various colors",
  },
  {
    id: 3,
    name: "Smart Fitness Watch",
    price: 199.99,
    originalPrice: 249.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "Electronics",
    brand: "FitTech",
    rating: 4.7,
    reviews: 256,
    inStock: true,
    featured: true,
    description: "Advanced fitness tracking with heart rate monitor",
  },
  {
    id: 4,
    name: "Leather Wallet",
    price: 49.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "Accessories",
    brand: "CraftLeather",
    rating: 4.3,
    reviews: 67,
    inStock: false,
    featured: false,
    description: "Handcrafted genuine leather wallet with RFID protection",
  },
  {
    id: 5,
    name: "Yoga Mat Premium",
    price: 34.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "Sports",
    brand: "ZenFit",
    rating: 4.6,
    reviews: 143,
    inStock: true,
    featured: false,
    description: "Non-slip premium yoga mat with carrying strap",
  },
  {
    id: 6,
    name: "Coffee Maker Deluxe",
    price: 129.99,
    originalPrice: 159.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "Home",
    brand: "BrewMaster",
    rating: 4.4,
    reviews: 92,
    inStock: true,
    featured: true,
    description: "Programmable coffee maker with thermal carafe",
  },
]

const categories = ["All", "Electronics", "Clothing", "Accessories", "Sports", "Home"]
const brands = ["All", "TechSound", "EcoWear", "FitTech", "CraftLeather", "ZenFit", "BrewMaster"]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedBrand, setSelectedBrand] = useState("All")
  const [sortBy, setSortBy] = useState("featured")
  const [showInStockOnly, setShowInStockOnly] = useState(false)
  const [cart, setCart] = useState([])

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
        const matchesBrand = selectedBrand === "All" || product.brand === selectedBrand
        const matchesStock = !showInStockOnly || product.inStock

        return matchesSearch && matchesCategory && matchesBrand && matchesStock
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return a.price - b.price
          case "price-high":
            return b.price - a.price
          case "rating":
            return b.rating - a.rating
          case "featured":
            return b.featured - a.featured
          default:
            return 0
        }
      })
  }, [searchQuery, selectedCategory, selectedBrand, sortBy, showInStockOnly])

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <div className="max-w-2xl">
            <h1 className="mb-4 text-4xl font-bold">Welcome to ShopHub</h1>
            <p className="mb-6 text-lg opacity-90">
              Discover amazing products at unbeatable prices. Shop with confidence and enjoy fast, free shipping.
            </p>
            <Button size="lg" variant="secondary">
              Shop Now
            </Button>
          </div>
        </section>

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

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
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

                  <div>
                    <Label className="text-sm font-medium">Brand</Label>
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="inStock" checked={showInStockOnly} onCheckedChange={setShowInStockOnly} />
                    <Label htmlFor="inStock" className="text-sm">
                      In stock only
                    </Label>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden transition-all hover:shadow-lg">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                {product.originalPrice && <Badge className="absolute left-2 top-2 bg-red-500">Sale</Badge>}
                {product.featured && <Badge className="absolute right-2 top-2 bg-yellow-500">Featured</Badge>}
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">({product.reviews})</span>
                </div>

                <h3 className="mb-1 font-semibold line-clamp-1">{product.name}</h3>
                <p className="mb-2 text-xs text-muted-foreground line-clamp-2">{product.description}</p>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                  )}
                </div>

                <Badge variant={product.inStock ? "default" : "secondary"} className="mt-2">
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </Badge>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <div className="flex w-full gap-2">
                  <Button className="flex-1" disabled={!product.inStock} onClick={() => addToCart(product)}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/product/${product.id}`}>
                      <span className="sr-only">View product</span>
                      👁️
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No products found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  )
}
