import React, { useState, useEffect } from 'react';
import { Pill, Clock, Utensils, Calendar, FileText, Upload, Plus, Trash2, CheckCircle2, X } from 'lucide-react';
import { Modal } from '../ui/Modal.tsx';
import { InputField } from '../ui/InputField.tsx';
import { SelectField } from '../ui/SelectField.tsx';
import { Button } from '../ui/Button.tsx';
import { Medication } from '../../types/index.ts';

interface MedicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  elderlyId: string;
  initialData?: Medication | null;
  onSave: (data: any) => Promise<void>;
}

export const MedicationFormModal: React.FC<MedicationFormModalProps> = ({
  isOpen,
  onClose,
  elderlyId,
  initialData,
  onSave
}) => {
  const isEditing = !!initialData;

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cardiovascular');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('DAILY');
  const [scheduledTimes, setScheduledTimes] = useState<string[]>(['08:00 AM']);
  const [newTimeInput, setNewTimeInput] = useState('');
  const [foodInstructions, setFoodInstructions] = useState('AFTER_MEAL');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isOngoing, setIsOngoing] = useState(true);
  const [endDate, setEndDate] = useState('');
  const [doctorInstructions, setDoctorInstructions] = useState('');
  const [stockQuantity, setStockQuantity] = useState(30);
  const [refillThreshold, setRefillThreshold] = useState(7);
  const [prescriptionFileName, setPrescriptionFileName] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill on edit
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category || 'Cardiovascular');
      setDosage(initialData.dosage);
      setFrequency(initialData.frequency);
      setScheduledTimes(initialData.scheduledTimes || ['08:00 AM']);
      setFoodInstructions(initialData.foodInstructions || 'AFTER_MEAL');
      setStartDate(
        initialData.startDate
          ? new Date(initialData.startDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      if (initialData.endDate) {
        setIsOngoing(false);
        setEndDate(new Date(initialData.endDate).toISOString().split('T')[0]);
      } else {
        setIsOngoing(true);
        setEndDate('');
      }
      setDoctorInstructions(initialData.doctorInstructions || initialData.instructions || '');
      setStockQuantity(initialData.stockQuantity || 30);
      setRefillThreshold(initialData.refillReminderThreshold || 7);
      setPrescriptionFileName(initialData.prescriptionUrl ? 'prescription-rx-scan.pdf' : null);
    } else {
      // Reset defaults
      setName('');
      setCategory('Cardiovascular');
      setDosage('');
      setFrequency('DAILY');
      setScheduledTimes(['08:00 AM']);
      setFoodInstructions('AFTER_MEAL');
      setStartDate(new Date().toISOString().split('T')[0]);
      setIsOngoing(true);
      setEndDate('');
      setDoctorInstructions('');
      setStockQuantity(30);
      setRefillThreshold(7);
      setPrescriptionFileName(null);
    }
    setFieldErrors({});
  }, [initialData, isOpen]);

  const handleAddTime = () => {
    if (!newTimeInput.trim()) return;
    if (!scheduledTimes.includes(newTimeInput.trim())) {
      setScheduledTimes([...scheduledTimes, newTimeInput.trim()]);
    }
    setNewTimeInput('');
  };

  const handleRemoveTime = (timeToRemove: string) => {
    if (scheduledTimes.length <= 1) return; // Keep at least one time
    setScheduledTimes(scheduledTimes.filter((t) => t !== timeToRemove));
  };

  const handlePresetTime = (time: string) => {
    if (!scheduledTimes.includes(time)) {
      setScheduledTimes([...scheduledTimes, time]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrescriptionFileName(file.name);
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = 'Medicine name is required.';
    if (!dosage.trim()) errors.dosage = 'Dosage is required (e.g. 10mg, 1 tablet).';
    if (scheduledTimes.length === 0) errors.scheduledTimes = 'Please select at least one intake time.';
    if (!startDate) errors.startDate = 'Start date is required.';
    if (!isOngoing && !endDate) errors.endDate = 'End date is required for temporary medications.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        elderlyId,
        name: name.trim(),
        category,
        dosage: dosage.trim(),
        frequency,
        scheduledTimes,
        foodInstructions,
        doctorInstructions: doctorInstructions.trim(),
        instructions: doctorInstructions.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: !isOngoing && endDate ? new Date(endDate).toISOString() : undefined,
        stockQuantity: Number(stockQuantity),
        refillReminderThreshold: Number(refillThreshold),
        prescriptionUrl: prescriptionFileName ? 'https://example.com/rx-document.pdf' : undefined
      });
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Failed to save medication');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: 'Cardiovascular', label: 'Cardiovascular / Blood Pressure' },
    { value: 'Diabetes', label: 'Diabetes & Endocrine' },
    { value: 'Analgesic', label: 'Analgesic / Pain Relief' },
    { value: 'Supplements', label: 'Vitamins & Dietary Supplements' },
    { value: 'Respiratory', label: 'Respiratory / Asthma' },
    { value: 'Neurological', label: 'Neurological / Mental Wellness' },
    { value: 'Gastrointestinal', label: 'Gastrointestinal & Digestion' },
    { value: 'Antibiotics', label: 'Antibiotics & Anti-infectives' },
    { value: 'Other', label: 'Other Clinical Specialty' }
  ];

  const frequencyOptions = [
    { value: 'DAILY', label: 'Once Daily (Every 24 hours)' },
    { value: 'TWICE_DAILY', label: 'Twice Daily (Morning & Evening)' },
    { value: 'THRICE_DAILY', label: 'Three Times Daily (With Meals)' },
    { value: 'EVERY_8_HOURS', label: 'Every 8 Hours' },
    { value: 'AS_NEEDED', label: 'As Needed (PRN / Relief)' },
    { value: 'WEEKLY', label: 'Once Weekly' }
  ];

  const foodInstructionOptions = [
    { value: 'AFTER_MEAL', label: 'Take After Food (Post-Meal)' },
    { value: 'BEFORE_MEAL', label: 'Take 30m Before Food' },
    { value: 'WITH_MEAL', label: 'Take With Warm Food' },
    { value: 'BEFORE_BED', label: 'Take at Bedtime' },
    { value: 'EMPTY_STOMACH', label: 'Take on Empty Stomach' },
    { value: 'ANYTIME', label: 'Anytime (Independent of food)' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Medication Schedule' : 'Add New Medication'}
      subtitle={isEditing ? `Modifying ${name}` : 'Prescribe or schedule a medicine for Eleanor Vance'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left max-h-[75vh] overflow-y-auto pr-1">
        {/* Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField
            label="Medicine Name"
            type="text"
            placeholder="e.g. Lisinopril, Metformin"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }));
            }}
            error={fieldErrors.name}
            leftIcon={<Pill className="w-4 h-4" />}
            required
          />

          <SelectField
            label="Medicine Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={categoryOptions}
            required
          />
        </div>

        {/* Dosage & Frequency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField
            label="Dosage"
            type="text"
            placeholder="e.g. 10mg (1 tablet), 5ml"
            value={dosage}
            onChange={(e) => {
              setDosage(e.target.value);
              if (fieldErrors.dosage) setFieldErrors((prev) => ({ ...prev, dosage: '' }));
            }}
            error={fieldErrors.dosage}
            helperText="Form and strength per intake"
            required
          />

          <SelectField
            label="Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            options={frequencyOptions}
            required
          />
        </div>

        {/* Food Instructions */}
        <SelectField
          label="Food Instructions (Before / After Food)"
          value={foodInstructions}
          onChange={(e) => setFoodInstructions(e.target.value)}
          options={foodInstructionOptions}
          helperText="Ensures proper absorption and prevents gastrointestinal discomfort"
          required
        />

        {/* Scheduled Timings Multi-picker */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#E5E4F2]">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold font-heading text-[#34354A]">
              Scheduled Intake Timings <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-[#7A7D9D]">Choose or add times</span>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-1.5">
            {['08:00 AM', '12:30 PM', '07:30 PM', '09:00 PM'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetTime(preset)}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-[#E5E4F2] text-[#575973] hover:text-[#7969B5] hover:border-[#7969B5] transition-colors cursor-pointer"
              >
                + {preset}
              </button>
            ))}
          </div>

          {/* Active Time Tags */}
          <div className="flex flex-wrap gap-2 pt-1">
            {scheduledTimes.map((time) => (
              <span
                key={time}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#7969B5] text-[#7969B5] text-xs font-black shadow-2xs"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{time}</span>
                {scheduledTimes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTime(time)}
                    className="hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </span>
            ))}
          </div>

          {/* Custom Time Input */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Add custom time (e.g. 02:00 PM)"
              value={newTimeInput}
              onChange={(e) => setNewTimeInput(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#E5E4F2] text-xs font-medium text-[#34354A] focus:outline-none focus:ring-2 focus:ring-[#E9E3FF]"
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleAddTime}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add</span>
            </Button>
          </div>
          {fieldErrors.scheduledTimes && (
            <p className="text-xs font-semibold text-rose-600">⚠️ {fieldErrors.scheduledTimes}</p>
          )}
        </div>

        {/* Start Date & End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            error={fieldErrors.startDate}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs sm:text-sm font-bold font-heading text-[#34354A]">
                End Date
              </label>
              <label className="flex items-center gap-1.5 text-xs text-[#7969B5] font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOngoing}
                  onChange={(e) => setIsOngoing(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#7969B5]"
                />
                <span>Ongoing (No End Date)</span>
              </label>
            </div>

            {!isOngoing && (
              <InputField
                label=""
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                error={fieldErrors.endDate}
                required={!isOngoing}
              />
            )}
          </div>
        </div>

        {/* Stock Quantity & Refill Threshold */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField
            label="Current Pill Stock Count"
            type="number"
            min="1"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(Number(e.target.value))}
            helperText="Number of tablets/doses currently in bottle"
            required
          />

          <InputField
            label="Refill Reminder Threshold"
            type="number"
            min="1"
            value={refillThreshold}
            onChange={(e) => setRefillThreshold(Number(e.target.value))}
            helperText="Alert family when stock drops below this count"
            required
          />
        </div>

        {/* Doctor Instructions */}
        <div className="space-y-1.5">
          <label className="block text-xs sm:text-sm font-bold font-heading text-[#34354A]">
            Doctor & Pharmacy Instructions
          </label>
          <textarea
            rows={2}
            value={doctorInstructions}
            onChange={(e) => setDoctorInstructions(e.target.value)}
            placeholder="e.g. Prescribed by Dr. Elizabeth Adams. Take with full glass of water. Report dizziness."
            className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#E5E4F2] text-xs sm:text-sm text-[#34354A] placeholder-[#9497B5] focus:outline-none focus:ring-4 focus:ring-[#E9E3FF] transition-all"
          />
        </div>

        {/* Optional Prescription Upload */}
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-bold font-heading text-[#34354A]">
            Optional Prescription Upload
          </label>
          <div className="p-4 rounded-2xl border-2 border-dashed border-[#D2C7FC] bg-[#FAF9FF] hover:bg-white transition-all text-center space-y-2">
            <Upload className="w-6 h-6 text-[#7969B5] mx-auto" />
            <div className="text-xs">
              <label className="font-bold text-[#7969B5] hover:underline cursor-pointer">
                <span>Click to upload Rx slip or doctor note</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-[#7A7D9D] mt-0.5">PNG, JPG, PDF up to 10MB</p>
            </div>

            {prescriptionFileName && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDF5E9] text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{prescriptionFileName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-[#FAF9FF] flex items-center justify-end gap-2.5">
          <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Add Medication'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
