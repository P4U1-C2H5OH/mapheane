import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

export function ImageUpload({ images, onChange, maxImages = 5, label = 'Images' }: ImageUploadProps) {
  const [isDragging, setIsDragging]   = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', UPLOAD_PRESET);
    form.append('folder', 'mapheane');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.secure_url as string;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    const remainingSlots = maxImages - images.length;
    const filesToProcess = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, remainingSlots);

    if (!filesToProcess.length) return;
    setUploading(true);
    setUploadError('');

    try {
      const urls = await Promise.all(filesToProcess.map(uploadToCloudinary));
      onChange([...images, ...urls]);
    } catch {
      setUploadError('Upload failed — please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-charcoal">
        {label} {images.length > 0 && `(${images.length}/${maxImages})`}
      </label>

      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 lg:p-8 text-center transition-all ${
            uploading ? 'cursor-wait opacity-60' :
            isDragging ? 'border-terracotta bg-terracotta/5 cursor-copy' :
            'border-charcoal/20 hover:border-terracotta/50 hover:bg-charcoal/5 cursor-pointer'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          {uploading ? (
            <>
              <Loader className="w-8 h-8 text-terracotta mx-auto mb-3 animate-spin" />
              <p className="text-sm text-charcoal">Uploading…</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 lg:w-10 lg:h-10 text-muted mx-auto mb-3" />
              <p className="text-sm lg:text-base text-charcoal mb-1">
                <span className="text-terracotta font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs lg:text-sm text-muted">
                PNG, JPG, WebP up to 10MB ({maxImages - images.length} remaining)
              </p>
            </>
          )}
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-red-600">{uploadError}</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          <AnimatePresence>
            {images.map((image, index) => (
              <motion.div
                key={image}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square"
              >
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-charcoal/10"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-terracotta text-white text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <p className="text-xs text-muted">First image will be used as the primary/featured image</p>
    </div>
  );
}
