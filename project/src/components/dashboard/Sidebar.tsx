import { Search, History, Settings, LogOut, Menu, X, Boxes, CalendarClock, MoreVertical, CreditCard, User, BadgeDollarSign } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  onViewSearch: () => void;
  onViewHistory: () => void;
  currentView: string;
}

export function Sidebar({ onViewSearch, onViewHistory, currentView }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    { icon: Search, label: "Search", action: onViewSearch, view: "search" },
    { icon: History, label: "History", action: onViewHistory, view: "history" },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <img 
              src="https://res.cloudinary.com/dd6vlwblr/image/upload/v1768977783/freepik-untitled-project-20260121064146PScQ_xovwf0.png" 
              alt="Leads Finder Logo" 
              className="h-8"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (!item.disabled) {
                      item.action();
                      setIsOpen(false);
                    }
                  }}
                  disabled={item.disabled}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors text-left
                    ${isActive
                      ? "bg-primary text-white"
                      : item.disabled
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.disabled && (
                    <span className="ml-auto text-xs">Soon</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer with user + menu */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.displayName || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <details className="relative group">
                  <summary className="list-none cursor-pointer p-2 rounded-md hover:bg-gray-100">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </summary>
                <div className="absolute right-0 bottom-full mb-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                  <button
                    onClick={handleSignOut}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </details>
              </div>
          </div>
        </div>
      </aside>
    </>
  );
}


