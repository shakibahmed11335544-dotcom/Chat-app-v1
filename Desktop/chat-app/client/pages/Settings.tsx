import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft,
  User,
  Bell,
  Shield,
  Database,
  HelpCircle,
  Heart,
  MessageSquare,
  Users,
  Archive,
  Star,
  ChevronRight,
  Camera,
  QrCode,
  Key,
  Globe,
  Moon,
  Smartphone,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

interface SettingsItem {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  action?: "navigate" | "toggle" | "custom";
  path?: string;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  customContent?: React.ReactNode;
}

const profileSettings: SettingsItem[] = [
  {
    icon: User,
    title: "Profile",
    subtitle: "Name, About, Phone number",
    action: "navigate",
    path: "/settings/profile"
  },
  {
    icon: QrCode,
    title: "QR Code",
    subtitle: "Share your contact info",
    action: "navigate",
    path: "/settings/qr"
  }
];

const accountSettings: SettingsItem[] = [
  {
    icon: Shield,
    title: "Privacy",
    subtitle: "Block contacts, disappearing messages",
    action: "navigate", 
    path: "/settings/privacy"
  },
  {
    icon: Key,
    title: "Security",
    subtitle: "Security notifications, app lock",
    action: "navigate",
    path: "/settings/security"
  },
  {
    icon: Users,
    title: "Two-step verification",
    subtitle: "Add extra security to your account",
    action: "navigate",
    path: "/settings/two-step"
  },
  {
    icon: Smartphone,
    title: "Change number",
    subtitle: "Change your phone number",
    action: "navigate",
    path: "/settings/change-number"
  },
  {
    icon: MessageSquare,
    title: "Request account info",
    subtitle: "Request a report of your account info",
    action: "navigate",
    path: "/settings/account-info"
  },
  {
    icon: Archive,
    title: "Delete account",
    subtitle: "Delete your account and erase your message history",
    action: "navigate",
    path: "/settings/delete-account"
  }
];

const chatSettings: SettingsItem[] = [
  {
    icon: MessageSquare,
    title: "Chat backup",
    subtitle: "Back up your messages and media",
    action: "navigate",
    path: "/settings/chat-backup"
  },
  {
    icon: Download,
    title: "Chat history",
    subtitle: "Export chat history",
    action: "navigate",
    path: "/settings/chat-history"
  },
  {
    icon: Globe,
    title: "App language",
    subtitle: "English (device's language)",
    action: "navigate",
    path: "/settings/language"
  }
];

const notificationSettings: SettingsItem[] = [
  {
    icon: Bell,
    title: "Notifications",
    subtitle: "Message, group & call tones",
    action: "navigate",
    path: "/settings/notifications"
  }
];

const supportSettings: SettingsItem[] = [
  {
    icon: HelpCircle,
    title: "Help",
    subtitle: "Help center, contact us, privacy policy",
    action: "navigate",
    path: "/settings/help"
  },
  {
    icon: Heart,
    title: "Tell a friend",
    subtitle: "Share GoponKotha with friends",
    action: "navigate",
    path: "/settings/invite"
  }
];

function SettingsSection({ 
  title, 
  items 
}: { 
  title: string; 
  items: SettingsItem[] 
}) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 px-4">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-4 p-4 hover:bg-muted/50 btn-hover-scale cursor-pointer group",
              item.action === "navigate" && "hover:bg-muted"
            )}
          >
            <div className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors">
              <item.icon className="w-full h-full" />
            </div>
            
            <div className="flex-1">
              <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              {item.subtitle && (
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              )}
            </div>

            {item.action === "navigate" && (
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
            
            {item.action === "toggle" && (
              <Switch
                checked={item.value}
                onCheckedChange={item.onToggle}
              />
            )}
            
            {item.customContent}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Settings() {
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="flex flex-col h-full animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border animate-fade-in">
        <Link to="/">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h2 className="text-xl font-semibold">Settings</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 btn-hover-scale cursor-pointer group">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-xl font-semibold text-primary-foreground">U</span>
              </div>
              <Button
                variant="secondary"
                size="icon"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-lg icon-btn-hover"
                onClick={() => {
                  // TODO: Change profile picture
                  console.log('Change profile picture clicked');
                }}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                User Name
              </h3>
              <p className="text-muted-foreground">Available</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </div>

        {/* Settings Sections */}
        <div className="py-4">
          <SettingsSection title="Account" items={profileSettings} />
          <SettingsSection title="Privacy & Security" items={accountSettings} />
          <SettingsSection title="Chats" items={chatSettings} />
          
          {/* Theme Toggle Section */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 px-4">
              Appearance
            </h3>
            <div className="space-y-1">
              <div className="flex items-center gap-4 p-4">
                <div className="w-6 h-6 text-muted-foreground">
                  <Moon className="w-full h-full" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">Theme</h4>
                  <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>

          <SettingsSection title="Notifications" items={notificationSettings} />
          <SettingsSection title="Support" items={supportSettings} />
        </div>

        {/* App Info */}
        <div className="p-4 border-t border-border text-center">
          <p className="text-sm text-muted-foreground mb-2">GoponKotha</p>
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          <p className="text-xs text-muted-foreground mt-2">Made with ❤️ for seamless communication</p>
        </div>
      </div>
    </div>
  );
}
