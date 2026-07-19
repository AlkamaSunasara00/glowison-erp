import React from "react";
import { useTheme } from "@/context/ThemeContext";
import Icons from "@/common/Icons";

export default function Appearance() {
  const { activeTheme, themes, changeTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      <div className="flex flex-col gap-4 rounded-lg">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Appearance</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              Personalize your workspace experience. Choose a primary color scheme that fits your brand or mood.
            </p>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm min-w-0">
          <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Color Themes</h2>
              <p className="text-xs font-medium text-gray-500 mt-1">Click on a theme card to instantly apply it globally.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-sm ring-1 ring-primary/20 uppercase tracking-wider">
               <Icons name="Sparkles" size={14} /> Live Preview
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
            {Object.entries(themes).map(([themeName, themeColors], index) => {
              const isActive = activeTheme === themeName;
              return (
                <div
                  key={themeName}
                  onClick={() => changeTheme(themeName)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={`
                    relative flex flex-col p-4 rounded-sm cursor-pointer transition-all duration-300 ease-out animate-fade-in-up
                    border overflow-hidden group/card
                    ${isActive 
                      ? 'border-primary ring-1 ring-primary shadow-sm bg-primary/5' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm hover:-translate-y-0.5'
                    }
                  `}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                     {/* Theme Color Gradient Circle */}
                     <div 
                       className={`w-10 h-10 rounded-sm flex-shrink-0 shadow-inner border-2 ${isActive ? 'border-primary' : 'border-white'} transition-all duration-300 group-hover/card:scale-105`}
                       style={{ 
                         background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.three} 100%)` 
                       }}
                     />
                     
                     {/* Active Checkmark */}
                     <div className={`transition-all duration-300 ${isActive ? 'opacity-100 scale-100 text-primary' : 'opacity-0 scale-50 text-gray-300'}`}>
                       <Icons name="CheckCircle2" size={20} />
                     </div>
                  </div>
                  
                  {/* Theme Name */}
                  <div className="mt-auto">
                     <span className={`font-bold text-sm block mb-1 tracking-tight capitalize ${isActive ? 'text-primary' : 'text-gray-900'}`}>
                       {themeName}
                     </span>
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
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
