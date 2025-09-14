import React, { useState } from 'react';
import { 
  Home, 
  User, 
  FolderOpen, 
  Shield, 
  Layout, 
  Zap, 
  BarChart3, 
  HelpCircle, 
  Bell,
  ChevronDown,
  Plus,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/use-theme';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['projects']));
  const [showSettings, setShowSettings] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home, active: false },
    { id: 'personal', label: 'Personal', icon: User, active: true },
  ];

  const projectsSection = {
    id: 'projects',
    label: 'Projects',
    isSection: true,
  };

  const bottomMenuItems = [
    { id: 'admin', label: 'Admin Panel', icon: Shield },
    { id: 'templates', label: 'Templates', icon: Layout },
    { id: 'variables', label: 'Variables', icon: Zap },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'help', label: 'Help', icon: HelpCircle, hasDropdown: true },
    { id: 'whats-new', label: "What's New", icon: Bell, hasDropdown: true, showBadge: true },
  ];

  return (
    <aside className={cn(
      "relative flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo Section */}
      <div className="flex items-center h-14 px-4 border-b border-sidebar-border bg-surface">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded bg-gradient-primary">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-sidebar-foreground font-sans">flowengine</span>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="ml-auto p-1.5 rounded hover:bg-sidebar-hover transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-md transition-colors",
                  item.active 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-hover"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>

        {/* Projects Section */}
        <div className="mt-6">
          <div className="px-3 mb-2">
            {!isCollapsed && (
              <button
                onClick={() => toggleSection('projects')}
                className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-sidebar-foreground transition-colors"
              >
                <span>Projects</span>
                <ChevronDown className={cn(
                  "w-3 h-3 transition-transform",
                  expandedSections.has('projects') ? "rotate-0" : "-rotate-90"
                )} />
              </button>
            )}
          </div>
          {expandedSections.has('projects') && !isCollapsed && (
            <button className="flex items-center w-full px-3 py-2 mb-2 text-sidebar-foreground rounded-md hover:bg-sidebar-hover transition-colors">
              <Plus className="w-4 h-4 mr-3" />
              <span>Add project</span>
            </button>
          )}
        </div>

        {/* Bottom Menu Items */}
        <ul className="mt-auto space-y-1 pt-4 border-t border-sidebar-border">
          {bottomMenuItems.map((item) => (
            <li key={item.id}>
              {item.hasDropdown ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-between w-full px-3 py-2 text-sidebar-foreground rounded-md hover:bg-sidebar-hover transition-colors">
                      <div className="flex items-center">
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        {!isCollapsed && <span className="ml-3">{item.label}</span>}
                      </div>
                      {!isCollapsed && (
                        <div className="flex items-center gap-2">
                          {item.showBadge && (
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
                          )}
                          <ChevronDown className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>Documentation</DropdownMenuItem>
                    <DropdownMenuItem>Community</DropdownMenuItem>
                    <DropdownMenuItem>Support</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button className="flex items-center w-full px-3 py-2 text-sidebar-foreground rounded-md hover:bg-sidebar-hover transition-colors">
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!isCollapsed && <span className="ml-3">{item.label}</span>}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-2 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center w-full px-2 py-2 rounded-md hover:bg-sidebar-hover transition-colors">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-primary text-white text-sm font-medium">
                SP
              </div>
              {!isCollapsed && (
                <>
                  <span className="ml-3 text-sm text-sidebar-foreground truncate">shashank poola</span>
                  <ChevronDown className="w-3 h-3 ml-auto text-sidebar-foreground" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Customize your FlowEngine experience
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <Label htmlFor="theme-toggle">Dark Mode</Label>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
};

export default Sidebar;