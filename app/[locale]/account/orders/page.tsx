import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, Download, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatDirhamAmount } from "@/lib/utils";
import { DirhamSymbol } from "@/components/icons/dirham-symbol";

export const metadata = {
  title: "Order History - ATP Trading",
  description: "View your complete order history and track shipments.",
};

// Mock order data - in real implementation, this would come from Shopify Customer API
const mockOrders = [
  {
    id: "#ATP-2024-001",
    date: "2024-03-15",
    status: "Delivered",
    total: 189.99,
    originalTotal: 218.49,
    memberSavings: 28.5,
    items: [
      { name: "Premium Vitamin C Serum", quantity: 1, price: 89.99 },
      { name: "Collagen Boost Supplement", quantity: 2, price: 49.99 },
    ],
    shippingAddress: "123 Main St, City, State 12345",
    trackingNumber: "ATP123456789",
  },
  {
    id: "#ATP-2024-002",
    date: "2024-03-10",
    status: "Shipped",
    total: 245.0,
    originalTotal: 281.75,
    memberSavings: 36.75,
    items: [
      { name: "Water Purification System Pro", quantity: 1, price: 245.0 },
    ],
    shippingAddress: "123 Main St, City, State 12345",
    trackingNumber: "ATP987654321",
  },
  {
    id: "#ATP-2024-003",
    date: "2024-03-05",
    status: "Processing",
    total: 156.5,
    originalTotal: 179.98,
    memberSavings: 23.48,
    items: [
      { name: "Omega-3 Premium", quantity: 1, price: 39.99 },
      { name: "Probiotic Complex", quantity: 1, price: 44.99 },
      { name: "Multivitamin Elite", quantity: 1, price: 34.99 },
      { name: "Hydrating Face Mask Set", quantity: 1, price: 36.53 },
    ],
    shippingAddress: "123 Main St, City, State 12345",
    trackingNumber: null,
  },
  {
    id: "#ATP-2024-004",
    date: "2024-02-28",
    status: "Delivered",
    total: 89.99,
    originalTotal: 103.49,
    memberSavings: 13.5,
    items: [{ name: "Soil Enhancement Kit", quantity: 1, price: 89.99 }],
    shippingAddress: "123 Main St, City, State 12345",
    trackingNumber: "ATP456789123",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Delivered":
      return "bg-green-500";
    case "Shipped":
      return "bg-blue-500";
    case "Processing":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

export default function OrdersPage() {
  const totalSavings = mockOrders.reduce(
    (sum, order) => sum + order.memberSavings,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-atp-gray-light to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Account
          </Link>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Order History
              </h1>
              <p className="text-muted-foreground">
                Track your orders and view your purchase history
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-atp-gold flex items-center gap-1 justify-end">
                <DirhamSymbol size={20} />
                {formatDirhamAmount(totalSavings)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Member Savings
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search orders..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {mockOrders.map((order) => (
            <Card key={order.id} className="atp-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Package className="w-5 h-5 text-atp-gold" />
                    <div>
                      <CardTitle className="text-lg">{order.id}</CardTitle>
                      <CardDescription>
                        Ordered on {new Date(order.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-3">
                      Items ({order.items.length})
                    </h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <span className="flex items-center gap-1">
                            <DirhamSymbol size={12} />
                            {formatDirhamAmount(item.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div>
                    <h4 className="font-medium mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Original Total:</span>
                        <span className="line-through text-muted-foreground flex items-center gap-1">
                          <DirhamSymbol size={12} />
                          {formatDirhamAmount(order.originalTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-atp-gold">
                        <span>Member Savings:</span>
                        <span className="flex items-center gap-1">
                          -<DirhamSymbol size={12} />
                          {formatDirhamAmount(order.memberSavings)}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Total Paid:</span>
                        <span className="flex items-center gap-1">
                          <DirhamSymbol size={12} />
                          {formatDirhamAmount(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Tracking Info */}
                    {order.trackingNumber && (
                      <div className="mt-4 p-3 bg-atp-gold/10 rounded-lg">
                        <div className="text-sm font-medium mb-1">
                          Tracking Number
                        </div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {order.trackingNumber}
                        </div>
                      </div>
                    )}

                    {/* Shipping Address */}
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-1">
                        Shipping Address
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.shippingAddress}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-4 border-t">
                  {order.status === "Delivered" && (
                    <Button variant="outline" size="sm">
                      Reorder Items
                    </Button>
                  )}
                  {order.trackingNumber && (
                    <Button variant="outline" size="sm">
                      Track Package
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    Download Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline">Load More Orders</Button>
        </div>
      </div>
    </div>
  );
}
