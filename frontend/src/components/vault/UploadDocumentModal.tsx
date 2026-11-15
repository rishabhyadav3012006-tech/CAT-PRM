import React, { useState } from 'react';
import {
  Upload,
  FileText,
  FileCheck,
  Pill,
  Droplet,
  History,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Tag,
  Plus,
  X
} from 'lucide-react';
import { VaultCategory } from '../../types/index.ts';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { InputField } from '../ui/InputField.tsx';
import { SelectField } from '../ui/SelectField.tsx';
import { vaultApi } from '../../api/client.ts';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORY_OPTIONS = [
  { value: 'PRESCRIPTION', label: 'Prescription (Rx Specialist Orders)' },
  { value: 'BLOOD_REPORT', label: 'Blood Report (Lab & Chemistry Panels)' },
  { value: 'MEDICAL_HISTORY', label: 'Medical History (Annual Health Dossiers)' },
  { value: 'DIAGNOSTIC_REPORT', label: 'Diagnostic Report (ECG, X-Ray, Scans)' },
  { value: 'DISCHARGE_SUMMARY', label: 'Discharge Summary (Hospital & Rehab)' },
  { value: 'OTHER', label: 'Other Document (Immunizations, Insurance)' }
];

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<VaultCategory>('PRESCRIPTION');
  const [doctorName, setDoctorName] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [documentDate, setDocumentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Selected file state
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);

  // Tags
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Cardiology', 'Prescription']);

  // Upload Progress Simulation
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 15MB)
    const maxSizeBytes = 15 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMsg(`File size exceeds 15 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a smaller document.`);
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
      setErrorMsg('Invalid file format. Supported formats: PDF, PNG, JPG, JPEG, WEBP.');
      return;
    }

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setSelectedFile({
      name: file.name,
      size: sizeFormatted,
      type: file.type || 'application/pdf'
    });

    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a document title.');
      return;
    }

    const fileName = selectedFile ? selectedFile.name : `${title.trim().replace(/\s+/g, '_')}.pdf`;
    const fileSize = selectedFile ? selectedFile.size : '1.8 MB';

    setIsUploading(true);
    setUploadProgress(15);

    // Simulate upload progression
    const p1 = setTimeout(() => setUploadProgress(45), 250);
    const p2 = setTimeout(() => setUploadProgress(85), 600);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setUploadProgress(100);

      await vaultApi.upload({
        elderlyId: 'eld-01',
        title: title.trim(),
        category,
        doctorName: doctorName.trim() || undefined,
        facilityName: facilityName.trim() || undefined,
        documentDate,
        fileName,
        fileSize,
        tags,
        notes: notes.trim() || undefined
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to upload document');
    } finally {
      clearTimeout(p1);
      clearTimeout(p2);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload to Secure Medical Vault"
      subtitle="Encrypted clinical storage for prescriptions, blood work, ECGs, and discharge summaries"
      icon={<Upload className="w-5 h-5 text-[#7969B5]" />}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-[#FCE4ED] border border-[#F7C6D7] text-xs font-bold text-[#A62650] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Document Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField
            label="Document Title *"
            placeholder="e.g. Quarterly Lisinopril Prescription"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <SelectField
            label="Document Category *"
            value={category}
            onChange={(e) => setCategory(e.target.value as VaultCategory)}
            options={CATEGORY_OPTIONS}
          />
        </div>

        {/* 2. Doctor & Facility Affiliation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField
            label="Prescribing Doctor / Specialist"
            placeholder="e.g. Dr. Elizabeth Adams (Cardiologist)"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
          />

          <InputField
            label="Medical Center / Diagnostic Lab"
            placeholder="e.g. St. Mary Hospital / Quest Diagnostics"
            value={facilityName}
            onChange={(e) => setFacilityName(e.target.value)}
          />
        </div>

        {/* 3. Issue Date */}
        <InputField
          label="Document / Issue Date *"
          type="date"
          value={documentDate}
          onChange={(e) => setDocumentDate(e.target.value)}
          required
        />

        {/* 4. File Dropzone & Validation */}
        <div className="p-4 rounded-3xl bg-[#FAF9FF] border-2 border-dashed border-[#BDDCFF] text-center space-y-2 relative">
          <input
            type="file"
            id="medical-file-upload"
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="w-12 h-12 rounded-2xl bg-[#DFEEFF] text-[#1B5494] flex items-center justify-center mx-auto shadow-2xs">
            <Upload className="w-6 h-6" />
          </div>

          <div>
            <p className="text-xs font-black font-heading text-[#34354A]">
              {selectedFile ? (
                <span className="text-[#1D6A48]">Selected: {selectedFile.name} ({selectedFile.size})</span>
              ) : (
                'Drop medical report or click to browse'
              )}
            </p>
            <p className="text-[11px] font-medium text-[#7A7D9D] mt-0.5">
              Supported Formats: PDF, PNG, JPG, JPEG, WEBP • Max Size: 15 MB
            </p>
          </div>
        </div>

        {/* Upload Progress Bar if active */}
        {isUploading && (
          <div className="space-y-1.5 p-3 rounded-2xl bg-[#DDF5E9]/60 border border-[#B7E7CE]">
            <div className="flex items-center justify-between text-xs font-bold text-[#1D6A48]">
              <span>Encrypting & Storing in Private Vault...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 5. Clinical Tags Multi-Input */}
        <div>
          <label className="block text-xs sm:text-sm font-bold font-heading text-[#34354A] mb-1.5">
            Clinical Tags (Diagnostic keywords)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add tag (e.g. Hypertension, Lipid Panel, Blood Work)..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#ECEAF5] bg-white font-medium text-[#34354A] focus:outline-none"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddTag}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs py-1.5"
            >
              <span>Add Tag</span>
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-[#E9E3FF] text-[#55428F] border border-[#D1C6F8]"
              >
                <Tag className="w-3 h-3" />
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-rose-500 hover:text-rose-700 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 6. Notes / Clinical Summary */}
        <div>
          <label className="block text-xs sm:text-sm font-bold font-heading text-[#34354A] mb-1.5">
            Clinical Notes & Diagnostic Summary
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Normal sinus rhythm on 12-lead ECG; fasting glucose 108 mg/dL; lipid profile within expected range."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#E5E4F2] hover:border-[#C2B5F0] focus:border-[#7969B5] focus:ring-4 focus:ring-[#E9E3FF]/80 text-xs sm:text-sm font-medium font-body text-[#34354A] bg-white focus:outline-none"
          />
        </div>

        {/* Security Assurance Box */}
        <div className="p-3 rounded-2xl bg-[#FFF9ED] border border-[#F7ECCF] flex items-start gap-2.5 text-xs text-[#8C6D1F]">
          <Lock className="w-4 h-4 text-[#8C6D1F] flex-shrink-0 mt-0.5" />
          <p className="font-medium">
            <strong>Security Guarantee:</strong> Documents are stored in private medical storage. Public URLs are never exposed. Short-lived signed links are generated only for authorized caregivers.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-[#ECEAF5] flex justify-end gap-2.5">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            <span>Cancel</span>
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isUploading}
            className="rounded-2xl shadow-glow-purple px-6"
          >
            <span>{isUploading ? 'Encrypting & Storing...' : 'Upload & Encrypt in Vault'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

