import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Target, PieChart, Shield, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 pb-24">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <TrendingUp className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">WealthTracker</h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Take control of your financial future with intelligent tracking, budgeting, and goal-setting tools
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/auth?tab=signup">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/auth?tab=signin">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
            <CardHeader>
              <DollarSign className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Smart Budgeting</CardTitle>
              <CardDescription>
                Create and manage budgets that adapt to your spending patterns and help you save more
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
            <CardHeader>
              <Target className="h-12 w-12 text-secondary mb-4" />
              <CardTitle>Goal Tracking</CardTitle>
              <CardDescription>
                Set financial goals and track your progress with visual indicators and milestone celebrations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
            <CardHeader>
              <PieChart className="h-12 w-12 text-accent mb-4" />
              <CardTitle>Expense Analytics</CardTitle>
              <CardDescription>
                Understand your spending habits with detailed analytics and personalized insights
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your financial data is encrypted and secure with bank-level security protocols
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
            <CardHeader>
              <Smartphone className="h-12 w-12 text-secondary mb-4" />
              <CardTitle>Mobile Friendly</CardTitle>
              <CardDescription>
                Access your finances anywhere with our responsive design that works on all devices
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-accent mb-4" />
              <CardTitle>Growth Insights</CardTitle>
              <CardDescription>
                Get personalized recommendations to improve your financial health and build wealth
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto border-0 shadow-xl bg-primary/5 backdrop-blur">
            <CardContent className="pt-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Finances?</h2>
              <p className="text-muted-foreground mb-6 text-lg">
                Join thousands of users who have taken control of their financial future with WealthTracker
              </p>
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link to="/auth?tab=signup">Start Your Journey</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Welcome;