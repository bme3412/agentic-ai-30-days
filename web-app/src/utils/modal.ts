// ── Modal Helpers ────────────────────────────────────

export function showModal(): void {
  document.getElementById("modal-overlay")?.classList.remove("hidden");
}

export function closeModal(): void {
  document.getElementById("modal-overlay")?.classList.add("hidden");
}

export function initModalEvents(): void {
  document.getElementById("modal-close")?.addEventListener("click", closeModal);
  document.getElementById("modal-overlay")?.addEventListener("click", e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });
}
