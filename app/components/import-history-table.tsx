'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  FileText,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface ImportHistoryTableProps {
  data: ImportHistoryItem[];
  isLoading: boolean;
  error: string | null;
}

export function ImportHistoryTable({ data, isLoading, error }: ImportHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof ImportHistoryItem>('importDateTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item =>
      item.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [data, searchTerm, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  const handleSort = (column: keyof ImportHistoryItem) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Success</Badge>;
      case 'partial':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Partial</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Calculate summary statistics
  const totalFetched = data.reduce((sum, item) => sum + item.totalFetched, 0);
  const totalImported = data.reduce((sum, item) => sum + item.totalImported, 0);
  const totalFailed = data.reduce((sum, item) => sum + item.failedJobs, 0);
  const successRate = totalFetched > 0 ? ((totalImported / totalFetched) * 100).toFixed(1) : '0';

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <XCircle className="h-5 w-5" />
            <p className="font-medium">Error loading import history</p>
          </div>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Fetched</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalFetched.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Imported</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{totalImported.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Failed</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{totalFailed.toLocaleString()}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Success Rate</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Controls */}
      <Card className="bg-white/50 backdrop-blur-sm dark:bg-slate-900/50 border-white/20 dark:border-slate-800/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Import History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by file name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 rows</SelectItem>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="25">25 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="relative overflow-hidden rounded-lg border border-white/20 dark:border-slate-800/50">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('fileName')}
                      className="h-auto p-0 font-semibold"
                    >
                      File Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('importDateTime')}
                      className="h-auto p-0 font-semibold"
                    >
                      Import Date/Time
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('totalFetched')}
                      className="h-auto p-0 font-semibold"
                    >
                      Total Fetched
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('totalImported')}
                      className="h-auto p-0 font-semibold"
                    >
                      Total Imported
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('newJobs')}
                      className="h-auto p-0 font-semibold"
                    >
                      New Jobs
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('updatedJobs')}
                      className="h-auto p-0 font-semibold"
                    >
                      Updated Jobs
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('failedJobs')}
                      className="h-auto p-0 font-semibold"
                    >
                      Failed Jobs
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="animate-pulse">
                      <TableCell><div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div></TableCell>
                    </TableRow>
                  ))
                ) : (
                  currentData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors">
                      <TableCell className="font-medium flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{item.fileName}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(item.importDateTime), 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{item.totalFetched.toLocaleString()}</TableCell>
                      <TableCell className="font-mono">{item.totalImported.toLocaleString()}</TableCell>
                      <TableCell className="font-mono">{item.newJobs.toLocaleString()}</TableCell>
                      <TableCell className="font-mono">{item.updatedJobs.toLocaleString()}</TableCell>
                      <TableCell className="font-mono">{item.failedJobs.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(item.status)}
                          {getStatusBadge(item.status)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}