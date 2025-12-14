import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { ProjectMedia } from "@/types/database";

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

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const supabase = await createClient();

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
    notFound();
  }

  // Sort media by display_order
  const media = (project.project_media as ProjectMedia[]).sort(
    (a, b) => a.display_order - b.display_order
  );

  return (
    <article className="min-h-screen bg-[#050505]">
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
