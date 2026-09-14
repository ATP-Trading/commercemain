const collagen = { title: "Collagen supplementation: systematic review (2025)", url: "https://pubmed.ncbi.nlm.nih.gov/40324552/" };
const water = { title: "CDC: choosing home water filters", url: "https://www.cdc.gov/drinking-water/prevention/about-choosing-home-water-filters.html" };
const supplements = { title: "NIH: dietary supplement labels and use", url: "https://ods.od.nih.gov/factsheets/WYNTK-Consumer/" };
const sources: Record<string, { title: string; url: string }[]> = {
  "collagen-skin-health": [collagen],
  "marine-collagen": [collagen, supplements],
  "marine-collagen-vs-bovine": [collagen, supplements],
  "alkaline-water-benefits": [water],
  "alkaline-water-vs-regular": [water],
  "hyaluronic-acid": [supplements],
  "sod-enzyme": [{ title: "NCCIH: antioxidant supplements", url: "https://www.nccih.nih.gov/health/antioxidant-supplements-what-you-need-to-know" }],
  "psyllium-husk": [{ title: "MedlinePlus: psyllium", url: "https://www.medlineplus.gov/druginfo/meds/a601104.html" }],
};

export function EditorialSources({ slug, locale }: { slug: string; locale: string }) {
  const items = sources[slug];
  if (!items) return null;
  const ar = locale === "ar";
  return <section className="bg-atp-off-white py-10">
    <div className="container-premium max-w-4xl space-y-4 text-base leading-relaxed">
      <h2 className="text-xl font-semibold">{ar ? "المراجع" : "References"}</h2>
      <p>{ar ? "مراجع للمعلومات العامة؛ لا تُعد اختبارات أو شهادات لأي منتج معروض. راجع ملصق المنتج ومواصفاته." : "References for general information; these are not tests or certifications of any listed product. Check the product label and specifications."}</p>
      <ul className="space-y-3">{items.map(item => <li key={item.url}><a href={item.url} className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4" rel="noopener noreferrer" target="_blank" lang="en" dir="ltr">{item.title}</a></li>)}</ul>
    </div>
  </section>;
}
