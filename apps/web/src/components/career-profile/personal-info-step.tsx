'use client';

import { useRef, useState } from 'react';
import { useProfileStore } from '@/store/profile.store';
import { api } from '@/lib/api';
import { Camera, Loader2, X } from 'lucide-react';

export default function PersonalInfoStep() {
  const { profile, updateProfile } = useProfileStore();
  const pi = profile.personalInfo;
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const set = (field: string, value: string) => {
    updateProfile({ personalInfo: { ...pi, [field]: value } });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const data = await api.postForm<{ url: string }>('/upload', form);
      set('photoUrl', data.url);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => set('photoUrl', '');

  const fields = [
    { key: 'fullName', label: 'Full Name', placeholder: 'John Doe' },
    { key: 'email', label: 'Email', placeholder: 'john@example.com', type: 'email' },
    { key: 'phone', label: 'Phone', placeholder: '+1 234 567 890' },
    { key: 'location', label: 'Location', placeholder: 'New York, USA' },
    { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
    { key: 'github', label: 'GitHub URL', placeholder: 'https://github.com/...' },
    { key: 'portfolio', label: 'Portfolio URL', placeholder: 'https://...' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Personal Information</h2>

      <div className="flex items-center gap-6">
        <div className="relative">
          {pi.photoUrl ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-[var(--border)]">
              <img src={pi.photoUrl.startsWith('http') ? pi.photoUrl : `http://localhost:4000${pi.photoUrl}`} alt="Profile" className="h-full w-full object-cover" />
              <button onClick={removePhoto} className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white shadow">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">Upload a profile photo (max 5MB). Will appear on your resume if you choose.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={f.key === 'fullName' ? 'sm:col-span-2' : ''}>
            <label className="block text-sm font-medium mb-1">{f.label}</label>
            <input
              type={f.type || 'text'}
              value={(pi as any)[f.key] || ''}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
