"use client";

import { useCallback } from "react";

interface PinterestSaveButtonProps {
  url: string; // The product page URL that Pinterest will link to
  media: string; // The image URL to be pinned
  description: string; // Description for the pin
  className?: string;
}

/**
 * Custom Pinterest Save Button
 * Opens Pinterest's pin creation dialog with the correct URL, image, and description
 * This ensures the "Visit site" link on Pinterest goes to the correct product page
 */
export default function PinterestSaveButton({
  url,
  media,
  description,
  className = "",
}: PinterestSaveButtonProps) {
  const handleSave = useCallback(() => {
    // Encode parameters for URL
    const encodedUrl = encodeURIComponent(url);
    const encodedMedia = encodeURIComponent(media);
    const encodedDescription = encodeURIComponent(description);

    // Pinterest's official pin creation URL
    const pinterestUrl = `https://www.pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedMedia}&description=${encodedDescription}`;

    // Open in a popup window (Pinterest's recommended approach)
    const width = 750;
    const height = 550;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
      pinterestUrl,
      "pinterest-share",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`,
    );
  }, [url, media, description]);

  return (
    <button
      type="button"
      onClick={handleSave}
      className={`
        inline-flex items-center gap-1.5
        bg-[#E60023] hover:bg-[#ad081b]
        text-white font-semibold
        px-3 py-2 rounded-full
        text-sm
        shadow-lg
        transition-all duration-200
        hover:scale-105
        ${className}
      `}
      aria-label="Save to Pinterest"
    >
      {/* Pinterest Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4"
      >
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
      <span>Save</span>
    </button>
  );
}
