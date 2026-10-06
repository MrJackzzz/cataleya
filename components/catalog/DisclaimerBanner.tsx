export const DISCLAIMER_TEXT =
  "Las imágenes e identificadores numéricos son exclusivamente para orientación olfativa. Los productos comercializados son contratipos / réplicas de alta calidad inspirados en las marcas originales.";

export function DisclaimerBanner() {
  return (
    <aside className="rounded-xl border border-gold/25 bg-gradient-to-r from-burgundy-deep/40 via-card to-card px-5 py-4 text-sm leading-relaxed text-ivory/85">
      <span className="eyebrow mb-2 block text-gold">Aviso olfativo</span>
      {DISCLAIMER_TEXT}
    </aside>
  );
}
