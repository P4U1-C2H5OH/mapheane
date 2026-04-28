const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

interface CloudinaryUploadResponse {
  secure_url?: string;
  error?: { message?: string };
}

export async function uploadAdminImage(file: File, folder = 'mapheane'): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary upload is not configured.');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload an image file.');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image must be under 10MB.');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);
  form.append('folder', folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json().catch(() => ({})) as CloudinaryUploadResponse;

  if (!res.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'Image upload failed.');
  }
  return data.secure_url;
}
