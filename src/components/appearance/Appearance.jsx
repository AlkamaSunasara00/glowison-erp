import React from "react";
import { useTheme } from "@/context/ThemeContext";
import Icons from "@/common/Icons";

export default function Appearance() {
  const { activeTheme, themes, changeTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4 p-4">
      <div className="flex flex-col gap-4 rounded-lg max-w-5xl">
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header">Appearance Settings</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              Customize the color palette and look of Glowison ERP.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Color Themes</h2>
            <p className="text-sm text-gray-500 mb-2">Select a primary color scheme for your workspace.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
            {Object.entries(themes).map(([themeName, themeColors]) => {
              const isActive = activeTheme === themeName;
              return (
                <div
                  key={themeName}
                  onClick={() => changeTheme(themeName)}
                  className={`
                    relative flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200
                    border bg-white
                    ${isActive ? 'border-primary ring-2 ring-primary/20 bg-secondary' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}
                  `}
                >
                  {/* Theme Color Gradient Circle */}
                  <div 
                    className="w-10 h-10 rounded-full mr-3 flex-shrink-0 shadow-inner border border-black/5"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.three} 100%)` 
                    }}
                  />
                  
                  {/* Theme Name */}
                  <span className={`font-medium text-sm ${isActive ? 'text-primary' : 'text-gray-700'}`}>
                    {themeName}
                  </span>

                  {/* Active Checkmark */}
                  {isActive && (
                    <div className="absolute top-2 right-2 text-primary">
                      <Icons name="CheckCircle2" size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}
