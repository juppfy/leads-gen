import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

const CTA = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (user) return navigate("/app");
    setShowAuthModal(true);
  };

  return (
    <section className="py-20 px-6 bg-secondary">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-4xl lg:text-5xl font-extrabold">
          Get Your First 100 Users — the Smart Way
        </h2>
        <p className="text-xl text-muted-foreground">
          Join founders who are finding their early customers in conversations that are happening right now.
        </p>
        <Button size="lg" className="gap-2" onClick={handleStart}>
          Start Free
          <ArrowRight className="w-5 h-5" />
        </Button>
        <p className="text-sm text-muted-foreground">
          No credit card required • 14-day free trial
        </p>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => navigate("/app")}
      />
    </section>
  );
};

export default CTA;
