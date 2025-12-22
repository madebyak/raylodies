import ProductForm from "@/components/admin/products/ProductForm";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function ProductEditorPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;
  
  // Fetch Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('type', 'product')
    .order('name');

  let product = null;

  if (id !== 'new') {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      notFound();
    }
    product = data;
  }

  return (
    <ProductForm 
      initialData={product || {}} 
      categories={categories || []} 
    />
  );
}

