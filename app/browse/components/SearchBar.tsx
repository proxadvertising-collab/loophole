"use client";
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import {
  Search,
  Filter,
  Home,
  Landmark,
  Layers,
  DollarSign,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchInput from "./SearchInput";
import SortDropdown from "./SortDropdown";
import FilterModal from "./FilterModal";
import CategoryButtons from "./CategoryButtons";
import { fetchPopularSearches } from "../../lib/search/popularSearches";
import { fetchSearchSuggestions } from "../../lib/search/suggestionsClient";
import { ASSET_CLASSES, structuresForClass, type AssetClass } from "../../props/dealTerms";

const categories = [
  { name: "All", icon: Search },
  { name: "Subto", icon: Home },
  { name: "Seller Finance", icon: Landmark },
  { name: "Wrap", icon: Layers },
  { name: "Novation", icon: RefreshCw },
  { name: "Foreclosure", icon: AlertTriangle },
  { name: "Cash", icon: DollarSign },
];

interface SearchBarProps {
  setLoading?: (loading: boolean) => void;
}

const SearchBar = forwardRef((props: SearchBarProps, ref) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("category") || "";
  const queryClass = searchParams.get("class") || "";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "relevance";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const postedAfter = searchParams.get("postedAfter") || "";
  const postedBefore = searchParams.get("postedBefore") || "";
  const minDown = searchParams.get("minDown") || "";
  const maxDown = searchParams.get("maxDown") || "";
  const minPayment = searchParams.get("minPayment") || "";
  const maxPayment = searchParams.get("maxPayment") || "";
  const minRate = searchParams.get("minRate") || "";
  const maxRate = searchParams.get("maxRate") || "";
  const minTerm = searchParams.get("minTerm") || "";
  const maxTerm = searchParams.get("maxTerm") || "";
  const queryStructure = searchParams.get("structure") || "";
  const queryYear = searchParams.get("year") || "";
  const queryMake = searchParams.get("make") || "";
  const { setLoading } = props;

  const [searchValue, setSearchValue] = useState(search);
  const [sortValue, setSortValue] = useState(sort);
  const [showFilters, setShowFilters] = useState(false);
  const [minPriceValue, setMinPriceValue] = useState(minPrice);
  const [maxPriceValue, setMaxPriceValue] = useState(maxPrice);
  const [postedAfterValue, setPostedAfterValue] = useState(postedAfter);
  const [postedBeforeValue, setPostedBeforeValue] = useState(postedBefore);
  const [minDownValue, setMinDownValue] = useState(minDown);
  const [maxDownValue, setMaxDownValue] = useState(maxDown);
  const [minPaymentValue, setMinPaymentValue] = useState(minPayment);
  const [maxPaymentValue, setMaxPaymentValue] = useState(maxPayment);
  const [minRateValue, setMinRateValue] = useState(minRate);
  const [maxRateValue, setMaxRateValue] = useState(maxRate);
  const [minTermValue, setMinTermValue] = useState(minTerm);
  const [maxTermValue, setMaxTermValue] = useState(maxTerm);
  const [structureValue, setStructureValue] = useState(queryStructure);
  const [yearValue, setYearValue] = useState(queryYear);
  const [makeValue, setMakeValue] = useState(queryMake);
  const [suggestions, setSuggestions] = useState<Array<{ value: string; label: string; type?: string }>>([]);
  const [showCustomRange, setShowCustomRange] = useState(Boolean(postedAfter) || Boolean(postedBefore));
  const filterSnapshotRef = useRef<{
    minPriceValue: string;
    maxPriceValue: string;
    postedAfterValue: string;
    postedBeforeValue: string;
    showCustomRange: boolean;
  } | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);

  // Add default min/max for slider
  const minPriceLimit = 0;

  const recentKey = "utm_recent_searches";

  const loadRecentSearches = () => {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(recentKey);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  };

  const saveRecentSearch = (value: string) => {
    if (typeof window === "undefined") return;
    const trimmed = value.trim();
    if (!trimmed || trimmed.length < 2) return;
    const existing = loadRecentSearches();
    const updated = [trimmed, ...existing.filter((item) => item !== trimmed)].slice(0, 8);
    window.localStorage.setItem(recentKey, JSON.stringify(updated));
    setRecentSearches(updated);
  };

  const removeRecentSearch = (value: string) => {
    if (typeof window === "undefined") return;
    const existing = loadRecentSearches();
    const updated = existing.filter((item) => item !== value);
    window.localStorage.setItem(recentKey, JSON.stringify(updated));
    setRecentSearches(updated);
  };

  useEffect(() => {
    setRecentSearches(loadRecentSearches());
  }, []);

  useEffect(() => {
    const loadPopularSearches = async () => {
      const popular = await fetchPopularSearches(8);
      setPopularSearches(popular);
    };

    loadPopularSearches();
  }, []);

  useEffect(() => {
    const term = searchValue.trim().toLowerCase();
    if (!term) {
      const recent = recentSearches.map((value) => ({
        value,
        label: value,
        type: "Recent",
      }));
      const trending = popularSearches.map((value) => ({
        value,
        label: value,
        type: "Trending",
      }));
      setSuggestions([...recent, ...trending].slice(0, 8));
      return;
    }

    if (term.length < 2) {
      const recent = recentSearches
        .filter((value) => value.toLowerCase().includes(term))
        .map((value) => ({
          value,
          label: value,
          type: "Recent",
        }));
      const trending = popularSearches
        .filter((value) => value.toLowerCase().includes(term))
        .map((value) => ({
          value,
          label: value,
          type: "Trending",
        }));
      setSuggestions([...recent, ...trending].slice(0, 8));
      return;
    }

    const handle = window.setTimeout(async () => {
      try {
        const apiSuggestions = await fetchSearchSuggestions(term);
        const recent = recentSearches
          .filter((value) => value.toLowerCase().includes(term))
          .map((value) => ({
            value,
            label: value,
            type: "Recent",
          }));
        const trending = popularSearches
          .filter((value) => value.toLowerCase().includes(term))
          .map((value) => ({
            value,
            label: value,
            type: "Trending",
          }));

        const combined = [...apiSuggestions, ...recent, ...trending];
        const seen = new Set<string>();
        const deduped = combined.filter((item) => {
          const key = item.value.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setSuggestions(deduped.slice(0, 8));
      } catch (err) {
        console.error("Search suggestions error:", err);
      }
    }, 450);

    return () => window.clearTimeout(handle);
  }, [searchValue, recentSearches, popularSearches]);

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  useEffect(() => {
    setSortValue(sort);
  }, [sort]);

  const buildQueryParams = (values: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params;
  };

  const termParams = {
    minDown: minDownValue,
    maxDown: maxDownValue,
    minPayment: minPaymentValue,
    maxPayment: maxPaymentValue,
    minRate: minRateValue,
    maxRate: maxRateValue,
    minTerm: minTermValue,
    maxTerm: maxTermValue,
    structure: structureValue,
    year: yearValue,
    make: makeValue,
  };

  const structureOptions = queryClass && ASSET_CLASSES.some((item) => item.id === queryClass)
    ? structuresForClass(queryClass as AssetClass)
    : Array.from(
        new Map(
          ASSET_CLASSES.flatMap((item) => structuresForClass(item.id)).map((item) => [item.id, item])
        ).values()
      );

  const handleCategoryClick = (name: string) => {
    if (setLoading) setLoading(true);
    const newQuery = name === "All" || name === "All Categories" ? "" : name;
    const params = buildQueryParams({
      category: newQuery,
      class: queryClass,
      search,
      sort: sortValue,
      minPrice: minPriceValue,
      maxPrice: maxPriceValue,
      postedAfter: postedAfterValue,
      postedBefore: postedBeforeValue,
      ...termParams,
    });
    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (nextQuery === currentQuery) {
      if (setLoading) setLoading(false);
      return;
    }
    router.push(`/browse${nextQuery ? `?${nextQuery}` : ""}`);
  };

  const handleAssetClassClick = (id: string) => {
    if (setLoading) setLoading(true);
    setYearValue("");
    setMakeValue("");
    const params = buildQueryParams({
      category: query,
      class: id,
      search,
      sort: sortValue,
      minPrice: minPriceValue,
      maxPrice: maxPriceValue,
      postedAfter: postedAfterValue,
      postedBefore: postedBeforeValue,
      ...termParams,
      year: "",
      make: "",
    });
    router.push(`/browse${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const commitSearchValue = (value: string) => {
    const trimmed = value.trim();
    setSearchValue(trimmed);
    if (setLoading) setLoading(true);
    const params = buildQueryParams({
      category: query,
      class: queryClass,
      search: trimmed,
      sort: sortValue,
      minPrice: minPriceValue,
      maxPrice: maxPriceValue,
      postedAfter: postedAfterValue,
      postedBefore: postedBeforeValue,
      ...termParams,
    });
    router.push(`/browse${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    saveRecentSearch(searchValue);
    commitSearchValue(searchValue);
  };

  const handleSuggestionSelect = (value: string) => {
    setSearchValue(value);
    setSuggestions([]);
    saveRecentSearch(value);
    commitSearchValue(value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (setLoading) setLoading(true);
    setSortValue(e.target.value);
    const params = buildQueryParams({
      category: query,
      class: queryClass,
      search,
      sort: e.target.value,
      minPrice: minPriceValue,
      maxPrice: maxPriceValue,
      postedAfter: postedAfterValue,
      postedBefore: postedBeforeValue,
      ...termParams,
    });
    router.push(`/browse${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleApplyFilters = () => {
    if (setLoading) setLoading(true);
    const params = buildQueryParams({
      category: query,
      class: queryClass,
      search,
      sort: sortValue,
      minPrice: minPriceValue,
      maxPrice: maxPriceValue,
      postedAfter: postedAfterValue,
      postedBefore: postedBeforeValue,
      ...termParams,
    });
    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (nextQuery === currentQuery) {
      if (setLoading) setLoading(false);
      setShowFilters(false);
      return;
    }
    router.push(`/browse${nextQuery ? `?${nextQuery}` : ""}`);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setMinPriceValue("");
    setMaxPriceValue("");
    setPostedAfterValue("");
    setPostedBeforeValue("");
    setMinDownValue("");
    setMaxDownValue("");
    setMinPaymentValue("");
    setMaxPaymentValue("");
    setMinRateValue("");
    setMaxRateValue("");
    setMinTermValue("");
    setMaxTermValue("");
    setStructureValue("");
    setYearValue("");
    setMakeValue("");
    setShowCustomRange(false);
    setSortValue("relevance");
    setSuggestions([]);
    router.push(`/browse`);
    setShowFilters(false);
  };

  const handleCancelFilters = () => {
    if (filterSnapshotRef.current) {
      setMinPriceValue(filterSnapshotRef.current.minPriceValue);
      setMaxPriceValue(filterSnapshotRef.current.maxPriceValue);
      setPostedAfterValue(filterSnapshotRef.current.postedAfterValue);
      setPostedBeforeValue(filterSnapshotRef.current.postedBeforeValue);
      setShowCustomRange(filterSnapshotRef.current.showCustomRange);
    }
    setShowFilters(false);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setSuggestions([]);
    commitSearchValue("");
  };

  useImperativeHandle(ref, () => ({
    handleClearFilters,
  }));

  useEffect(() => {
    if (!showFilters) return;
    filterSnapshotRef.current = {
      minPriceValue,
      maxPriceValue,
      postedAfterValue,
      postedBeforeValue,
      showCustomRange,
    };
  }, [
    showFilters,
    minPriceValue,
    maxPriceValue,
    postedAfterValue,
    postedBeforeValue,
    showCustomRange,
  ]);

  return (
    <div className="w-full flex flex-col gap-4 px-4">
      {/* Search Row */}
      <div className="w-full flex justify-center">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-5xl">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <SearchInput
              value={searchValue}
              onChange={handleSearchChange}
              suggestions={suggestions}
              onSelectSuggestion={handleSuggestionSelect}
              onRemoveSuggestion={removeRecentSearch}
              onClear={handleClearSearch}
              onCommit={saveRecentSearch}
            />
          </form>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              className="flex items-center gap-2 border rounded-full px-4 py-2 bg-white shadow-sm border-zinc-200 hover:bg-zinc-50 transition w-full sm:w-auto justify-center cursor-pointer"
              onClick={() => setShowFilters((v) => !v)}
            >
              <Filter size={16} className="text-zinc-700" />
              <span className="text-sm text-zinc-700 font-semibold">Filters</span>
            </button>
            <SortDropdown value={sortValue} onChange={handleSortChange} />
          </div>
        </div>
      </div>

      {/* Filters Dropdown */}
      {showFilters && (
        <div className="w-full flex justify-center">
          <div className="max-w-5xl w-full">
              <FilterModal
                minPriceValue={minPriceValue}
                maxPriceValue={maxPriceValue}
                postedAfterValue={postedAfterValue}
                postedBeforeValue={postedBeforeValue}
                minPriceLimit={minPriceLimit}
                setMinPriceValue={setMinPriceValue}
                setMaxPriceValue={setMaxPriceValue}
                setPostedAfterValue={setPostedAfterValue}
                setPostedBeforeValue={setPostedBeforeValue}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
                onCancel={handleCancelFilters}
                showCustomRange={showCustomRange}
                setShowCustomRange={setShowCustomRange}
                minDownValue={minDownValue}
                maxDownValue={maxDownValue}
                minPaymentValue={minPaymentValue}
                maxPaymentValue={maxPaymentValue}
                minRateValue={minRateValue}
                maxRateValue={maxRateValue}
                minTermValue={minTermValue}
                maxTermValue={maxTermValue}
                structureValue={structureValue}
                structureOptions={structureOptions}
                setMinDownValue={setMinDownValue}
                setMaxDownValue={setMaxDownValue}
                setMinPaymentValue={setMinPaymentValue}
                setMaxPaymentValue={setMaxPaymentValue}
                setMinRateValue={setMinRateValue}
                setMaxRateValue={setMaxRateValue}
                setMinTermValue={setMinTermValue}
                setMaxTermValue={setMaxTermValue}
                setStructureValue={setStructureValue}
                assetClass={queryClass}
                yearValue={yearValue}
                makeValue={makeValue}
                setYearValue={setYearValue}
                setMakeValue={setMakeValue}
              />
          </div>
        </div>
      )}

      {/* Asset class */}
      <div className="w-full flex flex-wrap justify-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => handleAssetClassClick("")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
            !queryClass ? "bg-black text-white border-black" : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
          }`}
        >
          All assets
        </button>
        {ASSET_CLASSES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleAssetClassClick(item.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              queryClass === item.id ? "bg-black text-white border-black" : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {/* Structure */}
      <div className="w-full flex justify-center">
        <CategoryButtons
          categories={categories}
          selectedCategory={query}
          onCategoryClick={handleCategoryClick}
        />
      </div>
    </div>
  );
});

SearchBar.displayName = "SearchBar";
export default SearchBar;
