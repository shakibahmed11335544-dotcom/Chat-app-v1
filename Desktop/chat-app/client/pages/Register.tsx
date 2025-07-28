import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, MessageCircle, Mail, User, Phone, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
    avatar: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeMethod, setActiveMethod] = useState<'email' | 'username' | 'phone'>('email');
  
  const { register, error, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    // Validate that we have at least one identifier
    const activeValue = getActiveFieldValue();
    if (!activeValue || activeValue.trim().length === 0) {
      return;
    }

    const registerData: any = {
      password: formData.password,
      avatar: formData.avatar
    };

    // Only include the active method
    if (activeMethod === 'email' && formData.email) {
      registerData.email = formData.email;
    } else if (activeMethod === 'username' && formData.username) {
      registerData.username = formData.username;
    } else if (activeMethod === 'phone' && formData.phone) {
      registerData.phone = formData.phone;
    }

    const success = await register(registerData);
    if (success) {
      navigate('/');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateAvatar = () => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const initials = (formData.username || formData.email || 'U').charAt(0).toUpperCase();
    return `${randomColor}-${initials}`;
  };

  const getActiveFieldValue = () => {
    switch (activeMethod) {
      case 'email': return formData.email;
      case 'username': return formData.username;
      case 'phone': return formData.phone;
    }
  };

  const getPlaceholder = () => {
    switch (activeMethod) {
      case 'email': return 'Enter your email address';
      case 'username': return 'Choose a username';
      case 'phone': return 'Enter your phone number';
    }
  };

  const getIcon = () => {
    switch (activeMethod) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'username': return <User className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
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
          <h1 className="text-3xl font-bold text-foreground">Join GoponKotha</h1>
          <p className="text-muted-foreground mt-2">Create your account to start messaging</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Registration Method Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Register with</Label>
            <div className="flex gap-2">
              {(['email', 'username', 'phone'] as const).map((method) => (
                <Button
                  key={method}
                  type="button"
                  variant={activeMethod === method ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveMethod(method)}
                  className="flex-1 btn-hover-scale"
                >
                  {method === 'email' && <Mail className="h-4 w-4 mr-2" />}
                  {method === 'username' && <User className="h-4 w-4 mr-2" />}
                  {method === 'phone' && <Phone className="h-4 w-4 mr-2" />}
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Main Identifier Input */}
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-sm font-medium">
              {activeMethod.charAt(0).toUpperCase() + activeMethod.slice(1)}
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                {getIcon()}
              </div>
              <Input
                id="identifier"
                type={activeMethod === 'email' ? 'email' : 'text'}
                value={getActiveFieldValue()}
                onChange={(e) => handleInputChange(activeMethod, e.target.value)}
                placeholder={getPlaceholder()}
                className="pl-10 transition-all duration-200 ease-ios focus:scale-[1.02]"
                required
              />
            </div>
          </div>

          {/* Avatar Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Profile Picture</Label>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-semibold animate-scale-in">
                {(formData.username || formData.email || 'U').charAt(0).toUpperCase()}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleInputChange('avatar', generateAvatar())}
                className="transition-colors duration-200"
              >
                <Upload className="h-4 w-4 mr-2" />
                Generate Avatar
              </Button>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Create a strong password"
                className="pr-10 transition-all duration-200 ease-ios focus:scale-[1.02]"
                required
                minLength={6}
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

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                className="pr-10 transition-all duration-200 ease-ios focus:scale-[1.02]"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 transition-colors duration-200"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-sm text-destructive animate-fade-in">Passwords do not match</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || formData.password !== formData.confirmPassword}
            className="w-full btn-hover-scale shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-accent"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-primary hover:underline font-medium transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
