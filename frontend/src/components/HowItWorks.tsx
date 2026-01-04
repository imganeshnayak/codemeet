
import { iconMap } from "@/lib/iconMap";
import { useEffect, useRef } from "react";

type HowItWorksProps = {
  steps: Array<{
    icon: string;
    number: string;
    title: string;
    description: string;
  }>;
};

const HowItWorks = ({ steps }: HowItWorksProps) => {
  const stepsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.add("animate-slide-in-left");
          } else {
            el.classList.remove("animate-slide-in-left");
          }
        });
      },
      { threshold: 0.15 }
    );

    stepsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-background to-card">
      <div className="container px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-20 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
            Simple, Yet Powerful
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Three steps to transform your issue management workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 md:gap-8">
          {steps.map((step, index) => {
            const Icon = iconMap[step.icon] || iconMap["file-text"];
            return (
              <div
                key={index}
                className="relative px-4 sm:px-0"
                ref={(el) => (stepsRef.current[index] = el)}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="text-center">
                  <div className="mb-4 sm:mb-6 inline-flex flex-col items-center">
                    <span className="text-5xl sm:text-6xl md:text-7xl font-bold text-primary/20 mb-3 sm:mb-4">
                      {step.number}
                    </span>
                    <div className="p-4 sm:p-6 rounded-2xl bg-primary/10 border border-primary/20 hover:border-primary/40 smooth-transition group hover:scale-105">
                      <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">{step.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connecting Line (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-20 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/40 to-transparent"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
