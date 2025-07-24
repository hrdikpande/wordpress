"use client";

import { useState } from "react";
import { ExternalLink, MoreVertical, Activity, Users, FileText, Settings } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Site {
  id: string;
  name: string;
  url: string;
  status?: 'online' | 'offline' | 'maintenance' | 'error';
  lastChecked?: Date;
  stats?: {
    posts: number;
    users: number;
    plugins: number;
  };
}

interface SiteCardProps {
  site: Site;
  onManage?: (siteId: string) => void;
  onSettings?: (siteId: string) => void;
}

export function SiteCard({ site, onManage, onSettings }: SiteCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'offline':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'online':
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
      case 'offline':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      case 'maintenance':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />;
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <Card 
      className={`md-card md-animate-fade-in transition-all duration-300 cursor-pointer ${
        isHovered ? 'md-elevation-3 scale-[1.02]' : 'md-elevation-1'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {site.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="md-title-medium font-semibold text-foreground line-clamp-1">
                {site.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(site.status)}
                <Badge 
                  variant="secondary" 
                  className={`md-label-small ${getStatusColor(site.status)} border-0`}
                >
                  {site.status || 'Unknown'}
                </Badge>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md-state-layer h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="md-surface md-elevation-2">
              <DropdownMenuItem onClick={() => onManage?.(site.id)} className="md-body-medium">
                <Activity className="mr-2 h-4 w-4" />
                Manage Site
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSettings?.(site.id)} className="md-body-medium">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="md-body-medium">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Site
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ExternalLink className="h-4 w-4" />
            <span className="truncate">{site.url}</span>
          </div>
          
          {site.stats && (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="md-title-medium font-semibold">{site.stats.posts}</div>
                <div className="md-body-small text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                </div>
                <div className="md-title-medium font-semibold">{site.stats.users}</div>
                <div className="md-body-small text-muted-foreground">Users</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Settings className="h-4 w-4" />
                </div>
                <div className="md-title-medium font-semibold">{site.stats.plugins}</div>
                <div className="md-body-small text-muted-foreground">Plugins</div>
              </div>
            </div>
          )}
          
          {site.lastChecked && (
            <div className="text-xs text-muted-foreground">
              Last checked: {site.lastChecked.toLocaleString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}