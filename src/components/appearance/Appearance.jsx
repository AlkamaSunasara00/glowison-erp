import React from "react";
import { useTheme } from "@/context/ThemeContext";
import Icons from "@/common/Icons";

export default function Appearance() {
  const { activeTheme, themes, changeTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen w-full relative bg-transparent overflow-hidden pb-20">
      
      {/* PREMIUM HERO HEADER */}
      <div className="relative overflow-hidden bg-transparent border-b border-gray-200/60 shadow-sm shrink-0">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-gradient-to-bl from-pink-500/10 via-rose-500/5 to-transparent rounded-bl-full -z-10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-gradient-to-tr from-orange-500/10 to-transparent rounded-tr-full -z-10 blur-3xl" />
        
        <div className="max-w-5xl mx-auto px-6 py-10 lg:px-8">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30 ring-1 ring-white/20">
              <Icons name="Palette" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Appearance</h1>
              <p className="mt-1.5 text-sm font-medium text-gray-500 max-w-xl">
                Personalize your workspace experience. Choose a primary color scheme that fits your brand or mood.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 animate-fade-in-up">
        
        <div className="bg-transparent p-8 rounded-2xl border border-gray-200/60 shadow-sm group hover:shadow-md transition-all duration-300">
          <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Color Themes</h2>
              <p className="text-xs font-medium text-gray-500 mt-1">Click on a theme card to instantly apply it globally.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1.5 rounded-full ring-1 ring-pink-500/20">
               <Icons name="Sparkles" size={14} /> Live Preview
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-2">
            {Object.entries(themes).map(([themeName, themeColors], index) => {
              const isActive = activeTheme === themeName;
              return (
                <div
                  key={themeName}
                  onClick={() => changeTheme(themeName)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={`
                    relative flex flex-col p-5 rounded-2xl cursor-pointer transition-all duration-300 ease-out animate-fade-in-up
                    border overflow-hidden group/card
                    ${isActive 
                      ? 'border-transparent ring-2 ring-primary ring-offset-2 bg-gradient-to-b from-primary/5 to-transparent shadow-md scale-[1.02]' 
                      : 'border-gray-200 bg-transparent hover:border-gray-300 hover:shadow-lg hover:-translate-y-1'
                    }
                  `}
                >
                  {/* Decorative background for active */}
                  {isActive && (
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />
                  )}

                  <div className="flex items-center justify-between w-full mb-4">
                     {/* Theme Color Gradient Circle */}
                     <div 
                       className={`w-12 h-12 rounded-full flex-shrink-0 shadow-inner border-2 ${isActive ? 'border-primary' : 'border-white'} transition-all duration-300 group-hover/card:scale-110`}
                       style={{ 
                         background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.three} 100%)` 
                       }}
                     />
                     
                     {/* Active Checkmark */}
                     <div className={`transition-all duration-300 ${isActive ? 'opacity-100 scale-100 text-primary' : 'opacity-0 scale-50 text-gray-300'}`}>
                       <Icons name="CheckCircle2" size={24} />
                     </div>
                  </div>
                  
                  {/* Theme Name */}
                  <div className="mt-auto">
                     <span className={`font-bold text-base block mb-1 tracking-tight capitalize ${isActive ? 'text-primary' : 'text-gray-900'}`}>
                       {themeName}
                     </span>
                     <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                       {isActive ? 'Active Theme' : 'Click to apply'}
                     </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}
