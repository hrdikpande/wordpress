"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Grid, List, Zap, TrendingUp, AlertCircle } from "lucide-react";
import { NavigationHeader } from "@/components/ui/navigation-header";
import { SiteCard } from "@/components/ui/site-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Site {
  id: string;
  name: string;
  url: string;
}

export default function Dashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load sites from API
  useEffect(() => {
    const loadSites = async () => {
      try {
        const response = await fetch('/api/wordpress/sites');
        const result = await response.json();
        
        if (result.success) {
          setSites(result.data);
        } else {
          setError(result.error || 'Failed to load sites');
        }
      } catch (err) {
        setError('Failed to load sites');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSites();
  }, []);

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: sites.length,
    online: sites.filter(s => s.status === 'online').length,
    offline: sites.filter(s => s.status === 'offline').length,
    maintenance: sites.filter(s => s.status === 'maintenance').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader title="WordPress Management Hub" />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-8 md-animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="md-headline-medium font-bold text-foreground mb-2">
                Welcome back! 👋
              </h1>
              <p className="md-body-large text-muted-foreground">
                Manage all your WordPress sites from one centralized dashboard
              </p>
            </div>
            <Link href="/posts/new">
              <Button className="md-filled-button gap-2 md-animate-scale-in">
                <Plus className="h-4 w-4" />
                Create New Post
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="md-card md-animate-slide-in-right" style={{ animationDelay: '0ms' }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="md-title-large font-bold text-foreground">{stats.total}</div>
                    <div className="md-body-small text-muted-foreground">Total Sites</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md-card md-animate-slide-in-right" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="md-title-large font-bold text-foreground">{stats.online}</div>
                    <div className="md-body-small text-muted-foreground">Online</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md-card md-animate-slide-in-right" style={{ animationDelay: '200ms' }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <div className="md-title-large font-bold text-foreground">{stats.maintenance}</div>
                    <div className="md-body-small text-muted-foreground">Maintenance</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md-card md-animate-slide-in-right" style={{ animationDelay: '300ms' }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <div className="md-title-large font-bold text-foreground">{stats.offline}</div>
                    <div className="md-body-small text-muted-foreground">Offline</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 md-animate-fade-in">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sites by name or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 md-text-field"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="md-outlined-button gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <div className="flex border rounded-lg p-1 bg-muted/50">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sites Grid/List */}
        <div className="md-animate-fade-in">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="md-card animate-pulse">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-xl" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-3 bg-muted rounded" />
                      <div className="grid grid-cols-3 gap-4">
                        {[...Array(3)].map((_, j) => (
                          <div key={j} className="text-center space-y-2">
                            <div className="h-6 bg-muted rounded" />
                            <div className="h-3 bg-muted rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="md-card text-center py-12">
              <CardContent>
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="md-title-medium font-semibold text-foreground mb-2">
                  Error Loading Sites
                </h3>
                <p className="md-body-medium text-muted-foreground mb-4">
                  {error}
                </p>
                <Button onClick={() => window.location.reload()} className="md-filled-button">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filteredSites.length === 0 ? (
            <Card className="md-card text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="md-title-medium font-semibold text-foreground mb-2">
                  {searchQuery ? 'No sites found' : 'No sites configured'}
                </h3>
                <p className="md-body-medium text-muted-foreground mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Configure your WordPress sites to get started'
                  }
                </p>
                {!searchQuery && (
                  <Button className="md-filled-button">
                    Add Your First Site
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredSites.map((site, index) => (
                <div 
                  key={site.id} 
                  className="md-animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <SiteCard 
                    site={site} 
                    onManage={(siteId) => console.log('Manage site:', siteId)}
                    onSettings={(siteId) => console.log('Settings for site:', siteId)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <Link href="/posts/new">
        <button className="md-fab">
          <Plus className="h-6 w-6" />
        </button>
      </Link>
    </div>
  );
}
