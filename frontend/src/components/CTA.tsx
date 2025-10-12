import { ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

const faqs = [
  {
    q: "WHAT IS THIS PLATFORM FOR ?",
    a: "This is your direct line to the city for reporting non-emergency issues. You can use it to alert us about problems like potholes, broken streetlights, graffiti, missed trash collections, and park maintenance, all from your phone or computer.",
  },
  {
    q: "WHAT HAPPENS AFTER I SUBMIT A REPORT ?",
    a: "You'll receive a unique tracking number.Your report is routed to the correct city department (e.g., Public Works, Parks, etc.)The department reviews the issue and assigns a crew or takes appropriate action.You can check the status of your report anytime using your tracking number.",
  },
  {
    q: "WHAT INFORMATION DO I NEED TO PROVIDE ?",
    a: "To help us resolve your issue quickly, please provide  A precise location,A clear photo of the problem, A specific category, A detailed description.",
        
  },
  {
    q: "WHY IS PHOTO SO IMPORTANT?",
    a: "A picture is worth a thousand words! A photo helps our crews:Understand the exact problem and its severity.Identify what equipment or materials they might need before they arrive on site.Find the issue more easily",
  },
];

const FAQ = () => {
  const faqRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.add("animate-slide-in-left");
            el.classList.remove("opacity-0");
          } else {
            el.classList.remove("animate-slide-in-left");
            el.classList.add("opacity-0");
          }
        });
      },
      { threshold: 0.15 }
    );

    faqRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 bg-white text-slate-900">
      <div className="container">
        <h2 className="text-lg sm:text-3xl md:text-5xl lg:text-6xl font-extrabold uppercase mb-10 text-slate-900 text-center w-full whitespace-nowrap tracking-tight leading-none">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-8">
          {faqs.map((item, idx) => (
            <details
              key={idx}
              className="group rounded-3xl p-6 md:p-8 shadow-sm opacity-0"
              ref={(el) => (faqRefs.current[idx] = el)}
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary) / 0.06), hsl(var(--primary) / 0.10))",
                animationDelay: `${idx * 120}ms`,
              }}
            >
              <summary className="list-none flex items-center gap-6 cursor-pointer">
                <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <ChevronRight
                    className="w-5 h-5 transform transition-transform duration-300 group-open:rotate-90"
                    style={{ color: "hsl(var(--primary))" }}
                  />
                </span>
                <span
                  className="font-extrabold uppercase text-lg md:text-xl"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  {item.q}
                </span>
              </summary>

              <div className="mt-4 text-sm md:text-base text-slate-900 max-w-5xl overflow-hidden max-h-0 transition-[max-height] duration-300 ease-out group-open:max-h-[240px]">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;

