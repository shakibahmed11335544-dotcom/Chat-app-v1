import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, ArrowRight, Shield, User, Mail, AtSign, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService, SignupData } from '@/services/auth';
import { useTheme } from '@/contexts/ThemeContext';

export function Signup() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<SignupData>({
    username: '',
    email: '',
    password: '',
    displayName: ''
  });

  const [validations, setValidations] = useState({
    username: false,
    email: false,
    password: false,
    displayName: false
  });

  const handleInputChange = (field: keyof SignupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    
    // Real-time validation
    validateField(field, value);
  };

  const validateField = (field: keyof SignupData, value: string) => {
    let isValid = false;

    switch (field) {
      case 'username':
        isValid = /^[a-zA-Z0-9_]{3,20}$/.test(value);
        break;
      case 'email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
      case 'password':
        isValid = value.length >= 6;
        break;
      case 'displayName':
        isValid = value.trim().length >= 2;
        break;
    }

    setValidations(prev => ({ ...prev, [field]: isValid }));
  };

  const handleSignup = async () => {
    setIsLoading(true);
    setErrors({});

    // Validate all fields
    const newErrors: Record<string, string> = {};
    
    if (!validations.username) {
      newErrors.username = 'Username must be 3-20 characters (letters, numbers, underscore only)';
    }
    
    if (!validations.email) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!validations.password) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    if (!validations.displayName) {
      newErrors.displayName = 'Display name must be at least 2 characters long';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Save user to all users list for demo
      const allUsers = JSON.parse(localStorage.getItem('gk-all-users') || '[]');
      
      // Check if username or email already exists
      const existingUser = allUsers.find((u: any) => 
        u.username === formData.username || u.email === formData.email
      );
      
      if (existingUser) {
        if (existingUser.username === formData.username) {
          setErrors({ username: 'Username already exists' });
        } else {
          setErrors({ email: 'Email already exists' });
        }
        setIsLoading(false);
        return;
      }

      const result = await authService.signup(formData);
      
      // Add to all users list
      allUsers.push(result.user);
      localStorage.setItem('gk-all-users', JSON.stringify(allUsers));
      
      // Navigate to chat
      navigate('/chat');
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Signup failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = Object.values(validations).every(Boolean) && 
                     Object.values(formData).every(value => value.trim() !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Theme Toggle */}
      <Button
        onClick={toggleTheme}
        className={cn(
          "fixed top-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
          "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary",
          "border-2 border-background/50 backdrop-blur-sm smooth-scale",
          theme === 'dark' 
            ? "hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]" 
            : "hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]"
        )}
        size="sm"
      >
        {theme === 'dark' ? (
          <span className="text-primary-foreground transition-transform hover:rotate-12 text-lg font-bold">☀</span>
        ) : (
          <span className="text-primary-foreground transition-transform hover:rotate-12 text-lg font-bold">🌙</span>
        )}
      </Button>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        {theme === 'dark' && (
          <>
            <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-primary/3 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-primary/3 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
          </>
        )}
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo Section */}
        <div className="text-center space-y-4 fade-in">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-3xl flex items-center justify-center shadow-xl smooth-scale">
              <span className="text-primary-foreground font-bold text-2xl tracking-tight">GK</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                GoponKotha
              </h1>
              <p className="text-muted-foreground text-sm">Connect • Chat • Share</p>
            </div>
          </div>
        </div>

        <Card className="glassmorphism border-border/50 shadow-2xl backdrop-blur-xl slide-up">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
            <CardDescription className="text-base">
              Join GoponKotha and start connecting with friends
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {errors.general && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {errors.general}
              </div>
            )}

            <div className="space-y-4">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm font-medium flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Display Name</span>
                  {validations.displayName && <Check className="h-3 w-3 text-green-500" />}
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="Your full name"
                  className={cn(
                    "bg-input/30 border-border/50 focus:bg-input/50 smooth-transition h-12",
                    errors.displayName && "border-destructive focus:border-destructive",
                    validations.displayName && "border-green-500/50"
                  )}
                />
                {errors.displayName && (
                  <p className="text-destructive text-xs flex items-center space-x-1">
                    <X className="h-3 w-3" />
                    <span>{errors.displayName}</span>
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium flex items-center space-x-2">
                  <AtSign className="h-4 w-4" />
                  <span>Username</span>
                  {validations.username && <Check className="h-3 w-3 text-green-500" />}
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Choose a unique username"
                  className={cn(
                    "bg-input/30 border-border/50 focus:bg-input/50 smooth-transition h-12",
                    errors.username && "border-destructive focus:border-destructive",
                    validations.username && "border-green-500/50"
                  )}
                />
                {errors.username && (
                  <p className="text-destructive text-xs flex items-center space-x-1">
                    <X className="h-3 w-3" />
                    <span>{errors.username}</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  3-20 characters, letters, numbers, and underscore only
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email Address</span>
                  {validations.email && <Check className="h-3 w-3 text-green-500" />}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  className={cn(
                    "bg-input/30 border-border/50 focus:bg-input/50 smooth-transition h-12",
                    errors.email && "border-destructive focus:border-destructive",
                    validations.email && "border-green-500/50"
                  )}
                />
                {errors.email && (
                  <p className="text-destructive text-xs flex items-center space-x-1">
                    <X className="h-3 w-3" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Password</span>
                  {validations.password && <Check className="h-3 w-3 text-green-500" />}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a secure password"
                    className={cn(
                      "bg-input/30 border-border/50 focus:bg-input/50 smooth-transition pr-12 h-12",
                      errors.password && "border-destructive focus:border-destructive",
                      validations.password && "border-green-500/50"
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent smooth-scale"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-xs flex items-center space-x-1">
                    <X className="h-3 w-3" />
                    <span>{errors.password}</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  At least 6 characters long
                </p>
              </div>
            </div>

            <Button 
              onClick={handleSignup}
              disabled={!isFormValid || isLoading}
              className={cn(
                "w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium smooth-transition button-glow smooth-scale",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>

            <div className="text-center text-sm pt-4 border-t border-border/30">
              <span className="text-muted-foreground">Already have an account? </span>
              <Button 
                variant="link" 
                className="text-primary hover:text-primary/80 smooth-transition h-auto p-0 font-medium smooth-scale"
                onClick={() => navigate('/login')}
              >
                Sign in here
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Note */}
        <div className="text-center text-xs text-muted-foreground space-y-1 fade-in">
          <p>🔒 Your data is encrypted and secure</p>
          <p>By creating an account, you agree to our Terms & Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
