"use client";

import { useState } from "react";
import { Category } from "@/types/database";
import { createCategory, updateCategory, deleteCategory } from "@/actions/categories";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Check, Loader2, Palette, ShoppingBag } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface CategoriesManagerProps {
  initialCategories: Category[];
}

export default function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editName, setEditName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const projectCategories = categories.filter(c => c.type === 'project');
  const productCategories = categories.filter(c => c.type === 'product');

  async function handleAdd(type: 'project' | 'product') {
    if (!newName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.set('name', newName.trim());
    formData.set('type', type);

    const result = await createCategory(formData);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      setCategories([...categories, result.data]);
      setNewName("");
      if (type === 'project') setIsAddingProject(false);
      else setIsAddingProduct(false);
      toast.success("Category created");
    }
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.set('name', editName.trim());

    const result = await updateCategory(id, formData);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      setCategories(categories.map(c => c.id === id ? result.data! : c));
      setEditingId(null);
      setEditName("");
      toast.success("Category updated");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    setIsLoading(true);
    const result = await deleteCategory(id);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setCategories(categories.filter(c => c.id !== id));
      toast.success("Category deleted");
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  function cancelAdd(type: 'project' | 'product') {
    setNewName("");
    if (type === 'project') setIsAddingProject(false);
    else setIsAddingProduct(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Project Categories */}
      <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Palette className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-light text-white">Project Categories</h2>
              <p className="text-xs text-white/40">{projectCategories.length} categories</p>
            </div>
          </div>
          {!isAddingProject && (
            <Button 
              onClick={() => setIsAddingProject(true)} 
              className="!py-2 !px-3 text-sm"
            >
              <Plus size={16} />
              Add
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {/* Add new project category */}
          {isAddingProject && (
            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Category name..."
                className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-white/30"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd('project');
                  if (e.key === 'Escape') cancelAdd('project');
                }}
              />
              <button
                onClick={() => handleAdd('project')}
                disabled={isLoading}
                className="p-1.5 text-green-400 hover:bg-green-500/10 rounded transition-colors"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              </button>
              <button
                onClick={() => cancelAdd('project')}
                className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Existing project categories */}
          {projectCategories.map((category) => (
            <div
              key={category.id}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border transition-all",
                editingId === category.id 
                  ? "bg-white/5 border-white/20" 
                  : "bg-white/[0.02] border-white/5 hover:border-white/10"
              )}
            >
              {editingId === category.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-white text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdate(category.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <button
                    onClick={() => handleUpdate(category.id)}
                    disabled={isLoading}
                    className="p-1.5 text-green-400 hover:bg-green-500/10 rounded transition-colors"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-white/80">{category.name}</span>
                  <span className="text-xs text-white/30 font-mono">{category.slug}</span>
                  <button
                    onClick={() => startEdit(category)}
                    className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}

          {projectCategories.length === 0 && !isAddingProject && (
            <p className="text-sm text-white/40 text-center py-4">No project categories yet</p>
          )}
        </div>
      </div>

      {/* Product Categories */}
      <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-light text-white">Product Categories</h2>
              <p className="text-xs text-white/40">{productCategories.length} categories</p>
            </div>
          </div>
          {!isAddingProduct && (
            <Button 
              onClick={() => setIsAddingProduct(true)} 
              className="!py-2 !px-3 text-sm"
            >
              <Plus size={16} />
              Add
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {/* Add new product category */}
          {isAddingProduct && (
            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Category name..."
                className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-white/30"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd('product');
                  if (e.key === 'Escape') cancelAdd('product');
                }}
              />
              <button
                onClick={() => handleAdd('product')}
                disabled={isLoading}
                className="p-1.5 text-green-400 hover:bg-green-500/10 rounded transition-colors"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              </button>
              <button
                onClick={() => cancelAdd('product')}
                className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Existing product categories */}
          {productCategories.map((category) => (
            <div
              key={category.id}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border transition-all",
                editingId === category.id 
                  ? "bg-white/5 border-white/20" 
                  : "bg-white/[0.02] border-white/5 hover:border-white/10"
              )}
            >
              {editingId === category.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-white text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdate(category.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <button
                    onClick={() => handleUpdate(category.id)}
                    disabled={isLoading}
                    className="p-1.5 text-green-400 hover:bg-green-500/10 rounded transition-colors"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-white/80">{category.name}</span>
                  <span className="text-xs text-white/30 font-mono">{category.slug}</span>
                  <button
                    onClick={() => startEdit(category)}
                    className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}

          {productCategories.length === 0 && !isAddingProduct && (
            <p className="text-sm text-white/40 text-center py-4">No product categories yet</p>
          )}
        </div>
      </div>
    </div>
  );
}



