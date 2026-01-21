import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-conversations.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { useToast } from "@/hooks/use-toast";

const Hero = () => {
  const [url, setUrl] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isValidUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      setShowAuthModal(true);
    } else {
      navigate(`/app?url=${encodeURIComponent(url)}`);
    }
  };

  const handleAuthSuccess = () => {
    navigate(`/app?url=${encodeURIComponent(url)}`);
  };

  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Headline + Form */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
                Find People <span className="text-primary">Already Looking</span> for What You Built
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Paste your product URL and our AI finds Reddit conversations where people are asking for solutions like yours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                type="url"
                placeholder="https://yourproduct.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 h-14 text-base px-5 bg-input rounded-lg border-border"
                required
              />
              <Button type="submit" size="lg" className="gap-2">
                Find Leads
                <img src="https://cdn.brandfetch.io/idkKwm0IT0/theme/dark/id_jo7Lzsf.svg?c=1bxid64Mup7aczewSAYMX&t=1768324733367" alt="Reddit" className="w-5 h-5" />
              </Button>
            </form>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">✓</span>
                <span className="text-muted-foreground">Verified sources</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">⚙️</span>
                <span className="text-muted-foreground">AI-powered search</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">💬</span>
                <span className="text-muted-foreground">Real conversations</span>
              </div>
            </div>
          </div>

          {/* Right Column: Preview Cards */}
          <div className="relative">
            <div className="space-y-4">
              {/* Card 1 */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-foreground font-medium leading-relaxed">
                      "Anyone know a tool that can automate resume reviews? Need something that can scan and provide feedback..."
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium flex items-center gap-2">
                      <img
                        src="https://cdn.brandfetch.io/idkKwm0IT0/w/800/h/226/theme/dark/logo.webp?c=1bxid64Mup7aczewSAYMX&t=1721371498085"
                        alt="Reddit"
                        className="h-4 w-auto object-contain"
                      />
                      <span className="sr-only">Reddit</span>
                    </span>
                    <span className="text-muted-foreground">3 hours ago</span>
                    <span className="ml-auto text-primary font-semibold">12 new leads</span>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-foreground font-medium leading-relaxed">
                      "Looking for recommendations: What's the best platform for finding early users for a B2B SaaS product?"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium flex items-center gap-2">
                      <img
                        src="https://cdn.brandfetch.io/idkKwm0IT0/w/800/h/226/theme/dark/logo.webp?c=1bxid64Mup7aczewSAYMX&t=1721371498085"
                        alt="Reddit"
                        className="h-4 w-auto object-contain"
                      />
                      <span className="sr-only">Reddit</span>
                    </span>
                    <span className="text-muted-foreground">1 day ago</span>
                    <span className="ml-auto text-primary font-semibold">8 new leads</span>
                  </div>
                </div>
              </div>

              {/* Background Image */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-10">
                <img src={heroImage} alt="" className="w-full h-full object-cover rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </section>
  );
};

export default Hero;
