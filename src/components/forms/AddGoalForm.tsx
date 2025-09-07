import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { goalFormSchema, sanitizeString, type GoalFormData } from "@/lib/validation";
import { CalendarIcon, Target, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { z } from "zod";

interface AddGoalFormProps {
  onSubmit: (goal: any) => void;
  onCancel: () => void;
}

export const AddGoalForm = ({ onSubmit, onCancel }: AddGoalFormProps) => {
  const [targetDate, setTargetDate] = useState<Date>();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "0",
    category: "",
    description: ""
  });

  const goalCategories = [
    "Emergency Fund",
    "Vacation",
    "New Car",
    "Home Down Payment",
    "Education",
    "Retirement",
    "Debt Payoff",
    "Investment",
    "Other"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Prepare and validate form data
      const goalData: GoalFormData = {
        title: sanitizeString(formData.title),
        target_amount: parseFloat(formData.targetAmount) || 0,
        current_amount: parseFloat(formData.currentAmount) || 0,
        goal_type: "savings", // Default goal type
        description: formData.description ? sanitizeString(formData.description) : undefined,
        target_date: targetDate ? format(targetDate, 'yyyy-MM-dd') : undefined,
        priority: "medium"
      };

      // Validate with Zod schema
      const validatedData = goalFormSchema.parse(goalData);
      
      const goal = {
        title: validatedData.title,
        targetAmount: validatedData.target_amount,
        currentAmount: validatedData.current_amount,
        category: formData.category,
        description: validatedData.description,
        targetDate: validatedData.target_date,
        id: Date.now(),
        progress: (validatedData.current_amount / validatedData.target_amount) * 100
      };
      
      onSubmit(goal);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const firstError = err.errors[0];
        setError(firstError?.message || "Invalid input data");
      } else {
        setError(err.message || "Failed to create goal");
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Add Financial Goal
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Emergency Fund"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select goal category" />
              </SelectTrigger>
              <SelectContent>
                {goalCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount (₦)</Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                min="1"
                max="1000000000"
                value={formData.targetAmount}
                onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                placeholder="50000.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentAmount">Current Amount (₦)</Label>
              <Input
                id="currentAmount"
                type="number"
                step="0.01"
                min="0"
                max="1000000000"
                value={formData.currentAmount}
                onChange={(e) => handleInputChange('currentAmount', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !targetDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? format(targetDate, "PPP") : <span>Pick a target date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={setTargetDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="What is this goal for?"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Goal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};