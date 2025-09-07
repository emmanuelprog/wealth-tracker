import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auditLogger, AuditEventType } from "@/lib/audit";
import { authRateLimiter, validatePasswordStrength, validateEmail, sanitizeInput } from "@/lib/security";
import { authSignInSchema, authSignUpSchema } from "@/lib/validation";
import { Progress } from "@/components/ui/progress";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form states
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState("NGN");
  
  // Security states
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [], isValid: false });
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const currencies = [
    { value: "NGN", label: "Nigerian Naira (₦)", symbol: "₦" },
    { value: "USD", label: "US Dollar ($)", symbol: "$" },
    { value: "GBP", label: "British Pound (£)", symbol: "£" }
  ];

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkSession();
  }, [navigate]);

  // Password strength validation
  const handlePasswordChange = (password: string) => {
    setSignUpPassword(password);
    const strength = validatePasswordStrength(password);
    setPasswordStrength(strength);
    setShowPasswordRequirements(password.length > 0);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRateLimitError(null);

    const clientId = signInEmail || "anonymous";
    
    // Check rate limiting
    const canProceed = await authRateLimiter.checkLimit(clientId, "signin");
    if (!canProceed) {
      const blockedUntil = authRateLimiter.getBlockedUntil(clientId, "signin");
      setRateLimitError(
        `Too many failed attempts. Try again ${blockedUntil ? `after ${blockedUntil.toLocaleTimeString()}` : 'later'}.`
      );
      setLoading(false);
      return;
    }

    // Validate input
    const validation = authSignInSchema.safeParse({
      email: sanitizeInput(signInEmail),
      password: signInPassword
    });

    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: validation.data.email,
        password: validation.data.password,
      });

      if (error) {
        await auditLogger.logAuthEvent(AuditEventType.FAILED_LOGIN, validation.data.email, false);
        setError(error.message);
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        await auditLogger.logAuthEvent(AuditEventType.USER_SIGN_IN, validation.data.email, true);
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
        navigate("/");
      }
    } catch (err) {
      await auditLogger.logAuthEvent(AuditEventType.FAILED_LOGIN, validation.data.email, false);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRateLimitError(null);

    const clientId = signUpEmail || "anonymous";
    
    // Check rate limiting  
    const canProceed = await authRateLimiter.checkLimit(clientId, "signup");
    if (!canProceed) {
      const blockedUntil = authRateLimiter.getBlockedUntil(clientId, "signup");
      setRateLimitError(
        `Too many attempts. Try again ${blockedUntil ? `after ${blockedUntil.toLocaleTimeString()}` : 'later'}.`
      );
      setLoading(false);
      return;
    }

    // Validate all input
    const validation = authSignUpSchema.safeParse({
      email: sanitizeInput(signUpEmail),
      password: signUpPassword,
      confirmPassword: confirmPassword,
      firstName: sanitizeInput(firstName),
      lastName: sanitizeInput(lastName),
      preferredCurrency: preferredCurrency
    });

    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: validation.data.firstName,
            last_name: validation.data.lastName,
            preferred_currency: validation.data.preferredCurrency,
          }
        }
      });

      if (error) {
        await auditLogger.logAuthEvent(AuditEventType.USER_SIGN_UP, validation.data.email, false);
        setError(error.message);
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        await auditLogger.logAuthEvent(AuditEventType.USER_SIGN_UP, validation.data.email, true);
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (err) {
      await auditLogger.logAuthEvent(AuditEventType.USER_SIGN_UP, validation.data.email, false);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">WealthTracker</h1>
          </div>
          <p className="text-muted-foreground">Manage your finances with confidence</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Get Started</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to your account to continue managing your finances
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {rateLimitError && (
                    <Alert variant="destructive">
                      <Shield className="h-4 w-4" />
                      <AlertDescription>{rateLimitError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Start your financial journey with WealthTracker
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {rateLimitError && (
                    <Alert variant="destructive">
                      <Shield className="h-4 w-4" />
                      <AlertDescription>{rateLimitError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Preferred Currency</Label>
                    <Select value={preferredCurrency} onValueChange={setPreferredCurrency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signUpPassword}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      required
                    />
                    {showPasswordRequirements && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">Password strength:</div>
                          <Progress value={(passwordStrength.score / 4) * 100} className="flex-1 h-2" />
                          <div className="text-xs font-medium">
                            {passwordStrength.score === 0 && "Very Weak"}
                            {passwordStrength.score === 1 && "Weak"}
                            {passwordStrength.score === 2 && "Fair"}
                            {passwordStrength.score === 3 && "Good"}
                            {passwordStrength.score === 4 && "Strong"}
                          </div>
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            <div>Requirements:</div>
                            <ul className="list-disc list-inside space-y-1">
                              {passwordStrength.feedback.map((feedback, index) => (
                                <li key={index}>{feedback}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;