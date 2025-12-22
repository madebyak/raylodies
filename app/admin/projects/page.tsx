import { getProjects, deleteProject, toggleProjectStatus } from "@/actions/projects";
import Button from "@/components/ui/Button";
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Palette } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Project } from "@/types/database";
import { cn } from "@/lib/utils";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-light text-white">Projects</h2>
          <p className="text-white/40 text-sm mt-1">Manage your portfolio and creative work</p>
        </div>
        <Link href="/admin/projects/new">
          <Button className="flex items-center gap-2">
            <Plus size={18} />
            New Project
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 bg-[#050505] border border-white/5 p-2 rounded-lg">
        <div className="flex items-center gap-2 px-3 flex-1">
          <Search size={18} className="text-white/40" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30 w-full"
          />
        </div>
        <div className="h-6 w-px bg-white/10" />
        <select className="bg-transparent border-none outline-none text-sm text-white/60 hover:text-white cursor-pointer px-4">
          <option value="all">All Categories</option>
          <option value="ai-images">AI Images</option>
          <option value="ai-videos">AI Videos</option>
        </select>
        <div className="h-6 w-px bg-white/10" />
        <select className="bg-transparent border-none outline-none text-sm text-white/60 hover:text-white cursor-pointer px-4">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Projects Grid/List */}
      <div className="bg-[#050505] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="py-4 px-6 text-xs font-medium text-white/40 uppercase tracking-wider">Project</th>
              <th className="py-4 px-6 text-xs font-medium text-white/40 uppercase tracking-wider">Category</th>
              <th className="py-4 px-6 text-xs font-medium text-white/40 uppercase tracking-wider">Year</th>
              <th className="py-4 px-6 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-xs font-medium text-white/40 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-white/40 font-light">
                  No projects found. Create one to get started.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <ProjectRow key={project.id} project={project as Project} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Client component for the row to handle interactions nicely (optional but good for delete/toggle)
// For simplicity in this Server Component, we'll keep it simple or extract if complex interactivity needed.
// Since we have server actions, we can make small client components for buttons if we want instant feedback.
// For now, I'll inline a simple component that could be server-rendered but ideally should be interactive.
// Actually, let's make a small client component for the row actions to avoid full page refresh on every click if possible,
// but standard form actions work too.

function ProjectRow({ project }: { project: Project }) {
  return (
    <tr className="group hover:bg-white/[0.02] transition-colors">
      <td className="py-4 px-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-white/10 relative overflow-hidden border border-white/10">
            {project.thumbnail ? (
              <Image 
                src={project.thumbnail} 
                alt={project.title} 
                fill 
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white/20">
                <Palette size={20} />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{project.title}</p>
            <p className="text-xs text-white/40">/{project.slug}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <span className="text-sm text-white/60">
          {project.categories?.name || 'Uncategorized'}
        </span>
      </td>
      <td className="py-4 px-6">
        <span className="text-sm text-white/60">{project.year}</span>
      </td>
      <td className="py-4 px-6">
        <StatusBadge isPublished={project.is_published} />
      </td>
      <td className="py-4 px-6 text-right">
        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
          <form action={toggleProjectStatus.bind(null, project.id, project.is_published)}>
             <button title="Toggle Status" className="p-2 hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-white">
                {project.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
             </button>
          </form>
          <Link href={`/admin/projects/${project.id}`}>
            <button title="Edit" className="p-2 hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-blue-400">
              <Edit size={16} />
            </button>
          </Link>
          <form action={deleteProject.bind(null, project.id)}>
            <button title="Delete" className="p-2 hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-red-400">
              <Trash2 size={16} />
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span className={cn(
      "text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1.5",
      isPublished 
        ? "text-green-400 bg-green-400/10 border border-green-400/20" 
        : "text-white/40 bg-white/5 border border-white/10"
    )}>
      <span className={cn("w-1 h-1 rounded-full", isPublished ? "bg-green-400" : "bg-white/40")} />
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}


