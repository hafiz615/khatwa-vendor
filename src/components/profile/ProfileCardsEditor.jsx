import { useState, useEffect, useCallback } from "react";
import {
  hasStudioAccess,
  hasConsultationAccess,
  hasDesignKitAccess,
  hasBoutiqueAccess,
} from "../../utils/subscriptionAccess";
import { updateProfileCardsAPI } from "../../services/profile.service";

const CARD_KEYS = {
  bookConsultation: "bookConsultation",
  startDesigning: "startDesigning",
  shopInteriors: "shopInteriors",
};

const defaultProfileCards = {
  bookConsultation: { enabled: false, image: null },
  startDesigning: { enabled: false, image: null },
  shopInteriors: { enabled: false, image: null },
  fullWidthCard: null,
};

function useObjectUrl(file) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return undefined;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url;
}

export default function ProfileCardsEditor({
  profile,
  token,
  subscriptionState,
  onProfileCardsSaved,
  setErrorMsg,
}) {
  const [bookOn, setBookOn] = useState(false);
  const [startOn, setStartOn] = useState(false);
  const [shopOn, setShopOn] = useState(false);
  const [fullWidthCard, setFullWidthCard] = useState(null);
  const [bookImage, setBookImage] = useState(null);
  const [startImage, setStartImage] = useState(null);
  const [shopImage, setShopImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const bookPreview = useObjectUrl(bookImage);
  const startPreview = useObjectUrl(startImage);
  const shopPreview = useObjectUrl(shopImage);

  const showStudio = hasStudioAccess(subscriptionState);
  const canConsultation = hasConsultationAccess(subscriptionState);
  const canDesignKit = hasDesignKitAccess(subscriptionState);
  const canEcommerce = hasBoutiqueAccess(subscriptionState);

  const pc = profile?.profileCards || defaultProfileCards;

  useEffect(() => {
    if (!profile) return;
    const cards = profile.profileCards || defaultProfileCards;
    setBookOn(!!cards.bookConsultation?.enabled);
    setStartOn(!!cards.startDesigning?.enabled);
    setShopOn(!!cards.shopInteriors?.enabled);
    setFullWidthCard(cards.fullWidthCard ?? null);
    setBookImage(null);
    setStartImage(null);
    setShopImage(null);
  }, [profile]);

  const allThreeOn =
    bookOn &&
    startOn &&
    shopOn &&
    canConsultation &&
    canDesignKit &&
    canEcommerce;

  useEffect(() => {
    if (!allThreeOn && fullWidthCard != null) {
      setFullWidthCard(null);
    }
  }, [allThreeOn, fullWidthCard]);

  const showFullWidthPicker = allThreeOn;

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("bookConsultationEnabled", bookOn ? "true" : "false");
      formData.append("startDesigningEnabled", startOn ? "true" : "false");
      formData.append("shopInteriorsEnabled", shopOn ? "true" : "false");
      if (allThreeOn && fullWidthCard) {
        formData.append("fullWidthCard", fullWidthCard);
      } else {
        formData.append("fullWidthCard", "");
      }
      if (bookImage) formData.append("bookConsultationImage", bookImage);
      if (startImage) formData.append("startDesigningImage", startImage);
      if (shopImage) formData.append("shopInteriorsImage", shopImage);

      const res = await updateProfileCardsAPI(formData, token);
      if (res.success && res.data?.profileCards) {
        onProfileCardsSaved?.(res.data.profileCards);
      } else {
        setErrorMsg?.(res.message || "Failed to save profile cards.");
      }
    } catch (e) {
      setErrorMsg?.(
        e?.response?.data?.message || "Failed to save profile cards."
      );
    } finally {
      setSaving(false);
    }
  };

  const CardRow = useCallback(
    ({
      label,
      enabled,
      setEnabled,
      imageUrl,
      file,
      setFile,
      previewUrl,
      fwValue,
    }) => (
      <div className="border rounded-lg p-4 mb-4 bg-white flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium text-gray-800">{label}</span>
            </label>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {imageUrl && !file ? (
              <span className="break-all">Custom image in use</span>
            ) : (
              <span>Using default image unless you upload one</span>
            )}
          </div>
          {showFullWidthPicker && enabled && (
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="fullWidthCard"
                checked={fullWidthCard === fwValue}
                onChange={() => setFullWidthCard(fwValue)}
              />
              Full-width card (mobile)
            </label>
          )}
        </div>
        <div className="flex flex-col items-start gap-2">
          {(previewUrl || (imageUrl && !file)) && (
            <img
              src={previewUrl || imageUrl}
              alt=""
              className="h-16 w-24 object-cover rounded border"
            />
          )}
          {enabled && (
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          )}
        </div>
      </div>
    ),
    [fullWidthCard, showFullWidthPicker]
  );

  if (!showStudio) return null;

  return (
    <div className="mt-8 border rounded-xl p-5 bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Mobile profile cards
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Choose which action cards appear on your public profile in the mobile
        app. Images are optional. Full-width layout applies only when all three
        cards are enabled.
      </p>

      {showFullWidthPicker && (
        <div className="mb-4 p-3 bg-white border rounded-lg text-sm">
          <span className="font-medium text-gray-700">Full-width layout</span>
          <label className="mt-2 flex items-center gap-2">
            <input
              type="radio"
              name="fullWidthCard"
              checked={fullWidthCard == null}
              onChange={() => setFullWidthCard(null)}
            />
            Default (same as app: two cards on first row, third full width)
          </label>
        </div>
      )}

      {canConsultation && (
        <CardRow
          label="Book consultation"
          enabled={bookOn}
          setEnabled={setBookOn}
          imageUrl={pc.bookConsultation?.image}
          file={bookImage}
          setFile={setBookImage}
          previewUrl={bookPreview}
          fwValue={CARD_KEYS.bookConsultation}
        />
      )}

      {canDesignKit && (
        <CardRow
          label="Start designing"
          enabled={startOn}
          setEnabled={setStartOn}
          imageUrl={pc.startDesigning?.image}
          file={startImage}
          setFile={setStartImage}
          previewUrl={startPreview}
          fwValue={CARD_KEYS.startDesigning}
        />
      )}

      {canEcommerce && (
        <CardRow
          label="Shop interiors"
          enabled={shopOn}
          setEnabled={setShopOn}
          imageUrl={pc.shopInteriors?.image}
          file={shopImage}
          setFile={setShopImage}
          previewUrl={shopPreview}
          fwValue={CARD_KEYS.shopInteriors}
        />
      )}

      {!canConsultation && !canDesignKit && !canEcommerce && (
        <p className="text-sm text-amber-700">
          Your subscription does not include consultation, design kit, or store
          access — profile cards cannot be enabled.
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save profile cards"}
      </button>
    </div>
  );
}
