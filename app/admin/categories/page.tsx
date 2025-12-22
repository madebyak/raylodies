import { getCategories } from "@/actions/categories";
import CategoriesManager from "@/components/admin/categories/CategoriesManager";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-white">Categories</h1>
        <p className="text-sm text-white/40 mt-1">
          Manage categories for projects and products
        </p>
      </div>

      <CategoriesManager initialCategories={categories} />
    </div>
  );
}

