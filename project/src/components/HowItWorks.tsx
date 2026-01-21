import { Link, Search, Sparkles } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: Link,
    title: "Paste your URL",
    description: "We analyze your product's keywords and understand what problems you solve.",
  },
  {
    number: "2",
    icon: Search,
    title: "AI finds conversations",
    description: "We scan Reddit, LinkedIn, Facebook, and X for relevant discussions in real-time.",
  },
  {
    number: "3",
    icon: Sparkles,
    title: "Get your leads",
    description: "View curated posts and engage directly with potential customers asking for your solution.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-extrabold">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to start finding your first users
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-card border border-border rounded-lg p-8 space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                    {step.number}
                  </div>
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
