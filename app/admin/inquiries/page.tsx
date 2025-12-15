import { getInquiries, getInquiryStats } from "@/actions/inquiries";
import { MessageSquare, Mail, Clock, CheckCircle } from "lucide-react";
import InquiryActions from "@/components/admin/inquiries/InquiryActions";

export default async function InquiriesPage() {
  const [inquiries, stats] = await Promise.all([
    getInquiries(),
    getInquiryStats()
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-white">Inquiries</h1>
        <p className="text-sm text-white/40 mt-1">
          Manage project inquiries from potential clients
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-white/40">Total Inquiries</p>
              <p className="text-2xl font-light text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-white/40">New / Pending</p>
              <p className="text-2xl font-light text-white">{stats.new}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/40">Responded</p>
              <p className="text-2xl font-light text-white">{stats.responded}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        {inquiries.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-white/20" />
            <p className="text-white/40">No inquiries yet</p>
          </div>
        ) : (
          inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="bg-white/[0.02] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg text-white font-light">{inquiry.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      inquiry.status === 'new' 
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : inquiry.status === 'responded'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-white/5 text-white/40'
                    }`}>
                      {inquiry.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-white/40">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {inquiry.email}
                    </span>
                    {inquiry.company && (
                      <span>• {inquiry.company}</span>
                    )}
                    {inquiry.project_type && (
                      <span>• {inquiry.project_type}</span>
                    )}
                    {inquiry.budget && (
                      <span>• Budget: {inquiry.budget}</span>
                    )}
                  </div>
                  
                  <p className="text-sm text-white/60 leading-relaxed">
                    {inquiry.message}
                  </p>
                  
                  <p className="text-xs text-white/30">
                    {new Date(inquiry.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <InquiryActions inquiry={inquiry} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
