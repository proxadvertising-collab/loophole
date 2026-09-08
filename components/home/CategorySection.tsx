"use client";
import { Home, Landmark, Layers, DollarSign, RefreshCw, AlertTriangle, Banknote, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

const categories = [
  { name: "Subto", icon: Home },
  { name: "Seller Finance", icon: Landmark },
  { name: "Wrap", icon: Layers },
  { name: "Cash", icon: DollarSign },
  { name: "Novation", icon: RefreshCw },
  { name: "Wholesale", icon: Banknote },
  { name: "Foreclosure", icon: AlertTriangle },
  { name: "Other", icon: ShoppingBag },
];

const CategorySection = () => {
  const router = useRouter();

  const handleCategoryClick = (categoryName: string) => {
    const encoded = encodeURIComponent(categoryName);
    router.push(`/browse${encoded ? `?category=${encoded}` : ""}`);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6 pt-10 md:px-6">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Browse Categories</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => handleCategoryClick(category.name)}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-4 transition hover:border-black/40 hover:bg-zinc-50"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-black text-white rounded-full mb-3">
              <category.icon className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-700">{category.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
