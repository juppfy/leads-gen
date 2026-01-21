import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (user) {
      navigate("/app");
      return;
    }
    setShowAuthModal(true);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="https://res.cloudinary.com/dd6vlwblr/image/upload/v1768977783/freepik-untitled-project-20260121064146PScQ_xovwf0.png" 
            alt="Leads Finder Logo" 
            className="h-8"
          />
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-foreground hover:text-primary transition-colors font-medium">
            Features
          </a>
          <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors font-medium">
            How It Works
          </a>
          <a href="#opensource" className="text-foreground hover:text-primary transition-colors font-medium">
            Open Source
          </a>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button variant="ghost" className="hidden md:inline-flex" onClick={() => navigate("/app")}>
                Dashboard
              </Button>
              <Button variant="outline" onClick={() => signOut()}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="hidden md:inline-flex" onClick={handleAuthClick}>
                Login
              </Button>
              <Button onClick={handleAuthClick}>
                Start for free
              </Button>
            </>
          )}
        </div>
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => navigate("/app")}
      />
    </>
  );
};

export default Navbar;
