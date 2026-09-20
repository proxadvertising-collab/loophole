"use client";
import React, { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, Variants } from "framer-motion";
import {
  Tag,
  DollarSign,
  MapPin,
  FileText,
  Save,
  Send,
} from "lucide-react";
import { useAuthGuard } from '../lib/hooks/useAuthGuard';
import { useRouter } from 'next/navigation';
import ImageUploader from "./components/ImageUpload";
import dynamic from "next/dynamic";
import { ListingService } from '../lib/database/ListingService';
import { UserService } from '../lib/database/UserService';
import { dbLogger } from '../lib/database/utils';
import NotLoggedIn from '../../components/globals/NotLoggedIn';
import ListingCard from "../browse/components/ListingCard";
import DealTermsFields from "./components/DealTermsFields";
import DealStrip from "../components/deals/DealStrip";
import {
  MIN_TICKET,
  securityLabel,
  structureToCategory,
  type AssetClass,
  type DealStructure,
  type DealTerms,
  type PaymentFreq,
  type TitleStatus,
} from "../props/dealTerms";


const MapPicker = dynamic(() => import("../listing/components/MapPicker"), { ssr: false });

const Create = () => {
  const enableEntryAnimation = process.env.NODE_ENV === "production";
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, loading: authLoading, isProtected } = useAuthGuard();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0);
  const [assetClass, setAssetClass] = useState<AssetClass | "">("");
  const [structure, setStructure] = useState<DealStructure | "">("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [amountFinanced, setAmountFinanced] = useState("");
  const [rate, setRate] = useState("");
  const [termMonths, setTermMonths] = useState("");
  const [amortMonths, setAmortMonths] = useState("");
  const [payment, setPayment] = useState("");
  const [paymentFreq, setPaymentFreq] = useState<PaymentFreq>("monthly");
  const [balloon, setBalloon] = useState("");
  const [existingLienBalance, setExistingLienBalance] = useState("");
  const [existingPayment, setExistingPayment] = useState("");
  const [lienholder, setLienholder] = useState("");
  const [titleStatus, setTitleStatus] = useState<TitleStatus | "">("");
  const [arv, setArv] = useState("");
  const [repairs, setRepairs] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [identity, setIdentity] = useState<Record<string, string>>({});
  const [sellerSituation, setSellerSituation] = useState("");
  const [isAttested, setIsAttested] = useState(false);
  const [acceptsCrypto, setAcceptsCrypto] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [location, setLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [showCustomLocationInput, setShowCustomLocationInput] = useState(false);
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  // Legacy DB field retained for schema compatibility; not shown in the deal-focused UI.
  const [condition] = useState("Good");
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setImages((prev) => [...prev, ...fileArray].slice(0, 5));
    }
  };

  const handleAddPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!images.length) {
      setPreviewImage(null);
      return;
    }

    const file = images[0];
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.readAsDataURL(file);

    return () => {
      reader.abort();
    };
  }, [images]);

  const parseTags = (value: string) =>
    value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

  const parseOptionalNumber = (value: string) => {
    if (!value.trim()) return undefined;
    const num = Number(String(value).replace(/[^0-9.]/g, ""));
    return Number.isFinite(num) ? num : undefined;
  };

  const buildTerms = (): DealTerms | undefined => {
    if (!assetClass || !structure) return undefined;
    const identityClean = Object.fromEntries(
      Object.entries(identity).filter(([, value]) => String(value).trim() !== "")
    );
    if (assetClass === "real_estate") {
      if (arv) identityClean.arv = arv;
      if (repairs) identityClean.repairs = repairs;
      if (monthlyRent) identityClean.monthlyRent = monthlyRent;
    }
    const balloonNum = parseOptionalNumber(balloon);
    const balloonValue: number | boolean | undefined = balloonNum !== undefined
      ? balloonNum
      : /^(yes|true)$/i.test(balloon.trim())
        ? true
        : undefined;
    return {
      v: 1,
      asset_class: assetClass,
      structure,
      purchase_price: parseOptionalNumber(purchasePrice),
      down_payment: parseOptionalNumber(downPayment),
      amount_financed: parseOptionalNumber(amountFinanced),
      rate: parseOptionalNumber(rate),
      term_months: parseOptionalNumber(termMonths),
      amort_months: parseOptionalNumber(amortMonths),
      payment: parseOptionalNumber(payment),
      payment_freq: paymentFreq,
      balloon: balloonValue,
      existing_lien_balance: parseOptionalNumber(existingLienBalance),
      existing_payment: parseOptionalNumber(existingPayment),
      lienholder: lienholder.trim() || undefined,
      security: securityLabel(assetClass) || undefined,
      title_status: titleStatus || undefined,
      accepts_crypto: acceptsCrypto || undefined,
      identity: Object.keys(identityClean).length ? identityClean : undefined,
    };
  };

  const handleAssetClass = (value: AssetClass | "") => {
    setAssetClass(value);
    setStructure("");
    setCategory("");
    setIdentity({});
  };

  const handleStructure = (value: DealStructure | "") => {
    setStructure(value);
    setCategory(value ? structureToCategory(value) : "");
  };

  const handleTermField = (field: string, value: string) => {
    const setters: Record<string, (v: string) => void> = {
      purchasePrice: setPurchasePrice,
      downPayment: setDownPayment,
      amountFinanced: setAmountFinanced,
      rate: setRate,
      termMonths: setTermMonths,
      amortMonths: setAmortMonths,
      payment: setPayment,
      paymentFreq: (v) => setPaymentFreq(v as PaymentFreq),
      balloon: setBalloon,
      existingLienBalance: setExistingLienBalance,
      existingPayment: setExistingPayment,
      lienholder: setLienholder,
      titleStatus: (v) => setTitleStatus(v as TitleStatus | ""),
      arv: setArv,
      repairs: setRepairs,
      monthlyRent: setMonthlyRent,
    };
    setters[field]?.(value);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setLocation(selectedValue);
    
    if (selectedValue === "Add custom location") {
      setShowCustomLocationInput(true);
      setLocation(""); // Reset location since we'll use custom location
    } else {
      setShowCustomLocationInput(false);
      setCustomLocation(""); // Clear custom location when predefined is selected
    }
  };

  const handleSaveDraft = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to save a draft.");
      return;
    }

    try {
      setSaving(true);
      
      // Upload images using the service
      let uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        uploadedImageUrls = await ListingService.uploadImages(images, user.id);
      }

      const draftLocation = showCustomLocationInput ? customLocation : location;
      
      const terms = buildTerms();
      const detailedDescription = JSON.stringify({
        sellerSituation: sellerSituation || "",
        metrics: {
          remainingBalance: existingLienBalance,
          interestRate: rate,
          piti: existingPayment,
          arv,
          repairs,
          monthlyRent
        },
        terms: terms || undefined,
      });

      const listing = await ListingService.createListing({
        title: title || "Untitled Draft",
        price: price || 0,
        location: draftLocation || "",
        category: category || structureToCategory(structure) || "Other",
        condition: condition || "",
        description: detailedDescription,
        terms,
        tags: parseTags(tagsInput),
        images: uploadedImageUrls,
        userId: user.id,
        isDraft: true,
        locationLat: locationLat || undefined,
        locationLng: locationLng || undefined,
      });

      if (listing) {
        toast.success("Draft saved successfully!");
        router.push('/my-listings');
      } else {
        throw new Error('Failed to create listing');
      }
    } catch (error) {
      dbLogger.error('Error saving draft', error);
      toast.error("Failed to save draft. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to create a listing.");
      return;
    }

    const finalLocation = showCustomLocationInput ? customLocation : location;
    
    if (!title || !assetClass || !structure || !sellerSituation || !finalLocation || !condition) {
      toast.error("Please fill in deal title, asset class, structure, market, and seller situation.");
      return;
    }

    if (price < MIN_TICKET) {
      toast.error(`High-ticket only. Asking / entry fee must be at least $${MIN_TICKET.toLocaleString()}.`);
      return;
    }

    const purchaseNum = Number(String(purchasePrice).replace(/[^0-9.]/g, ""));
    if (purchasePrice && Number.isFinite(purchaseNum) && purchaseNum < MIN_TICKET) {
      toast.error(`Purchase price must be at least $${MIN_TICKET.toLocaleString()}.`);
      return;
    }

    if (showCustomLocationInput && customLocation.trim().length === 0) {
      toast.error("Please enter a custom location.");
      return;
    }

    if (!isAttested) {
      toast.error("Please attest that you have the right to market this deal.");
      return;
    }

    try {
      setSaving(true);
      
      // Upload images using the service
      const uploadedImageUrls = await ListingService.uploadImages(images, user.id);

      const terms = buildTerms();
      const detailedDescription = JSON.stringify({
        sellerSituation,
        metrics: {
          remainingBalance: existingLienBalance,
          interestRate: rate,
          piti: existingPayment,
          arv,
          repairs,
          monthlyRent
        },
        terms: terms || undefined,
      });

      const listing = await ListingService.createListing({
        title,
        price,
        location: finalLocation,
        category: category || structureToCategory(structure),
        condition,
        description: detailedDescription,
        terms,
        tags: parseTags(tagsInput),
        images: uploadedImageUrls,
        userId: user.id,
        isDraft: false,
        locationLat: locationLat || undefined,
        locationLng: locationLng || undefined,
      });

      if (listing) {
        toast.success("🎉 Listing created successfully! It's now pending admin approval and will be visible once approved.");
        router.push('/my-listings');
      } else {
        throw new Error('Failed to create listing');
      }
    } catch (error) {
      dbLogger.error('Error creating listing', error);
      toast.error("Failed to create listing. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <motion.div 
        className="flex items-center justify-center min-h-[60vh]"
        variants={containerVariants}
        initial={enableEntryAnimation ? "hidden" : false}
        animate="visible"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </motion.div>
    );
  }

  // Show not logged in component if user is not authenticated
  if (isProtected && !user) {
    return (
      <motion.div 
        className="bg-gray-50 min-h-screen"
        variants={containerVariants}
        initial={enableEntryAnimation ? "hidden" : false}
        animate="visible"
      >
        <NotLoggedIn 
          message="Please log in to create a listing"
          className="py-10"
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-gray-50 flex-1"
      variants={containerVariants}
      initial={enableEntryAnimation ? "hidden" : false}
      animate="visible"
    >
      <div className="max-w-4xl mx-auto py-10 px-4">
        <motion.div variants={headerVariants}>
          <h1 className="text-3xl font-black mb-2 tracking-tighter">List a Deal</h1>
          <p className="text-gray-600 mb-2">
            Post terms, not a street address. Loophole connects buyers and sellers — we don&apos;t broker, title, or fund deals.
          </p>
          <div className="bg-zinc-100 border border-zinc-200 rounded-2xl p-4 mb-6">
            <p className="text-sm text-zinc-800">
              <strong>Note:</strong> All deals require admin approval before becoming visible. You&apos;ll be notified once your deal is live.
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ImageUploader
            images={images}
            setImages={setImages}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            handleAddPhotoClick={handleAddPhotoClick}
            handleRemoveImage={handleRemoveImage}
          />
        </motion.div>

        {/* Listing Details Section */}
        <motion.div 
          className="border border-zinc-200 rounded-2xl p-6 bg-white/80 backdrop-blur shadow-[0_12px_30px_-20px_rgba(0,0,0,0.3)] mb-8"
          variants={itemVariants}
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-black" />
            Deal Details
          </h2>

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <MapPin size={14} />
              Deal title
            </label>
            <input
              type="text"
              placeholder="e.g. Subto 4/2 · Phoenix"
              className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <p className="text-xs text-zinc-500 mt-1">Headline only. Never include a street address — city or suburb in Market below.</p>
          </div>

          <div className="mb-6">
            <DealTermsFields
              assetClass={assetClass}
              structure={structure}
              purchasePrice={purchasePrice}
              downPayment={downPayment}
              amountFinanced={amountFinanced}
              rate={rate}
              termMonths={termMonths}
              amortMonths={amortMonths}
              payment={payment}
              paymentFreq={paymentFreq}
              balloon={balloon}
              existingLienBalance={existingLienBalance}
              existingPayment={existingPayment}
              lienholder={lienholder}
              titleStatus={titleStatus}
              arv={arv}
              repairs={repairs}
              monthlyRent={monthlyRent}
              identity={identity}
              onAssetClass={handleAssetClass}
              onStructure={handleStructure}
              onChange={handleTermField}
              onIdentity={(field, value) => setIdentity((prev) => ({ ...prev, [field]: value }))}
            />
            <div className="mt-4">
              <DealStrip
                input={{
                  asset_class: assetClass || "real_estate",
                  structure: structure || null,
                  purchase_price: parseOptionalNumber(purchasePrice) ?? null,
                  down_payment: parseOptionalNumber(downPayment) ?? null,
                  amount_financed: parseOptionalNumber(amountFinanced) ?? null,
                  rate: parseOptionalNumber(rate) ?? null,
                  term_months: parseOptionalNumber(termMonths) ?? null,
                  amort_months: parseOptionalNumber(amortMonths) ?? null,
                  payment: parseOptionalNumber(payment) ?? null,
                  payment_freq: paymentFreq,
                  balloon: parseOptionalNumber(balloon) ?? null,
                  existing_lien_balance: parseOptionalNumber(existingLienBalance) ?? null,
                  existing_payment: parseOptionalNumber(existingPayment) ?? null,
                }}
                identity={identity}
                monthlyRent={parseOptionalNumber(monthlyRent) ?? null}
              />
            </div>
          </div>

          <label className="flex items-start gap-3 mb-6 cursor-pointer select-none border border-zinc-200 rounded-xl px-3 py-3 hover:border-zinc-300">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-black"
              checked={acceptsCrypto}
              onChange={(e) => setAcceptsCrypto(e.target.checked)}
            />
            <span>
              <span className="block text-sm font-semibold text-zinc-900">Open to crypto</span>
              <span className="block text-xs text-zinc-500 mt-0.5">Buyer may pay in crypto or include it in the terms. No wallet connection — you settle directly with the buyer.</span>
            </span>
          </label>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 sm:w-1/3">
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <DollarSign size={14} />
                Asking Price / Entry Fee ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  min={MIN_TICKET}
                  step="1"
                  className="w-full border border-zinc-200 rounded-xl px-7 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
                  value={price === 0 ? "" : price}
                  placeholder="25000"
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (isNaN(val) || val < 0) {
                      setPrice(0);
                    } else {
                      setPrice(val);
                    }
                  }}
                  required
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">High-ticket only. ${MIN_TICKET.toLocaleString()} minimum.</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FileText size={14} />
              Seller Situation
            </label>
            <textarea
              className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm h-24 focus:ring-2 focus:ring-black outline-none"
              placeholder="Why is the seller selling? Any motivation or specific terms needed?"
              value={sellerSituation}
              onChange={(e) => setSellerSituation(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <MapPin size={14} />
              Market
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={showCustomLocationInput ? "Add custom location" : location}
              onChange={handleLocationChange}
              required
            >
              <option value="">Select a city or suburb</option>
              <option value="Phoenix, AZ">Phoenix, AZ</option>
              <option value="Atlanta, GA">Atlanta, GA</option>
              <option value="Tampa, FL">Tampa, FL</option>
              <option value="Charlotte, NC">Charlotte, NC</option>
              <option value="Indianapolis, IN">Indianapolis, IN</option>
              <option value="Columbus, OH">Columbus, OH</option>
              <option value="Nashville, TN">Nashville, TN</option>
              <option value="Add custom location">Add custom location</option>
            </select>
            {showCustomLocationInput && (
              <div className="mt-3">
                <label className="text-sm font-medium text-zinc-700 mb-1 block">
                  Enter custom location
                </label>
                <input
                  type="text"
                  placeholder="City or suburb only — no street address"
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value.slice(0, 100))}
                  maxLength={100}
                  required
                />
                <div className="text-xs text-zinc-500 mt-1">
                  {customLocation.length}/100 characters
                </div>
              </div>
            )}
            <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600">
              <input
                id="show-map-picker"
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300 text-black focus:ring-black"
                checked={showMapPicker}
                onChange={(e) => {
                  const next = e.target.checked;
                  setShowMapPicker(next);
                  if (!next) {
                    setLocationLat(null);
                    setLocationLng(null);
                  }
                }}
              />
              <label htmlFor="show-map-picker">
                Add a precise map pin (optional)
              </label>
            </div>
            {showMapPicker && (
              <div className="my-3 rounded-xl border border-gray-200 overflow-hidden">
                <MapPicker
                  value={locationLat && locationLng ? { lat: locationLat, lng: locationLng } : undefined}
                  onChange={({ lat, lng }) => {
                    setLocationLat(lat);
                    setLocationLng(lng);
                  }}
                  height="240px"
                />
                <div className="text-xs text-gray-500 px-3 py-2 bg-gray-50">
                  City / suburb pin only. Street addresses are never shown on Loophole.
                  {locationLat && locationLng && (
                    <span className="ml-2 text-green-600">Pin saved.</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Tag size={14} />
              Tags
            </label>
            <input
              type="text"
              className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
              placeholder="e.g. subto, Austin, high yield, seller finance"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
            <p className="text-xs text-zinc-500 mt-1">
              Separate tags with commas to improve searchability.
            </p>
          </div>

          <div className="mb-6 p-4 border border-zinc-200 rounded-2xl bg-zinc-50">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-zinc-300 text-black focus:ring-black"
                checked={isAttested}
                onChange={(e) => setIsAttested(e.target.checked)}
              />
              <span className="text-sm text-zinc-700">
                <strong>Attestation:</strong> I have the right to market this deal. Loophole only connects buyers and sellers — it does not broker, title, escrow, or fund transactions.
              </span>
            </label>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Deal Card Preview</h3>
            <div className="max-w-sm">
              <ListingCard
                title={title || "Subto 4/2 · Phoenix"}
                price={price || 0}
                location={(showCustomLocationInput ? customLocation : location) || "Phoenix, AZ"}
                category={category || "Subto"}
                timePosted={"Just now"}
                images={previewImage ? [previewImage] : []}
                user={{
                  name: user?.user_metadata?.name || user?.email?.split('@')[0] || "You",
                  user_id: user?.id || "preview",
                  image: user?.user_metadata?.avatar_url || undefined,
                }}
                condition={undefined}
                searchTerm={undefined}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button 
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 border border-zinc-200 rounded-full shadow-sm text-sm font-semibold bg-white hover:bg-zinc-50 text-zinc-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full shadow-sm text-sm font-semibold bg-black text-white hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              {saving ? 'Publishing...' : 'List Deal Free'}
            </button>
          </div>
        </motion.div>
        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </motion.div>
  );
};

export default Create;
