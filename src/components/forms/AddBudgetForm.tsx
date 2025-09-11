import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";

const budgetSchema = z.object({
  category_id: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number"
  }),
  period_start: z.string().min(1, "Start date is required"),
  period_end: z.string().min(1, "End date is required"),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface AddBudgetFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddBudgetForm = ({ onSuccess, onCancel }: AddBudgetFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { createBudget } = useBudgets();
  const { categories } = useCategories();

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category_id: "",
      amount: "",
      period_start: "",
      period_end: "",
    },
  });

  const onSubmit = async (data: BudgetFormData) => {
    try {
      setIsLoading(true);
      
      // Validate end date is after start date
      if (new Date(data.period_end) <= new Date(data.period_start)) {
        toast.error("End date must be after start date");
        return;
      }

      await createBudget({
        category_id: data.category_id,
        amount: Number(data.amount),
        period_start: data.period_start,
        period_end: data.period_end,
      });

      toast.success("Budget created successfully");
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating budget:", error);
      toast.error("Failed to create budget");
    } finally {
      setIsLoading(false);
    }
  };

  // Get current month's default dates
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter budget amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="period_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        defaultValue={currentMonthStart}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="period_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        defaultValue={currentMonthEnd}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 justify-end">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Budget"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};