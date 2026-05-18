import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useShifts } from "@/composables/shifts/useShifts";

export function useShiftsPage() {
  const router = useRouter();
  const authStore = useAuthStore();
  const { shifts, loading, error, fetchShifts } = useShifts();

  const currentPage = ref(1);
  const itemsPerPage = ref(20);
  const itemsPerPageOptions = [10, 20, 30, 50];

  const totalPages = computed(() => {
    if (!shifts.value) return 1;
    return Math.max(1, Math.ceil(shifts.value.length / itemsPerPage.value));
  });

  const paginatedShifts = computed(() => {
    if (!shifts.value) return [];
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return shifts.value.slice(start, end);
  });

  function prevPage() {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  }

  function nextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  }

  function handleItemsPerPageChange(newValue) {
    if (newValue) itemsPerPage.value = newValue;
    currentPage.value = 1;
  }
  
  async function initPage() {
    if (authStore.role !== "ADMIN") {
      alert("Akses Ditolak. Halaman ini hanya untuk ADMIN.");
      router.push({ name: "POS" });
      return;
    }

    await fetchShifts();
    currentPage.value = 1;
  }

  return {
    shifts,
    loading,
    error,
    currentPage,
    itemsPerPage,
    itemsPerPageOptions,
    totalPages,
    paginatedShifts,
    prevPage,
    nextPage,
    handleItemsPerPageChange,
    initPage,
    fetchShifts
  };
}
