import { createPublicClient } from "@/lib/supabase/public";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { ProjectMedia } from "@/types/database";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo/site";
import { normalizeSlug } from "@/lib/slug";

export const revalidate = 300;

// Video Player Component
function VideoPlayer({ url }: { url: string }) {
  return (
    <video
      src={url}
      className="w-full h-full object-cover"
      controls
      loop
      playsInline
    />
  );
}

export default async function ProjectPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createPublicClient();

  // Fetch project with media
  const { data: project } = await supabase
    .from("projects")
    .select(`
      *,
      categories (name),
      project_media (
        id,
        type,
        url,
        display_order
      )
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!project) {
    const normalized = normalizeSlug(slug);
    if (normalized && normalized !== slug) {
      const { data: alt } = await supabase
        .from("projects")
        .select("slug")
        .eq("slug", normalized)
        .eq("is_published", true)
        .maybeSingle();

      if (alt?.slug) {
        redirect(`/work/${alt.slug}`);
      }
    }

    notFound();
  }

  // Sort media by display_order
  const media = (project.project_media as ProjectMedia[]).sort(
    (a, b) => a.display_order - b.display_order
  );

  const projectUrl = absoluteUrl(`/work/${project.slug}`);
  const primaryImage = project.og_image || project.thumbnail || undefined;

  return (
    <article className="min-h-screen bg-[#050505]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Work", item: absoluteUrl("/work") },
            { "@type": "ListItem", position: 3, name: project.title, item: projectUrl },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: project.description || undefined,
          image: primaryImage ? [primaryImage] : undefined,
          url: projectUrl,
          dateCreated: project.year ? `${project.year}-01-01` : undefined,
          creator: {
            "@type": "Person",
            name: "Ranya",
          },
          publisher: {
            "@type": "Organization",
            name: "Raylodies",
            url: absoluteUrl("/"),
          },
        }}
      />
      {/* Hero Header */}
      <div className="pt-32 pb-12 px-6 md:px-10">
        <div className="max-w-[1800px] mx-auto">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back to Work
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight">
                {project.title}
              </h1>
              <div className="flex items-center gap-6 text-sm text-white/40">
                <span>{project.year}</span>
                <span>•</span>
                <span>{project.categories?.name}</span>
              </div>
            </div>

            <div className="text-white/60 text-lg font-light leading-relaxed whitespace-pre-wrap">
              {project.description}
            </div>
          </div>
        </div>
      </div>

      {/* Media Gallery */}
      <div className="px-6 md:px-10 pb-32">
        <div className="max-w-[1800px] mx-auto space-y-4 md:space-y-8">
          {media.map((item) => (
            <div
              key={item.id}
              className="relative w-full overflow-hidden rounded-lg bg-white/5"
            >
              {item.type === "video" ? (
                <div className="aspect-video">
                  <VideoPlayer url={item.url} />
                </div>
              ) : (
                <div className="relative w-full h-auto">
                  <Image
                    src={item.url}
                    alt={project.title}
                    width={1920}
                    height={1080}
                    className="w-full h-auto object-cover"
                    sizes="100vw"
                    priority={item.display_order === 0}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Next Project (Optional: You could query next project here) */}
      <div className="border-t border-white/5 py-20 text-center">
        <p className="text-white/40 text-sm mb-4">Ready to start?</p>
        <Link href="/start-a-project">
          <Button size="lg" variant="secondary">
            Start a Project
          </Button>
        </Link>
      </div>
    </article>
  );
}
