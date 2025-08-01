import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, ArrowRight, Shield, Sun, Moon, AtSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { authService } from '@/services/auth';

export function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    identifier: '', // username or email
    password: ''
  });

  useEffect(() => {
    // Check if user is already logged in
    if (authService.isAuthenticated()) {
      navigate('/chat');
    }
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      await authService.login({
        identifier: formData.identifier,
        password: formData.password
      });

      navigate('/chat');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.identifier.trim() !== '' && formData.password.length >= 6;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Theme Toggle */}
      <Button
        onClick={toggleTheme}
        className={cn(
          "fixed top-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
          "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary",
          "border-2 border-background/50 backdrop-blur-sm",
          theme === 'dark'
            ? "hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]"
            : "hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]"
        )}
        size="sm"
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5 text-primary-foreground transition-transform hover:rotate-12" />
        ) : (
          <Moon className="h-5 w-5 text-primary-foreground transition-transform hover:rotate-12" />
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
            <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-3xl flex items-center justify-center shadow-xl professional-button">
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
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-base">
              Sign in to continue your conversations
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Username or Email */}
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-medium flex items-center space-x-2">
                  <AtSign className="h-4 w-4" />
                  <span>Username or Email</span>
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  value={formData.identifier}
                  onChange={(e) => handleInputChange('identifier', e.target.value)}
                  placeholder="Enter your username or email"
                  className="bg-input/30 border-border/50 focus:bg-input/50 smooth-transition h-12 professional-button"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Password</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    className="bg-input/30 border-border/50 focus:bg-input/50 smooth-transition pr-12 h-12 professional-button"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent professional-button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={!isFormValid() || isLoading}
              className={cn(
                "w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium smooth-transition button-glow professional-button",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 border-border/50 hover:bg-accent/50 smooth-transition button-glow professional-button"
              disabled={isLoading}
            >
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </div>
            </Button>

            <div className="text-center text-sm pt-4 border-t border-border/30">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Button 
                variant="link" 
                className="text-primary hover:text-primary/80 smooth-transition h-auto p-0 font-medium"
                onClick={() => navigate('/signup')}
              >
                Create one now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Note */}
        <div className="text-center text-xs text-muted-foreground space-y-1 fade-in">
          <p>🔒 Your data is encrypted and secure</p>
          <p>By continuing, you agree to our Terms & Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
