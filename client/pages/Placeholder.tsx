import { Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlaceholderProps {
  title: string;
  description: string;
}

export function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <Construction className="h-16 w-16 text-muted-foreground mx-auto" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button 
          onClick={() => window.history.back()}
          className="bg-primary hover:bg-primary/90"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}

export function Settings() {
  return (
    <Placeholder 
      title="Settings" 
      description="Settings page is coming soon. You'll be able to manage your theme, privacy controls, and profile here." 
    />
  );
}

export function AddContact() {
  return (
    <Placeholder 
      title="Add Contact" 
      description="Add contact feature is coming soon. You'll be able to add friends by phone number, username, or email." 
    />
  );
}

export function Admin() {
  return (
    <Placeholder 
      title="Admin Panel" 
      description="Admin panel is coming soon. Manage users, view stats, and handle reports from here." 
    />
  );
}
