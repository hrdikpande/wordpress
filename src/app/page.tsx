"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table";

interface Site {
  id: string;
  name: string;
  url: string;
}

export default function Dashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <main className="max-w-3xl mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">WordPress Sites Dashboard</h1>
        <Link href="/posts/new" className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition">
          + New Post
        </Link>
      </div>
      <Table>
        <TableCaption>List of all managed WordPress sites</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>URL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-muted-foreground">
                Loading sites...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-red-600">
                Error: {error}
              </TableCell>
            </TableRow>
          ) : sites.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-muted-foreground">
                No sites configured.
              </TableCell>
            </TableRow>
          ) : (
            sites.map((site) => (
              <TableRow key={site.id}>
                <TableCell>{site.name}</TableCell>
                <TableCell>
                  <a href={site.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                    {site.url}
                  </a>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </main>
  );
}
