import { useState, useEffect } from "react";

export default function AuthenticatedImage({ src, alt, className }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const token = localStorage.getItem("token");
        const backendUrl =
          import.meta.env.VITE_BACKEND_URL?.replace("/api", "") ||
          "http://localhost:4000";

        const response = await fetch(`${backendUrl}${src}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setImageSrc(imageUrl);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load image:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchImage();

    // Cleanup blob URL when component unmounts
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [src]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-brand-gray-900 ${className}`}
      >
        <div className="text-center">
          <div className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
          <p className="text-gray-400 text-sm">Loading hint...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-brand-gray-900 ${className}`}
      >
        <div className="text-center">
          <p className="text-brand-primary text-lg font-bold">
            ⚠️ Image not found
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Please contact the organizers
          </p>
        </div>
      </div>
    );
  }

  return <img src={imageSrc} alt={alt} className={className} />;
}
