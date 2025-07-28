import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MessageCircle,
  Users,
  Phone,
  Settings,
  Archive,
  Star,
  MoreVertical,
  LogOut,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";
import { AddFriendDialog } from "./AddFriendDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useMessaging } from "@/contexts/MessagingContext";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { chats } = useMessaging();
  const [showAddFriend, setShowAddFriend] = useState(false);

  const unreadCount = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  const sidebarItems = [
    {
      icon: MessageCircle,
      label: "Chats",
      path: "/",
      count: unreadCount
    },
    {
      icon: Users,
      label: "Groups",
      path: "/groups"
    },
    {
      icon: Star,
      label: "Starred",
      path: "/starred"
    },
    {
      icon: Archive,
      label: "Archived",
      path: "/archived"
    },
    {
      icon: Phone,
      label: "Calls",
      path: "/calls"
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-sidebar-foreground">GoponKotha</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full icon-btn-hover"
              onClick={() => setShowAddFriend(true)}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full icon-btn-hover">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="animate-scale-in">
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg btn-hover-scale group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-sidebar-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors duration-200",
                    isActive ? "text-primary-foreground" : "text-sidebar-foreground"
                  )} />
                  <span className="font-medium">{item.label}</span>
                  {item.count && (
                    <span className={cn(
                      "ml-auto px-2 py-0.5 text-xs rounded-full",
                      isActive 
                        ? "bg-primary-foreground/20 text-primary-foreground" 
                        : "bg-primary text-primary-foreground"
                    )}>
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-sidebar-border">
          <Link
            to="/settings"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted btn-hover-scale group"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-foreground">
                  {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              {user?.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-online-indicator border-2 border-background rounded-full"></div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sidebar-foreground">
                {user?.username || user?.email || 'User'}
              </p>
              <p className="text-sm text-muted-foreground">{user?.status || 'Available'}</p>
            </div>
            <Settings className="w-4 h-4 text-muted-foreground group-hover:text-sidebar-foreground transition-colors" />
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>

      {/* Add Friend Dialog */}
      <AddFriendDialog open={showAddFriend} onOpenChange={setShowAddFriend} />
    </div>
  );
}
