
import { Cpu, Headphones, Layout, BarChart } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "AI FEATURES",
    description:
      "AI-assisted messaging, voice notes and analytics to help you manage and prioritize reports.",
  },
  {
    icon: Headphones,
    title: "24/7 SERVICE",
    description:
      "Always-on support ensures urgent civic issues are acknowledged and routed immediately.",
  },
  {
    icon: Layout,
    title: "DASHBOARD",
    description:
      "A clean dashboard with filters, analytics and status tracking to monitor issue resolution.",
  },
  {
    icon: BarChart,
    title: "SMART REPORTING",
    description:
      "Customizable reports and automated alerts to keep stakeholders informed and proactive.",
  },
];

const Features = () => {
  return (
    <section className="py-24 md:py-32 bg-card">
      <div className="container">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
            Civic Issue Reporting
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Report common civic issues quickly — include a location, a short
            description and we'll route it to the right department.
          </p>
        </div>

        {/* Grid: 1 col mobile, 2 cols md, 4 cols lg (keeps spacing like image but with 4 items)
            Each card matches the image: icon inside white rounded square, bold uppercase heading,
            muted paragraph. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-start text-left animate-fade-in"
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                    <Icon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold uppercase mb-3 text-purple-800">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground max-w-sm leading-relaxed">
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
