"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProject, toggleProjectStatus } from "@/actions/projects";

export default function ProjectRowActions({
  projectId,
  isPublished,
}: {
  projectId: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onToggle() {
    startTransition(async () => {
      const res = await toggleProjectStatus(projectId, isPublished);
      if (res?.error) {
        toast.error(`Failed to update status: ${res.error}`);
        return;
      }
      toast.success(isPublished ? "Moved to draft" : "Published");
      router.refresh();
    });
  }

  function onDelete() {
    const ok = window.confirm("Delete this project? This cannot be undone.");
    if (!ok) return;

    startTransition(async () => {
      const res = await deleteProject(projectId);
      if (res?.error) {
        toast.error(`Delete failed: ${res.error}`);
        return;
      }
      toast.success("Project deleted");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
      <button
        type="button"
        title="Toggle Status"
        onClick={onToggle}
        disabled={isPending}
        className="p-2 hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-white disabled:opacity-40"
      >
        {isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>
      <button
        type="button"
        title="Delete"
        onClick={onDelete}
        disabled={isPending}
        className="p-2 hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-red-400 disabled:opacity-40"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
