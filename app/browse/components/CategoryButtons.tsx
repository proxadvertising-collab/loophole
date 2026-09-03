import React from 'react';

interface Category {
  name: string;
  icon: React.ElementType;
}

interface CategoryButtonsProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryClick: (name: string) => void;
}

const CategoryButtons: React.FC<CategoryButtonsProps> = ({ categories, selectedCategory, onCategoryClick }) => (
  <div className="flex flex-wrap gap-2 max-w-7xl justify-center">
    {categories.map(({ name, icon: Icon }) => (
      <button
        key={name}
        onClick={() => onCategoryClick(name)}
        className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full border transition-all duration-200 ease-in-out cursor-pointer ${
          selectedCategory === name || (!selectedCategory && name === "All")
            ? 'bg-black text-white font-semibold border-black shadow-sm'
            : 'bg-white text-zinc-700 font-medium hover:bg-zinc-50 hover:border-zinc-300 border-zinc-200'
        }`}
      >
        <div className={`w-4 h-4 flex items-center justify-center ${
          selectedCategory === name || (!selectedCategory && name === "All") ? 'text-white' : 'text-zinc-500'
        }`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="whitespace-nowrap">{name}</span>
      </button>
    ))}
  </div>
);

export default CategoryButtons; 