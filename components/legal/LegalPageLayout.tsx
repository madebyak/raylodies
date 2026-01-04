import Link from "next/link";

type TocItem = { href: string; label: string };

export default function LegalPageLayout({
  title,
  meta,
  toc,
  children,
}: {
  title: string;
  meta: React.ReactNode;
  toc?: TocItem[];
  children: React.ReactNode;
}) {
  const hasToc = Boolean(toc && toc.length > 0);

  return (
    <section className="px-6 md:px-10 pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="max-w-[1100px] mx-auto">
        <header className="mb-10 md:mb-14">
          <h1 className="text-4xl md:text-5xl font-light text-white mb-4 tracking-tight">
            {title}
          </h1>
          <div className="text-white/50 text-sm font-light">{meta}</div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {hasToc && (
            <div className="lg:col-span-3 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* Mobile TOC */}
                <div className="lg:hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <p className="text-xs uppercase tracking-wider text-white/50 mb-3">
                    On this page
                  </p>
                  <nav className="flex flex-col gap-2">
                    {toc!.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="text-sm text-white/60 hover:text-white transition-colors"
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Desktop TOC */}
                <div className="hidden lg:block rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <p className="text-xs uppercase tracking-wider text-white/50 mb-4">
                    On this page
                  </p>
                  <nav className="flex flex-col gap-2">
                    {toc!.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="text-sm text-white/60 hover:text-white transition-colors"
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </div>

                <div className="hidden lg:block text-xs text-white/40">
                  See also{" "}
                  <Link href="/terms" className="text-white/70 hover:text-white transition-colors">
                    Terms
                  </Link>
                  ,{" "}
                  <Link href="/privacy" className="text-white/70 hover:text-white transition-colors">
                    Privacy
                  </Link>{" "}
                  and{" "}
                  <Link href="/refund" className="text-white/70 hover:text-white transition-colors">
                    Refunds
                  </Link>
                  .
                </div>
              </div>
            </div>
          )}

          <div className={hasToc ? "lg:col-span-9 order-1 lg:order-2" : "lg:col-span-12"}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}



