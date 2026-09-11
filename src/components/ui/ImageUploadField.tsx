'use client';

import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';

const MAX_MB = 6;

async function compressImage(file: File, maxDimension = 1600, quality = 0.85): Promise<Blob> {
  if (typeof document === 'undefined') return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    return file;
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((result) => resolve(result), 'image/jpeg', quality));
  return blob && blob.size > 0 ? blob : file;
}

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  variant?: 'logo' | 'cover';
  hint?: string;
}

export default function ImageUploadField({ label, value, onChange, variant = 'cover', hint }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Selecciona un archivo de imagen (JPG, PNG o WebP).');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`La imagen supera ${MAX_MB} MB. Elige una más liviana.`);
      return;
    }
    setError('');
    setIsUploading(true);
    try {
      const payload = file.type === 'image/gif' ? file : await compressImage(file);
      const formData = new FormData();
      formData.append('file', new File([payload], file.name || 'foto.jpg', { type: payload.type || 'image/jpeg' }));
      const response = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.url) throw new Error(data.error || 'No se pudo subir la imagen.');
      onChange(data.url);
    } catch (err: any) {
      setError(err?.message || 'No se pudo subir la imagen. Intenta de nuevo.');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const previewHeight = variant === 'logo' ? 104 : 140;

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
        {label}
      </label>

      <div
        style={{
          border: `1px dashed ${TOKENS.colors.borderLight}`,
          borderRadius: TOKENS.radii.lg,
          overflow: 'hidden',
          marginBottom: '8px',
          backgroundColor: TOKENS.colors.surfaceInset,
        }}
      >
        {value ? (
          <img
            src={value}
            alt="Vista previa"
            style={{
              width: '100%',
              height: previewHeight,
              objectFit: variant === 'logo' ? 'contain' : 'cover',
              display: 'block',
              backgroundColor: TOKENS.colors.surfaceInset,
            }}
          />
        ) : (
          <div
            style={{
              height: previewHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: TOKENS.colors.textMuted,
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            Sin imagen todavía
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 16px',
            borderRadius: TOKENS.radii.pill,
            border: 'none',
            backgroundColor: isUploading ? 'rgba(23, 56, 45, 0.35)' : TOKENS.colors.emeraldDark,
            color: '#FFFFFF',
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: isUploading ? 'wait' : 'pointer',
          }}
        >
          <Upload size={14} />
          {isUploading ? 'Subiendo...' : 'Subir desde celular o PC'}
        </button>

        <button
          type="button"
          onClick={() => setShowUrlInput((prev) => !prev)}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px 2px',
            color: TOKENS.colors.textSecondary,
            fontSize: '0.76rem',
            fontWeight: 700,
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          {showUrlInput ? 'Ocultar URL' : 'o pegar una URL'}
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px 2px',
              color: '#B42318',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Quitar imagen
          </button>
        )}
      </div>

      {showUrlInput && (
        <input
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://.../imagen.jpg"
          style={{
            width: '100%',
            marginTop: '8px',
            padding: '10px 14px',
            borderRadius: TOKENS.radii.pill,
            backgroundColor: TOKENS.colors.surfaceInset,
            border: `1px solid ${TOKENS.colors.borderLight}`,
            color: TOKENS.colors.textMain,
            fontSize: '0.82rem',
            outline: 'none',
          }}
        />
      )}

      {hint && (
        <p style={{ margin: '6px 2px 0', fontSize: '0.72rem', color: TOKENS.colors.textMuted }}>
          {hint}
        </p>
      )}
      {error && (
        <p style={{ margin: '6px 2px 0', fontSize: '0.74rem', fontWeight: 700, color: '#B42318' }}>
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </div>
  );
}
