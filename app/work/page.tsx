import { getProjects } from "@/actions/projects";
import WorkGrid from "@/components/work/WorkGrid";

export default async function WorkPage() {
  // Fetch real projects from Supabase
  const projects = await getProjects();

  // Transform data to match the UI component structure if needed
  // Or update the UI component to use the new Project type
  // For now, let's update WorkGrid to accept projects as a prop

  return (
    <section className="px-6 md:px-10 pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="max-w-[1800px] mx-auto">
        {/* Page Header */}
        <div className="mb-12 md:mb-16 animate-fade-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6">
            Work
          </h1>
          <p className="text-white/50 text-lg md:text-xl font-light max-w-2xl">
            A collection of AI-generated images and videos, exploring the
            boundaries of digital creativity and artificial intelligence.
          </p>
        </div>

        {/* Work Grid - Passing real data */}
        <div className="animate-fade-up delay-200">
          <WorkGrid initialProjects={projects} />
        </div>
      </div>
    </section>
  );
}
