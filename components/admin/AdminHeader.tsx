"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import Image from "next/image";

export default function AdminHeader({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  
  // Get current page title based on path
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 1) return "Dashboard";
    
    const lastSegment = segments[segments.length - 1];
    // Capitalize and remove hyphens
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <header className="h-20 px-6 md:px-10 border-b border-white/5 bg-[#050505] flex items-center justify-between sticky top-0 z-30">
      {/* Page Title */}
      <div className="flex flex-col justify-center">
        <h1 className="text-xl font-light text-white">{getPageTitle()}</h1>
        <p className="text-xs text-white/40 font-light mt-0.5">Overview & Management</p>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/5 focus-within:border-white/20 transition-colors">
          <Search size={16} className="text-white/40" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30 w-48"
          />
        </div>

        {/* Notifications */}
        <button className="relative text-white/60 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm text-white font-medium">Admin</p>
            <p className="text-xs text-white/40">{userEmail || 'admin@raylodies.com'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 overflow-hidden">
             <Image 
               src="/personal-img.jpg" 
               alt="Admin" 
               width={40} 
               height={40} 
               className="object-cover w-full h-full"
             />
          </div>
        </div>
      </div>
    </header>
  );
}


