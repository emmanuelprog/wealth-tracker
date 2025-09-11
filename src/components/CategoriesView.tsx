import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Folder,
  Settings 
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { AddCategoryForm } from "@/components/forms/AddCategoryForm";
import { toast } from "sonner";

export const CategoriesView = () => {
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  
  const { categories, loading, error, deleteCategory } = useCategories();

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (window.confirm(`Are you sure you want to delete the "${categoryName}" category? This action cannot be undone.`)) {
      try {
        await deleteCategory(categoryId);
        toast.success("Category deleted successfully");
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("Failed to delete category");
      }
    }
  };

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setShowEditCategory(true);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Categories</h1>
            <p className="text-muted">Organize your transactions</p>
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-muted">Organize your transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Manage
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setShowAddCategory(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Folder className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No categories yet</h3>
            <p className="text-muted mb-6">Categories help organize your transactions and budgets</p>
            <Button onClick={() => setShowAddCategory(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{category.name}</h3>
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                        style={{ backgroundColor: `${category.color}10`, color: category.color }}
                      >
                        Category
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/5"
                    onClick={() => handleDeleteCategory(category.id, category.name)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Category Dialog */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent className="max-w-2xl">
          <AddCategoryForm 
            onSuccess={() => setShowAddCategory(false)} 
            onCancel={() => setShowAddCategory(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={showEditCategory} onOpenChange={setShowEditCategory}>
        <DialogContent className="max-w-2xl">
          {selectedCategory && (
            <AddCategoryForm 
              initialData={selectedCategory}
              onSuccess={() => setShowEditCategory(false)} 
              onCancel={() => setShowEditCategory(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};