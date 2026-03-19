export function ClientStrip() {
  const clientTypes = [
    "EdTech Startups",
    "MSME Manufacturers",
    "B2B SaaS Companies",
    "Retail & E-Commerce",
    "Healthcare Platforms",
    "FinTech Products",
    "Logistics & Delivery",
    "Enterprise IT Teams",
  ];

  return (
    <div className="bg-white py-7" style={{ borderBottom: "1px solid #E5E7EB" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <p
            className="text-xs font-semibold uppercase tracking-widest shrink-0"
            style={{ color: "#9CA3AF" }}
          >
            Trusted by
          </p>
          <div
            className="hidden sm:block w-px h-4 shrink-0"
            style={{ backgroundColor: "#E5E7EB" }}
          />
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            {clientTypes.map((type) => (
              <span
                key={type}
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: "#F3F4F6",
                  color: "#374151",
                  border: "1px solid #E5E7EB",
                }}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
