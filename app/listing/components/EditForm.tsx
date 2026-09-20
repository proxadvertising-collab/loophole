import React, { useState, useRef } from "react";
import { Tag, DollarSign, Text, MapPin, FileText, Save, X } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";
import dynamic from "next/dynamic";
import ListingCard from "../../browse/components/ListingCard";
import DealTermsFields from "../../create/components/DealTermsFields";
import {
  MIN_TICKET,
  METRIC_IDENTITY_KEYS,
  parseDealTerms,
  securityLabel,
  structureToCategory,
  type AssetClass,
  type DealStructure,
  type DealTerms,
  type PaymentFreq,
  type TitleStatus,
} from "../../props/dealTerms";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

const EditForm = ({
  setIsEditing,
  handleEditChange,
  handleEditSubmit,
  form,
  setForm,
  initialFormState,
  categoryOptions,
  conditionOptions,
  leaseOptions,
  mode = "modal",
}) => {
  void conditionOptions;
  void leaseOptions;
  const isPageMode = mode === "page";
  const [localForm, setLocalForm] = useState(form);
  const [images, setImages] = useState<(File | string)[]>(form.images || []);
  const [tagsInput, setTagsInput] = useState(
    Array.isArray(form.tags) ? form.tags.join(", ") : ""
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasLatLng = typeof localForm.location_lat === 'number' && typeof localForm.location_lng === 'number';

  const initialTerms = parseDealTerms({
    terms: form.terms,
    description: form.description,
    category: form.category,
  });
  const identityFromTerms = (terms: DealTerms | null): Record<string, string> => {
    if (!terms?.identity) return {};
    return Object.fromEntries(
      Object.entries(terms.identity)
        .filter(([key]) => !METRIC_IDENTITY_KEYS.has(key))
        .map(([key, value]) => [key, value == null ? "" : String(value)])
    );
  };
  const strNum = (value: number | undefined) =>
    value === undefined || value === null ? "" : String(value);
  const balloonToInput = (value: DealTerms["balloon"]) => {
    if (value === true) return "yes";
    if (typeof value === "number") return String(value);
    return "";
  };

  const [assetClass, setAssetClass] = useState<AssetClass | "">(initialTerms?.asset_class || "");
  const [structure, setStructure] = useState<DealStructure | "">(initialTerms?.structure || "");
  const [purchasePrice, setPurchasePrice] = useState(strNum(initialTerms?.purchase_price));
  const [downPayment, setDownPayment] = useState(strNum(initialTerms?.down_payment));
  const [amountFinanced, setAmountFinanced] = useState(strNum(initialTerms?.amount_financed));
  const [rate, setRate] = useState(strNum(initialTerms?.rate));
  const [termMonths, setTermMonths] = useState(strNum(initialTerms?.term_months));
  const [amortMonths, setAmortMonths] = useState(strNum(initialTerms?.amort_months));
  const [payment, setPayment] = useState(strNum(initialTerms?.payment));
  const [paymentFreq, setPaymentFreq] = useState<PaymentFreq>(initialTerms?.payment_freq || "monthly");
  const [balloon, setBalloon] = useState(balloonToInput(initialTerms?.balloon));
  const [existingLienBalance, setExistingLienBalance] = useState(strNum(initialTerms?.existing_lien_balance));
  const [existingPayment, setExistingPayment] = useState(strNum(initialTerms?.existing_payment));
  const [lienholder, setLienholder] = useState(initialTerms?.lienholder || "");
  const [titleStatus, setTitleStatus] = useState<TitleStatus | "">(initialTerms?.title_status || "");
  const [acceptsCrypto, setAcceptsCrypto] = useState(Boolean(initialTerms?.accepts_crypto));
  const [arv, setArv] = useState(
    initialTerms?.identity?.arv != null ? String(initialTerms.identity.arv) : ""
  );
  const [repairs, setRepairs] = useState(
    initialTerms?.identity?.repairs != null ? String(initialTerms.identity.repairs) : ""
  );
  const [monthlyRent, setMonthlyRent] = useState(
    initialTerms?.identity?.monthlyRent != null ? String(initialTerms.identity.monthlyRent) : ""
  );
  const [identity, setIdentity] = useState<Record<string, string>>(identityFromTerms(initialTerms));
  
  // Location state management
  const [customLocation, setCustomLocation] = useState("");
  const [showCustomLocationInput, setShowCustomLocationInput] = useState(false);
  
  // Initialize location state based on existing location
  React.useEffect(() => {
    const predefinedLocations = [
      "Phoenix, AZ", "Atlanta, GA", "Tampa, FL", "Charlotte, NC",
      "Indianapolis, IN", "Columbus, OH", "Nashville, TN"
    ];
    
    if (localForm.location && !predefinedLocations.includes(localForm.location)) {
      setShowCustomLocationInput(true);
      setCustomLocation(localForm.location);
    }
  }, [localForm.location]);

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
    setLocalForm((prev) => ({ ...prev, category: "" }));
    setIdentity({});
  };

  const handleStructure = (value: DealStructure | "") => {
    setStructure(value);
    setLocalForm((prev) => ({
      ...prev,
      category: value ? structureToCategory(value) : "",
    }));
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

  const mergeTermsIntoDescription = (description: string, terms: DealTerms | undefined) => {
    try {
      const parsed = description ? JSON.parse(description) : null;
      if (parsed && typeof parsed === "object") {
        return JSON.stringify({
          ...parsed,
          metrics: {
            ...(parsed.metrics || {}),
            remainingBalance: existingLienBalance,
            interestRate: rate,
            piti: existingPayment,
            arv,
            repairs,
            monthlyRent,
          },
          terms: terms || undefined,
        });
      }
    } catch {
      // keep free-text description
    }
    return description;
  };

  const validateDealTerms = () => {
    if (!assetClass || !structure) {
      toast.error("Please fill in asset class and structure.");
      return false;
    }
    if (Number(localForm.price) < MIN_TICKET) {
      toast.error(`High-ticket only. Asking / entry fee must be at least $${MIN_TICKET.toLocaleString()}.`);
      return false;
    }
    const purchaseNum = Number(String(purchasePrice).replace(/[^0-9.]/g, ""));
    if (purchasePrice && Number.isFinite(purchaseNum) && purchaseNum < MIN_TICKET) {
      toast.error(`Purchase price must be at least $${MIN_TICKET.toLocaleString()}.`);
      return false;
    }
    return true;
  };

  React.useEffect(() => {
    if (!images.length) {
      setPreviewImage(null);
      return;
    }

    const first = images[0];
    if (typeof first === 'string') {
      setPreviewImage(first);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.readAsDataURL(first);

    return () => {
      reader.abort();
    };
  }, [images]);

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

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    
    if (selectedValue === "Add custom location") {
      setShowCustomLocationInput(true);
      setLocalForm({ ...localForm, location: "" }); // Reset location since we'll use custom location
    } else {
      setShowCustomLocationInput(false);
      setCustomLocation(""); // Clear custom location when predefined is selected
      setLocalForm({ ...localForm, location: selectedValue });
    }
  };

  const validateFields = () => {
    const requiredFields = [
      'title', 'category', 'price', 'condition', 'location', 'description'
    ];
    for (const field of requiredFields) {
      if (!localForm[field] || (typeof localForm[field] === 'string' && localForm[field].trim() === '')) {
        return false;
      }
    }
    if (Number(localForm.price) < 0) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalLocation = showCustomLocationInput ? customLocation : localForm.location;
    
    if (showCustomLocationInput && customLocation.trim().length === 0) {
      toast.error("Please enter a custom location.");
      return;
    }

    if (!validateDealTerms()) {
      return;
    }

    const terms = buildTerms();
    const description = mergeTermsIntoDescription(localForm.description ?? "", terms);
    const category = localForm.category || (structure ? structureToCategory(structure) : localForm.category);
    
    const updatedForm = {
      ...localForm,
      location: finalLocation,
      tags: parseTags(tagsInput),
      description,
      category,
      terms,
    };
    setForm(updatedForm);
    
    // Preserve the draft status in the submission
    const dataToSubmit = { 
      ...updatedForm, 
      is_draft: typeof localForm.is_draft !== 'undefined' ? localForm.is_draft : form.is_draft,
      images,
      location_lat: localForm.location_lat,
      location_lng: localForm.location_lng,
      terms,
    };
    
    handleEditSubmit(dataToSubmit);
  };

  return (
    <div className={isPageMode ? "w-full" : "fixed inset-0 z-50 flex items-start justify-center bg-black/20 backdrop-blur-sm pt-[80px]"}>
      <div
        className={`w-full bg-white border border-black/10 p-0 relative ${
          isPageMode
            ? "max-w-4xl rounded-2xl shadow-sm"
            : "max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
        }`}
      >
        {!isPageMode && (
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (setForm && initialFormState) {
                setForm(initialFormState);
              }
              setIsEditing(false);
            }}
          >
            <X size={20} />
          </button>
        )}
        <div className={isPageMode ? "p-6 flex-1" : "overflow-y-auto p-6 pt-12 flex-1"}>
        <h2 className="text-2xl font-bold mb-4 text-black flex items-center gap-2">
          <FileText className="w-6 h-6" /> Edit Listing
        </h2>
        <div className="border rounded-md p-6 mb-8 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            Photos
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Add up to 5 photos to showcase your item. The first photo will be your listing&apos;s cover image.
          </p>
          <div className="flex items-center gap-4 mb-4">
            {images.map((img, index) => (
              <div
                key={index}
                className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center border relative overflow-hidden"
              >
                {typeof img === "string" ? (
                  <Image
                    src={img}
                    alt={`Uploaded ${index}`}
                    fill
                    className="object-cover rounded-md"
                    sizes="96px"
                  />
                ) : (
                  <Image
                    src={URL.createObjectURL(img)}
                    alt={`Uploaded ${index}`}
                    fill
                    className="object-cover rounded-md"
                    sizes="96px"
                  />
                )}
                <span
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-white text-xs rounded-full p-1 shadow cursor-pointer"
                >
                  <X size={14} />
                </span>
              </div>
            ))}
            {images.length < 5 && (
              <div
                onClick={handleAddPhotoClick}
                className="w-24 h-24 border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 text-xs gap-1"
              >
                <span>+</span>
                <span>Add Photo</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Tag size={14} /> Deal title
            </label>
            <input
              type="text"
              name="title"
              value={localForm.title}
              onChange={(e) => setLocalForm({ ...localForm, title: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Text size={14} /> Deal Type
              </label>
              <select
                name="category"
                value={localForm.category ?? ""}
                onChange={(e) => setLocalForm({ ...localForm, category: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select a deal type</option>
                {categoryOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="w-1/3">
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <DollarSign size={14} /> Asking Price / Entry Fee ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="w-full border rounded-md px-7 py-2 text-sm"
                  value={localForm.price === 0 ? "" : localForm.price}
                  placeholder="0"
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (isNaN(val) || val < 0) {
                      setLocalForm({ ...localForm, price: 0 });
                    } else {
                      setLocalForm({ ...localForm, price: val });
                    }
                  }}
                />
              </div>
              {localForm.price < 0 && (
                <p className="text-xs text-red-500 mt-1">Price cannot be negative.</p>
              )}
            </div>
            {/* Legacy condition field retained for schema; hidden from deal UI. */}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <MapPin size={14} /> Market
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={showCustomLocationInput ? "Add custom location" : (localForm.location || "")}
              onChange={handleLocationChange}
              required
            >
              <option value="">Select a location</option>
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Enter custom location
                </label>
                <input
                  type="text"
                  placeholder="City or suburb only — no street address"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value.slice(0, 100))}
                  maxLength={100}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {customLocation.length}/100 characters
                </div>
              </div>
            )}
            <div className="my-2">
              <MapPicker
                value={hasLatLng ? { lat: localForm.location_lat, lng: localForm.location_lng } : undefined}
                onChange={({ lat, lng }) => setLocalForm({ ...localForm, location_lat: lat, location_lng: lng })}
                height="200px"
              />
              <div className="text-xs text-gray-500 mt-1">
                Click the map to update the pin. Buyers see an approximate area for the deal.
                {hasLatLng && (
                  <span className="ml-2 text-green-600">Location selected!</span>
                )}
              </div>
            </div>
          </div>
          <div className="border rounded-md p-4 bg-zinc-50">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Deal Terms</h3>
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
            <p className="text-xs text-zinc-500 mt-3">
              High-ticket only. ${MIN_TICKET.toLocaleString()} minimum asking / entry fee.
            </p>
            <label className="flex items-start gap-2 mt-3 cursor-pointer select-none">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-black"
                checked={acceptsCrypto}
                onChange={(e) => setAcceptsCrypto(e.target.checked)}
              />
              <span className="text-xs text-zinc-600">
                <span className="font-semibold text-zinc-800">Open to crypto</span> — buyer may pay in crypto or include it in the terms.
              </span>
            </label>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Text size={14} /> Description
            </label>
            <textarea
              name="description"
              value={localForm.description ?? ""}
              onChange={(e) => setLocalForm({ ...localForm, description: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Tag size={14} /> Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="e.g. subto, high yield, seller finance"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate tags with commas to improve search.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Search Preview</h3>
            <div className="max-w-sm">
              <ListingCard
                title={localForm.title || "Untitled Listing"}
                price={localForm.price || 0}
                location={localForm.location || "Location"}
                category={localForm.category || "Category"}
                timePosted={"Just now"}
                images={previewImage ? [previewImage] : []}
                user={{
                  name: "You",
                  user_id: "preview",
                }}
                condition={localForm.condition || "Condition"}
                searchTerm={undefined}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full mt-2 px-6 py-2 rounded-lg bg-black text-white font-semibold shadow hover:bg-zinc-800 transition flex items-center justify-center gap-2"
          >
            <Save size={16} /> Save Changes
          </button>
          {typeof localForm.is_draft !== 'undefined' && localForm.is_draft && (
            <button
              type="button"
              className="w-full mt-2 px-6 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition flex items-center justify-center gap-2"
              onClick={() => {
                const finalLocation = showCustomLocationInput ? customLocation : localForm.location;
                
                if (showCustomLocationInput && customLocation.trim().length === 0) {
                  toast.error("Please enter a custom location.");
                  return;
                }
                
                if (!validateFields() || !finalLocation) {
                  toast.error('Please fill in all required fields before publishing.');
                  return;
                }

                if (!validateDealTerms()) {
                  return;
                }

                const terms = buildTerms();
                const description = mergeTermsIntoDescription(localForm.description ?? "", terms);
                const category = localForm.category || (structure ? structureToCategory(structure) : localForm.category);
                const updatedFormForPublish = {
                  ...localForm,
                  location: finalLocation,
                  description,
                  category,
                  terms,
                };
                
                handleEditSubmit({
                  ...updatedFormForPublish,
                  is_draft: false,
                  images,
                  tags: parseTags(tagsInput),
                  terms,
                });
              }}
            >
              <Save size={16} /> Publish Listing
            </button>
          )}
        </form>
        </div>
      </div>
    </div>
  );
};

export default EditForm;
