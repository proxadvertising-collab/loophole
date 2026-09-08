 "use client";
import React, { useState } from "react";
import Link from "next/link";
import { ListingCardProps } from "../../props/listing";
import { publicHeadline } from "../../props/dealTerms";
import DealTapeChips from "../../components/deals/DealTapeChips";
import { readDealInput } from "../../lib/deals/calc";
import Image from 'next/image';
import { Image as ImageIcon } from "lucide-react";
import { Suspense } from "react";

const highlight = (text: string, searchTerm?: string) => {
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark> : part
  );
};

const ListingCard: React.FC<ListingCardProps> = ({
  title,
  price,
  highestPrice,
  location,
  category,
  timePosted,
  images,
  user,
  condition,
  searchTerm,
  description,
  terms,
}) => {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const showAvatar = Boolean(user.image) && !avatarFailed;
  const headline = publicHeadline(title, location);
  const shouldShowOriginalPrice =
    typeof highestPrice === "number" &&
    Number.isFinite(highestPrice) &&
    highestPrice > price;

  return (
    <div className="group relative bg-white/95 backdrop-blur-sm border border-zinc-200 rounded-2xl overflow-hidden shadow-[0_12px_30px_-20px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.4)] hover:border-zinc-300 transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
        {images && images.length > 0 ? (
          <Image
            src={images[0]}
            alt={headline}
            width={400}
            height={300}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            priority={true}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 text-sm bg-zinc-50">
            <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center mb-2 text-zinc-500">
              <ImageIcon size={20} />
            </div>
            <div className="text-xs font-medium text-zinc-500">No photo provided</div>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-black text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
          {category || "Deal"}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-1">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-zinc-900 truncate group-hover:text-black transition-colors duration-200">
            {highlight(headline, searchTerm)}
          </h3>
          <div className="flex items-center gap-2">
            {shouldShowOriginalPrice && (
              <span className="text-xs text-zinc-400 line-through">
                ${highestPrice}
              </span>
            )}
            <span className="text-black font-black text-sm">${price}</span>
          </div>
        </div>
        <p className="text-xs text-zinc-500 truncate">{highlight(location, searchTerm)}</p>
        {condition && condition !== "Good" && condition !== "good" && (
          <p className="text-xs text-zinc-500">
            Terms: <span className="font-medium text-zinc-700">{highlight(condition, searchTerm)}</span>
          </p>
        )}
        <div className="pt-2">
          <DealTapeChips input={readDealInput({ description, terms, category })} />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-400 pt-2 border-t border-zinc-100">
          <div className="flex min-w-0 items-center gap-2">
            <Link href={`/profile/${user.user_id}`}>
              {showAvatar ? (
                <Image
                  src={user.image}
                  alt={user.name || 'User'}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full border border-zinc-200 object-cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <div className="w-6 h-6 rounded-full border border-zinc-200 bg-zinc-200 flex items-center justify-center text-zinc-500 text-xs">
                  <span>{user.name?.[0] || '?'}</span>
                </div>
              )}
            </Link>
            <Link href={`/profile/${user.user_id}`}>
              <span className="block max-w-[120px] truncate font-medium leading-none text-zinc-700">{user.name}</span>
            </Link>
          </div>
          <span className="shrink-0">{timePosted}</span>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
