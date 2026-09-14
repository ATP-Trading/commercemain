'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Settings, BarChart3 } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AdminLayout({ children, title = 'Admin Dashboard' }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Admin Access
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                ATP Trading
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            <a
              href="/admin/membership"
              className="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
            >
              <Users className="h-4 w-4" />
              <span>Memberships</span>
            </a>
            
            <a
              href="/admin/analytics"
              className="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </a>
            
            <a
              href="/admin/settings"
              className="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              © 2024 ATP Trading - Admin Dashboard
            </div>
            <div className="flex items-center space-x-4">
              <span>Version 1.0</span>
              <Badge variant="outline" className="text-green-600 border-green-200">
                System Healthy
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}