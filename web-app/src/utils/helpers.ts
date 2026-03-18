// ── Basic Helper Utilities ──────────────────────────

export function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Global function for inline onclick (code copy button)
export function initCopyCode(): void {
  (window as unknown as { copyCode: (btn: HTMLButtonElement) => void }).copyCode = function(btn: HTMLButtonElement): void {
    const codeBlock = btn.closest('.code-block-v2')?.querySelector('code');
    if (codeBlock) {
      navigator.clipboard.writeText(codeBlock.textContent || '');
      btn.textContent = "Copied!";
      setTimeout(() => { btn.textContent = "Copy"; }, 2000);
    }
  };
}
