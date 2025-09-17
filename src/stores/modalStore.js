// src/stores/modalStore.js
import { create } from 'zustand';

export const useModalStore = create((set) => ({
  isOpen: false,
  modalData: null,
  hasBeenShown: false, // Track if the modal has been shown this session

  // Action to load the modal data from Sanity into the store
  setModalData: (data) => set({ modalData: data }),

  // Action to open the modal, but only if it hasn't been shown before
  openModal: () => set((state) => {
    if (state.hasBeenShown || !state.modalData) {
      return {}; // Do nothing if already shown or no data
    }
    // Mark as shown and open the modal
    return { isOpen: true, hasBeenShown: true };
  }),

  closeModal: () => set({ isOpen: false }),
}));