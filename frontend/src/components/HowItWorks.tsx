import { FileText, Search, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: FileText,
    number: "01",
    title: "Report",
    description: "Submit issues with rich media, context, and automatic categorization.",
  },
  {
    icon: Search,
    number: "02",
    title: "Track",
    description: "Monitor progress in real-time with visual dashboards and smart notifications.",
  },
  {
    icon: CheckCircle,
    number: "03",
    title: "Resolve",
    description: "Close the loop with automated workflows and satisfaction tracking.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-background to-card">
      <div className="container">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
            Simple, Yet Powerful
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Three steps to transform your issue management workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="text-center">
                <div className="mb-6 inline-flex flex-col items-center">
                  <span className="text-6xl md:text-7xl font-bold text-primary/20 mb-4">
                    {step.number}
                  </span>
                  <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 hover:border-primary/40 smooth-transition group hover:scale-105">
                    <step.icon className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connecting Line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/40 to-transparent"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
