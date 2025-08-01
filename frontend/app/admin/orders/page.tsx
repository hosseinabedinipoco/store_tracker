"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, Package, Truck, CheckCircle, XCircle, Clock, Eye, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminNavbar } from "@/components/admin-navbar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const initialOrders = [
  {
    id: "ORD-001",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    date: "2024-01-25",
    status: "processing",
    total: 129.99,
    items: [
      {
        id: 1,
        name: "Wireless Bluetooth Headphones",
        price: 79.99,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        id: 2,
        name: "Phone Case",
        price: 24.99,
        quantity: 2,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    shippingAddress: "123 Main St, City, State 12345",
    trackingNumber: null,
    notes: "",
  },
  {
    id: "ORD-002",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    date: "2024-01-24",
    status: "shipped",
    total: 199.99,
    items: [
      {
        id: 3,
        name: "Smart Fitness Watch",
        price: 199.99,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    shippingAddress: "456 Oak Ave, Town, State 67890",
    trackingNumber: "TRK987654321",
    notes: "Customer requested expedited shipping",
  },
  {
    id: "ORD-003",
    customerName: "Bob Johnson",
    customerEmail: "bob@example.com",
    date: "2024-01-23",
    status: "delivered",
    total: 84.98,
    items: [
      {
        id: 4,
        name: "Organic Cotton T-Shirt",
        price: 24.99,
        quantity: 2,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        id: 5,
        name: "Yoga Mat",
        price: 34.99,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    shippingAddress: "789 Pine Rd, Village, State 13579",
    trackingNumber: "TRK123456789",
    notes: "",
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "delivered":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "shipped":
      return <Truck className="h-4 w-4 text-blue-500" />
    case "processing":
      return <Clock className="h-4 w-4 text-yellow-500" />
    case "cancelled":
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Package className="h-4 w-4 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800"
    case "shipped":
      return "bg-blue-100 text-blue-800"
    case "processing":
      return "bg-yellow-100 text-yellow-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(initialOrders)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [editingOrder, setEditingOrder] = useState(null)
  const [newStatus, setNewStatus] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [notes, setNotes] = useState("")

  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "amount-high":
          return b.total - a.total
        case "amount-low":
          return a.total - b.total
        default:
          return 0
      }
    })

  const ordersByStatus = {
    all: orders,
    processing: orders.filter((order) => order.status === "processing"),
    shipped: orders.filter((order) => order.status === "shipped"),
    delivered: orders.filter((order) => order.status === "delivered"),
    cancelled: orders.filter((order) => order.status === "cancelled"),
  }

  const handleUpdateOrder = () => {
    if (editingOrder) {
      setOrders(
        orders.map((order) =>
          order.id === editingOrder.id
            ? {
                ...order,
                status: newStatus || order.status,
                trackingNumber: trackingNumber || order.trackingNumber,
                notes: notes || order.notes,
              }
            : order,
        ),
      )
      setEditingOrder(null)
      setNewStatus("")
      setTrackingNumber("")
      setNotes("")
    }
  }

  const openEditDialog = (order) => {
    setEditingOrder(order)
    setNewStatus(order.status)
    setTrackingNumber(order.trackingNumber || "")
    setNotes(order.notes || "")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Order Management</h1>
          <p className="text-muted-foreground">Manage customer orders and update order status</p>
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
              <SelectItem value="amount-high">Amount: High to Low</SelectItem>
              <SelectItem value="amount-low">Amount: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({ordersByStatus.all.length})</TabsTrigger>
            <TabsTrigger value="processing">Processing ({ordersByStatus.processing.length})</TabsTrigger>
            <TabsTrigger value="shipped">Shipped ({ordersByStatus.shipped.length})</TabsTrigger>
            <TabsTrigger value="delivered">Delivered ({ordersByStatus.delivered.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({ordersByStatus.cancelled.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <CardTitle className="text-lg">Order {order.id}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {order.customerName} • {order.customerEmail}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Placed on {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(order.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                      </Badge>
                      <div className="text-right">
                        <p className="font-semibold">${order.total}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} item{order.items.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
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
                              Quantity: {item.quantity} × ${item.price}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Details */}
                    <div className="pt-4 border-t space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Shipping Address:</span> {order.shippingAddress}
                      </p>
                      {order.trackingNumber && (
                        <p className="text-sm">
                          <span className="font-medium">Tracking Number:</span> {order.trackingNumber}
                        </p>
                      )}
                      {order.notes && (
                        <p className="text-sm">
                          <span className="font-medium">Notes:</span> {order.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4 border-t">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(order)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Update Status
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Order {order.id}</DialogTitle>
                            <DialogDescription>Update the order status and tracking information</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="status">Order Status</Label>
                              <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="tracking">Tracking Number</Label>
                              <Input
                                id="tracking"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="Enter tracking number"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="notes">Notes</Label>
                              <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any notes about this order"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingOrder(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleUpdateOrder}>Update Order</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Other status tabs would have similar content but filtered */}
          {["processing", "shipped", "delivered", "cancelled"].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {ordersByStatus[status].map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <CardTitle className="text-lg">Order {order.id}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {order.customerName} • {order.customerEmail}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Placed on {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(order.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </div>
                        </Badge>
                        <div className="text-right">
                          <p className="font-semibold">${order.total}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items.length} item{order.items.length > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4">
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
                                Quantity: {item.quantity} × ${item.price}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Shipping Address:</span> {order.shippingAddress}
                        </p>
                        {order.trackingNumber && (
                          <p className="text-sm">
                            <span className="font-medium">Tracking Number:</span> {order.trackingNumber}
                          </p>
                        )}
                        {order.notes && (
                          <p className="text-sm">
                            <span className="font-medium">Notes:</span> {order.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(order)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Update Status
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Order {order.id}</DialogTitle>
                              <DialogDescription>Update the order status and tracking information</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="status">Order Status</Label>
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="tracking">Tracking Number</Label>
                                <Input
                                  id="tracking"
                                  value={trackingNumber}
                                  onChange={(e) => setTrackingNumber(e.target.value)}
                                  placeholder="Enter tracking number"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                  id="notes"
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  placeholder="Add any notes about this order"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditingOrder(null)}>
                                Cancel
                              </Button>
                              <Button onClick={handleUpdateOrder}>Update Order</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {filteredOrders.length === 0 && (
          <div className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </main>
    </div>
  )
}
