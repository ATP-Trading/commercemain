import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MembershipBadge } from "@/components/membership/membership-badge";
import { User, Mail, Phone, MapPin, ArrowLeft, Save } from "lucide-react";
import { Link } from "@/src/i18n/navigation";

export const metadata = {
  title: "Profile Settings - ATP Trading",
  description: "Manage your personal information and preferences.",
};

// Mock customer data
const mockCustomer = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  membershipTier: "premium" as const,
  memberSince: "2024-01-15",
  address: {
    street: "123 Main Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    country: "United States",
  },
  preferences: {
    newsletter: true,
    promotions: true,
    productUpdates: true,
    memberExclusive: true,
  },
  bio: "Wellness enthusiast passionate about natural health solutions and sustainable living.",
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-atp-gray-light to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
                Profile Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your personal information and preferences
              </p>
            </div>
            <MembershipBadge tier={mockCustomer.membershipTier} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="atp-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-atp-gold" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your basic profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      defaultValue={mockCustomer.firstName}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      defaultValue={mockCustomer.lastName}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      defaultValue={mockCustomer.email}
                      className="pl-10"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      defaultValue={mockCustomer.phone}
                      className="pl-10"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    defaultValue={mockCustomer.bio}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="atp-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-atp-gold" />
                  Address Information
                </CardTitle>
                <CardDescription>
                  Your default shipping and billing address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    defaultValue={mockCustomer.address.street}
                    placeholder="Enter your street address"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      defaultValue={mockCustomer.address.city}
                      placeholder="Enter your city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      defaultValue={mockCustomer.address.state}
                      placeholder="Enter your state"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                    <Input
                      id="zipCode"
                      defaultValue={mockCustomer.address.zipCode}
                      placeholder="Enter your ZIP code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      defaultValue={mockCustomer.address.country}
                      placeholder="Enter your country"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button className="atp-button-gold">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Membership Info */}
            <Card className="atp-card">
              <CardHeader>
                <CardTitle className="text-lg">Membership Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <MembershipBadge
                    tier={mockCustomer.membershipTier}
                    className="text-sm"
                  />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Member Since
                    </div>
                    <div className="font-medium">
                      {new Date(mockCustomer.memberSince).toLocaleDateString()}
                    </div>
                  </div>
                  <Link href="/atp-membership">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                    >
                      Manage Membership
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Communication Preferences */}
            <Card className="atp-card">
              <CardHeader>
                <CardTitle className="text-lg">Preferences</CardTitle>
                <CardDescription>
                  Choose what you'd like to hear about
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Newsletter</div>
                    <div className="text-xs text-muted-foreground">
                      Weekly wellness tips
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={mockCustomer.preferences.newsletter}
                    className="rounded border-gray-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Promotions</div>
                    <div className="text-xs text-muted-foreground">
                      Special offers and sales
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={mockCustomer.preferences.promotions}
                    className="rounded border-gray-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Product Updates</div>
                    <div className="text-xs text-muted-foreground">
                      New product launches
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={mockCustomer.preferences.productUpdates}
                    className="rounded border-gray-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Member Exclusive</div>
                    <div className="text-xs text-muted-foreground">
                      VIP events and content
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={mockCustomer.preferences.memberExclusive}
                    className="rounded border-gray-300"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="atp-card">
              <CardHeader>
                <CardTitle className="text-lg">Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  size="sm"
                >
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  size="sm"
                >
                  Download Data
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  size="sm"
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
