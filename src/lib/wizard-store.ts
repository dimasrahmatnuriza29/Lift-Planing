"use client";

import { create } from "zustand";

interface WizardState {
  step: number;
  formData: Record<string, unknown>;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Record<string, unknown>) => void;
  reset: () => void;
}

export const useWizard = create<WizardState>((set) => ({
  step: 1,
  formData: {},
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 8) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  reset: () => set({ step: 1, formData: {} }),
}));
