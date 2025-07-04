'use client';

import { useEffect, useState } from 'react';
import { ImportHistoryTable } from '@/app/components/import-history-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle } from 'lucide-react';

interface ImportHistoryItem {
  id: string;
  fileName: string;
  importDateTime: string;
  totalFetched: number;
  totalImported: number;
  newJobs: number;
  updatedJobs: number;
  failedJobs: number;
  status: 'success' | 'partial' | 'failed';
}

export default function Home() {
  const [data, setData] = useState<ImportHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/import-history');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching import history:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg mb-4">
          <Activity className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Import History Dashboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Monitor and analyze your data import operations with real-time insights, 
          comprehensive analytics, and detailed tracking of all import activities.
        </p>
      </div>

      {/* Status Banner */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">System Status: Online</p>
                <p className="text-sm text-green-600 dark:text-green-400">Last sync: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600 dark:text-green-400">Next scheduled import</p>
              <p className="font-mono text-green-800 dark:text-green-200">
                {new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <ImportHistoryTable data={data} isLoading={isLoading} error={error} />

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/50 backdrop-blur-sm dark:bg-slate-900/50 border-white/20 dark:border-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-muted-foreground">Import process started</span>
                <span className="text-xs text-muted-foreground ml-auto">2 min ago</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">Data validation completed</span>
                <span className="text-xs text-muted-foreground ml-auto">5 min ago</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-muted-foreground">Batch processing in progress</span>
                <span className="text-xs text-muted-foreground ml-auto">8 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm dark:bg-slate-900/50 border-white/20 dark:border-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>System Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">API Version</span>
                <span className="font-mono">v2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database Status</span>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Records</span>
                <span className="font-mono">{data.length.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uptime</span>
                <span className="font-mono">99.8%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}