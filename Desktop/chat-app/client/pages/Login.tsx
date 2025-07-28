import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, MessageCircle, Mail, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [identifierType, setIdentifierType] = useState<'email' | 'username' | 'phone'>('email');
  
  const { login, error, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(identifier, password);
    if (success) {
      navigate('/');
    }
  };

  const getIdentifierIcon = () => {
    switch (identifierType) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'username': return <User className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
    }
  };

  const getPlaceholder = () => {
    switch (identifierType) {
      case 'email': return 'Enter your email';
      case 'username': return 'Enter your username';
      case 'phone': return 'Enter your phone number';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-modal-in">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
            <MessageCircle className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome to GoponKotha</h1>
          <p className="text-muted-foreground mt-2">Sign in to continue messaging</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Login Method Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Login with</Label>
            <div className="flex gap-2">
              {(['email', 'username', 'phone'] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={identifierType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIdentifierType(type)}
                  className="flex-1 btn-hover-scale"
                >
                  {type === 'email' && <Mail className="h-4 w-4 mr-2" />}
                  {type === 'username' && <User className="h-4 w-4 mr-2" />}
                  {type === 'phone' && <Phone className="h-4 w-4 mr-2" />}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Identifier Input */}
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-sm font-medium">
              {identifierType.charAt(0).toUpperCase() + identifierType.slice(1)}
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                {getIdentifierIcon()}
              </div>
              <Input
                id="identifier"
                type={identifierType === 'email' ? 'email' : 'text'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={getPlaceholder()}
                className="pl-10 transition-all duration-200 ease-ios focus:scale-[1.02]"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pr-10 transition-all duration-200 ease-ios focus:scale-[1.02]"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full btn-hover-scale shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-accent"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-primary hover:underline font-medium transition-colors duration-200"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo Login */}
        <div className="text-center">
          <div className="border-t border-border pt-6">
            <p className="text-xs text-muted-foreground mb-3">Demo Account</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIdentifier('demo');
                setPassword('demo123');
                setIdentifierType('username');
              }}
              className="transition-colors duration-200"
            >
              Use Demo Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
