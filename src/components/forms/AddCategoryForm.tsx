import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Name must be less than 50 characters"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface AddCategoryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
}

export const AddCategoryForm = ({ onSuccess, onCancel, initialData }: AddCategoryFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { createCategory, updateCategory } = useCategories();
  const isEdit = !!initialData;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      icon: initialData?.icon || "📂",
      color: initialData?.color || "#3B82F6",
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsLoading(true);
      
      if (isEdit) {
        await updateCategory(initialData.id, {
          name: data.name,
          icon: data.icon,
          color: data.color,
        });
        toast.success("Category updated successfully");
      } else {
        await createCategory({
          name: data.name,
          icon: data.icon,
          color: data.color,
        });
        toast.success("Category created successfully");
      }

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} category:`, error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} category`);
    } finally {
      setIsLoading(false);
    }
  };

  // Common category icons
  const iconOptions = [
    "🍽️", "🚗", "🛒", "🎬", "⚡", "🏥", "💰", "🏦", "🎯", "📚",
    "💊", "🎵", "👕", "🏠", "✈️", "☕", "🎮", "📱", "💻", "🏋️"
  ];

  // Common colors
  const colorOptions = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", 
    "#06B6D4", "#22C55E", "#F97316", "#EC4899", "#6366F1"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Category' : 'Create New Category'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter category name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter emoji or icon"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {iconOptions.map((icon) => (
                      <Button
                        key={icon}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => form.setValue("icon", icon)}
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input
                      type="color"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <Button
                        key={color}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0"
                        style={{ backgroundColor: color }}
                        onClick={() => form.setValue("color", color)}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Category" : "Create Category")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};