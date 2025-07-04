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
  ChevronUp,
  ChevronDown,
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

type SortableColumn = 'fileName' | 'importDateTime' | 'totalFetched' | 'totalImported' | 'newJobs' | 'updatedJobs' | 'failedJobs';

export function ImportHistoryTable({ data, isLoading, error }: ImportHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<SortableColumn>('importDateTime');
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

  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (column: SortableColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="ml-2 h-4 w-4" />
      : <ChevronDown className="ml-2 h-4 w-4" />;
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

  const getNumericCellColor = (value: number, type: 'new' | 'updated' | 'failed') => {
    if (value === 0) return '';
    
    switch (type) {
      case 'new':
        return 'text-green-600 dark:text-green-400 font-semibold';
      case 'updated':
        return 'text-yellow-600 dark:text-yellow-400 font-semibold';
      case 'failed':
        return 'text-red-600 dark:text-red-400 font-semibold';
      default:
        return '';
    }
  };

  // Calculate summary statistics
  const totalFetched = data.reduce((sum, item) => sum + item.totalFetched, 0);
  const totalImported = data.reduce((sum, item) => sum + item.totalImported, 0);
  const totalFailed = data.reduce((sum, item) => sum + item.failedJobs, 0);
  const successRate = totalFetched > 0 ? ((totalImported / totalFetched) * 100).toFixed(1) : '0';

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

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
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 transition-colors duration-300">
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
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800 transition-colors duration-300">
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
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800 transition-colors duration-300">
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
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800 transition-colors duration-300">
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
      <Card className="bg-white/50 backdrop-blur-sm dark:bg-slate-900/50 border-white/20 dark:border-slate-800/50 transition-colors duration-300">
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
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                aria-label="Search import history by file name"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-32 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 rows</SelectItem>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="25">25 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm"
                className="focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Table Container with Accessibility */}
          <div 
            className="relative overflow-x-auto rounded-lg border border-white/20 dark:border-slate-800/50"
            aria-live="polite"
            aria-label="Import history table with search and pagination"
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 shadow-sm">
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="col">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('fileName')}
                      className="h-auto p-0 font-semibold hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                      aria-label={`Sort by file name ${sortColumn === 'fileName' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : 'descending'}`}
                    >
                      File Name
                      {getSortIcon('fileName')}
                    </Button>
                  </TableHead>
                  <TableHead scope="col">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('importDateTime')}
                      className="h-auto p-0 font-semibold hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                      aria-label={`Sort by import date ${sortColumn === 'importDateTime' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : 'descending'}`}
                    >
                      Import Date/Time
                      {getSortIcon('importDateTime')}
                    </Button>
                  </TableHead>
                  <TableHead scope="col">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('totalFetched')}
                      className="h-auto p-0 font-semibold hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                      aria-label={`Sort by total fetched ${sortColumn === 'totalFetched' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : 'descending'}`}
                    >
                      Total Fetched
                      {getSortIcon('totalFetched')}
                    </Button>
                  </TableHead>
                  <TableHead scope="col">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('totalImported')}
                      className="h-auto p-0 font-semibold hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                      aria-label={`Sort by total imported ${sortColumn === 'totalImported' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : 'descending'}`}
                    >
                      Total Imported
                      {getSortIcon('totalImported')}
                    </Button>
                  </TableHead>
                  <TableHead scope="col">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('newJobs')}
                      className="h-auto p-0 font-semibold hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                      aria-label={`Sort by new jobs ${sortColumn === 'newJobs' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : 'descending'}`}
                    >
                      New Jobs
                      {getSortIcon('newJobs')}
                    </Button>
                  </TableHead>
                  <TableHead scope="col">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('updatedJobs')}
                      className="h-auto p-0 font-semibold hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                      aria-label={`Sort by updated jobs ${sortColumn === 'updatedJobs' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : 'descending'}`}
                    >
                      Updated Jobs
                      {getSortIcon('updatedJobs')}
                    </Button>
                  </TableHead>
                  <TableHead scope="col">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('failedJobs')}
                      className="h-auto p-0 font-semibold hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                      aria-label={`Sort by failed jobs ${sortColumn === 'failedJobs' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : 'descending'}`}
                    >
                      Failed Jobs
                      {getSortIcon('failedJobs')}
                    </Button>
                  </TableHead>
                  <TableHead scope="col">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="animate-pulse odd:bg-gray-50 dark:odd:bg-gray-800">
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
                  currentData.map((item, index) => (
                    <TableRow 
                      key={item.id} 
                      className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors duration-300 odd:bg-gray-50 dark:odd:bg-gray-800"
                    >
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
                      <TableCell className={`font-mono ${getNumericCellColor(item.newJobs, 'new')}`}>
                        {item.newJobs.toLocaleString()}
                      </TableCell>
                      <TableCell className={`font-mono ${getNumericCellColor(item.updatedJobs, 'updated')}`}>
                        {item.updatedJobs.toLocaleString()}
                      </TableCell>
                      <TableCell className={`font-mono ${getNumericCellColor(item.failedJobs, 'failed')}`}>
                        {item.failedJobs.toLocaleString()}
                      </TableCell>
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

          {/* Enhanced Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length} entries
              {searchTerm && ` (filtered from ${data.length} total)`}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                aria-label="Go to previous page"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                      aria-label={`Go to page ${page}`}
                      aria-current={currentPage === page ? "page" : undefined}
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
                className="focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                aria-label="Go to next page"
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