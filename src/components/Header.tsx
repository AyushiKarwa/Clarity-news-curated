
import React, { useState } from 'react';
import { ViewState, UserProfile } from '../types';
import { Menu, BellOff, Newspaper, LogOut, User } from 'lucide-react';

interface HeaderProps {
  view: ViewState;
  setView: (view: ViewState) => void;
  userProfile: UserProfile | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ view, setView, userProfile, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(ViewState.FEED)}>
          <div className="bg-brand-600 text-white p-1.5 rounded-lg">
            <Newspaper size={20} />
          </div>
          <span className="text-xl font-serif font-bold text-slate-900 tracking-tight">Clarity</span>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
           <button 
             onClick={() => setView(ViewState.FEED)}
             className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === ViewState.FEED ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Curated Feed
           </button>
           <button 
             onClick={() => setView(ViewState.DASHBOARD)}
             className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === ViewState.DASHBOARD ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Detox Dashboard
           </button>
           <button 
             onClick={() => setView(ViewState.PROFILE)}
             className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === ViewState.PROFILE ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Profile
           </button>
        </nav>

        <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Detox Status</span>
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                    <BellOff size={14} /> Active
                </span>
             </div>
             
             <div className="relative">
                 <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="h-8 w-8 rounded-full bg-amber-200 shadow-inner flex items-center justify-center text-black text-xs font-bold hover:ring-2 hover:ring-offset-2 hover:ring-amber-300 transition-all overflow-hidden"
                 >
                    {userProfile?.profileImage ? (
                        <img src={userProfile.profileImage} alt={userProfile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                        userProfile ? getInitials(userProfile.name) : 'G'
                    )}
                 </button>

                 {showProfileMenu && (
                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 animate-fade-in">
                         <div className="px-4 py-3 border-b border-slate-50">
                             <p className="text-xs text-slate-400 font-medium uppercase">Signed in as</p>
                             <p className="text-sm font-bold text-slate-900 truncate">{userProfile?.name}</p>
                         </div>
                         <button 
                            onClick={() => {
                                setView(ViewState.PROFILE);
                                setShowProfileMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                         >
                             <User size={16} /> Profile Settings
                         </button>
                         {onLogout && (
                             <button 
                                onClick={() => {
                                    onLogout();
                                    setShowProfileMenu(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                             >
                                 <LogOut size={16} /> Reset / Logout
                             </button>
                         )}
                     </div>
                 )}
             </div>
             
             <button className="md:hidden text-slate-600">
                 <Menu size={24} />
             </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
