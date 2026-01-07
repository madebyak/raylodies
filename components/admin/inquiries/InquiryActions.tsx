"use client";

import { useState } from "react";
import {
  updateInquiryStatus,
  deleteInquiry,
  Inquiry,
} from "@/actions/inquiries";
import { MoreVertical, CheckCircle, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function InquiryActions({ inquiry }: { inquiry: Inquiry }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleMarkResponded = async () => {
    setIsLoading(true);
    const result = await updateInquiryStatus(inquiry.id, "responded");
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Marked as responded");
      router.refresh();
    }
    setIsOpen(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;

    setIsLoading(true);
    const result = await deleteInquiry(inquiry.id);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Inquiry deleted");
      router.refresh();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        disabled={isLoading}
      >
        <MoreVertical className="w-5 h-5 text-white/40" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-[#111] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden">
            <a
              href={`mailto:${inquiry.email}`}
              className="flex items-center gap-2 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Reply via Email
            </a>
            {inquiry.status !== "responded" && (
              <button
                onClick={handleMarkResponded}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-white/60 hover:text-green-400 hover:bg-white/5 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Responded
              </button>
            )}
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-white/60 hover:text-red-400 hover:bg-white/5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
