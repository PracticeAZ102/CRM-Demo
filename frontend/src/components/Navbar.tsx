import { ShieldCheck, User } from 'lucide-react';

interface NavbarProps {
  pageTitle: string;
  pageSubtitle: string;
}

export const Navbar = ({ pageTitle, pageSubtitle }: NavbarProps) => {
  return (
    <header className="h-16 bg-white border-b border-[#e2e8f0] px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div>
        <h1 className="text-lg font-bold text-[#000000]">{pageTitle}</h1>
        <p className="text-xs text-[#7a8794] font-medium">{pageSubtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Branch / Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-[#e2e8f0] rounded-full text-xs">
          <span className="w-2 h-2 rounded-full bg-[#6aa84f] animate-pulse"></span>
          <span className="font-semibold text-[#2e4350]">Noida HQ (North Zone)</span>
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#e2e8f0]">
          <div className="w-8 h-8 rounded-full bg-[#2986cc]/10 text-[#2986cc] flex items-center justify-center font-bold text-xs border border-[#2986cc]/20">
            <User size={16} />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-[#000000] flex items-center gap-1">
              Rajesh Sharma
              <ShieldCheck size={13} className="text-[#2986cc]" />
            </div>
            <div className="text-[10px] text-[#7a8794] font-medium">Super Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};
