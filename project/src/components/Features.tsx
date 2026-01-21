import { MessageSquare, Target, TrendingUp } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Discover conversations asking for your solution",
    description:
      "Our AI scans thousands of discussions daily to find people actively looking for products like yours.",
  },
  {
    icon: Target,
    title: "Engage directly from your dashboard",
    description:
      "Get instant notifications and respond to relevant conversations before your competitors do.",
  },
  {
    icon: TrendingUp,
    title: "Get smarter over time with AI feedback",
    description:
      "Our AI learns from your engagement patterns to surface increasingly relevant leads.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-extrabold">
          Why Choose Leads Finder
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stop cold outreach. Start warm conversations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-card border border-border rounded-lg p-8 space-y-4 hover:border-primary transition-colors"
              >
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
