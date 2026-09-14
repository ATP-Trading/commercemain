'use client'

import { useCustomer } from '@/hooks/use-customer'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Mail, Phone, MapPin, Package, LogOut, Edit, Crown, CreditCard, Settings, ShoppingBag, Award, TrendingUp } from 'lucide-react'
import { Link } from '@/src/i18n/navigation'
import { formatDirhamWithSymbol } from '@/lib/utils'
import { AtpMembershipWidget } from '@/components/membership/atp-membership-widget'
import { MembershipProvider } from '@/hooks/use-atp-membership-context'
import { useMembership } from '@/hooks/use-membership'

export function AccountDashboard() {
    const { customer, isLoading, logout } = useCustomer({ autoFetch: true })
    const { isMember, isLoading: membershipLoading } = useMembership()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !customer) {
            router.push('/auth/login')
        }
    }, [customer, isLoading, router])

    const handleLogout = async () => {
        await logout()
        router.push('/')
    }

    if (isLoading) {
        return <AccountPageSkeleton />
    }

    if (!customer) {
        return null
    }

    // Calculate stats
    const totalOrders = customer.orders.edges.length
    const totalSpent = customer.orders.edges.reduce(
        (sum, { node }) => sum + parseFloat(node.totalPriceV2.amount),
        0
    )

    // Get initials for avatar
    const initials = `${customer.firstName?.[0] || ''}${customer.lastName?.[0] || ''}`.toUpperCase()

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Profile Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-800 shadow-lg">
                                <AvatarImage src="" alt={`${customer.firstName} ${customer.lastName}`} />
                                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                    {customer.firstName} {customer.lastName}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Member since {new Date().getFullYear()}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={handleLogout} className="md:self-start">
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                                        <p className="text-3xl font-bold">{totalOrders}</p>
                                    </div>
                                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                        <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                                        <p className="text-3xl font-bold">
                                            {formatDirhamWithSymbol(totalSpent).display} {formatDirhamWithSymbol(totalSpent).symbol}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-purple-500">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Membership</p>
                                        <p className="text-xl font-bold">
                                            {membershipLoading ? 'Checking...' : isMember ? 'ATP Member' : 'Not a member yet'}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                        <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto">
                        <TabsTrigger value="overview" className="gap-2">
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="orders" className="gap-2">
                            <Package className="w-4 h-4" />
                            <span className="hidden sm:inline">Orders</span>
                        </TabsTrigger>
                        <TabsTrigger value="membership" className="gap-2">
                            <Crown className="w-4 h-4" />
                            <span className="hidden sm:inline">Membership</span>
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="gap-2">
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">Settings</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Profile Information */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="w-5 h-5" />
                                                Profile Information
                                            </CardTitle>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href="/account/profile">
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">First Name</label>
                                                <p className="text-lg font-medium">{customer.firstName}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Name</label>
                                                <p className="text-lg font-medium">{customer.lastName}</p>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                            <Mail className="w-5 h-5 text-gray-500" />
                                            <span className="font-medium">{customer.email}</span>
                                        </div>

                                        {customer.phone && (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                <Phone className="w-5 h-5 text-gray-500" />
                                                <span className="font-medium">{customer.phone}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Marketing emails</span>
                                            <Badge variant={customer.acceptsMarketing ? "default" : "secondary"}>
                                                {customer.acceptsMarketing ? "Subscribed" : "Not subscribed"}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Default Address */}
                                {customer.defaultAddress && (
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="flex items-center gap-2">
                                                    <MapPin className="w-5 h-5" />
                                                    Default Address
                                                </CardTitle>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href="/account/addresses">
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Manage
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                <p className="font-semibold text-lg">
                                                    {customer.defaultAddress.firstName} {customer.defaultAddress.lastName}
                                                </p>
                                                {customer.defaultAddress.company && (
                                                    <p className="text-gray-600 dark:text-gray-400">{customer.defaultAddress.company}</p>
                                                )}
                                                <p className="text-gray-700 dark:text-gray-300">{customer.defaultAddress.address1}</p>
                                                {customer.defaultAddress.address2 && (
                                                    <p className="text-gray-700 dark:text-gray-300">{customer.defaultAddress.address2}</p>
                                                )}
                                                <p className="text-gray-700 dark:text-gray-300">
                                                    {customer.defaultAddress.city}, {customer.defaultAddress.province} {customer.defaultAddress.zip}
                                                </p>
                                                <p className="text-gray-700 dark:text-gray-300">{customer.defaultAddress.country}</p>
                                                {customer.defaultAddress.phone && (
                                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                                        <Phone className="w-4 h-4 text-gray-500" />
                                                        <p className="text-gray-600 dark:text-gray-400">{customer.defaultAddress.phone}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Quick Actions */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quick Actions</CardTitle>
                                        <CardDescription>Manage your account</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button variant="outline" className="w-full justify-start hover:bg-purple-50 dark:hover:bg-purple-900/20" asChild>
                                            <Link href="/account/membership">
                                                <Crown className="w-4 h-4 mr-2" />
                                                ATP Membership
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start hover:bg-blue-50 dark:hover:bg-blue-900/20" asChild>
                                            <Link href="/account/orders">
                                                <Package className="w-4 h-4 mr-2" />
                                                View All Orders
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start hover:bg-green-50 dark:hover:bg-green-900/20" asChild>
                                            <Link href="/account/addresses">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                Manage Addresses
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start hover:bg-orange-50 dark:hover:bg-orange-900/20" asChild>
                                            <Link href="/account/profile">
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit Profile
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Orders Tab */}
                    <TabsContent value="orders" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Package className="w-5 h-5" />
                                            Recent Orders
                                        </CardTitle>
                                        <CardDescription>
                                            Your order history and tracking
                                        </CardDescription>
                                    </div>
                                    <Button variant="outline" asChild>
                                        <Link href="/account/orders">View All</Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {customer.orders.edges.length > 0 ? (
                                    <div className="space-y-4">
                                        {customer.orders.edges.slice(0, 5).map(({ node: order }) => {
                                            const pricing = formatDirhamWithSymbol(parseFloat(order.totalPriceV2.amount))
                                            return (
                                                <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                                                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold">#{order.orderNumber}</span>
                                                                <p className="text-sm text-gray-500">
                                                                    {new Date(order.processedAt).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold">
                                                                {pricing.display} {pricing.symbol}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {order.lineItems.edges.length} item(s)
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        View Details
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Package className="w-10 h-10 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">Start shopping to see your orders here</p>
                                        <Button asChild>
                                            <Link href="/">
                                                Start Shopping
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Membership Tab */}
                    <TabsContent value="membership" className="space-y-6">
                        <MembershipProvider customerId={customer.id}>
                            <AtpMembershipWidget customerId={customer.id} />
                        </MembershipProvider>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    Account Settings
                                </CardTitle>
                                <CardDescription>
                                    Manage your account preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <Link href="/account/profile">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Profile Information
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <Link href="/account/addresses">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            Manage Addresses
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <Link href="/account/payment-methods">
                                            <CreditCard className="w-4 h-4 mr-2" />
                                            Payment Methods
                                        </Link>
                                    </Button>
                                </div>

                                <Separator className="my-4" />

                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Privacy & Security</h4>
                                    <Button variant="outline" className="w-full justify-start">
                                        Change Password
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        Two-Factor Authentication
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        Download Your Data
                                    </Button>
                                </div>

                                <Separator className="my-4" />

                                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

function AccountPageSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div>
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-24" />
                </div>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-8 w-16" />
                                    </div>
                                    <Skeleton className="h-12 w-12 rounded-lg" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tabs Skeleton */}
                <div className="space-y-6">
                    <Skeleton className="h-10 w-full max-w-md" />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <Skeleton className="h-6 w-40" />
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Skeleton className="h-4 w-20 mb-1" />
                                            <Skeleton className="h-6 w-24" />
                                        </div>
                                        <div>
                                            <Skeleton className="h-4 w-20 mb-1" />
                                            <Skeleton className="h-6 w-24" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-12 w-full rounded-lg" />
                                    <Skeleton className="h-12 w-full rounded-lg" />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-4 w-40" />
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <Skeleton key={i} className="h-10 w-full" />
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
