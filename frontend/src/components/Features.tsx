
import { iconMap } from "@/lib/iconMap";

type FeaturesProps = {
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
};

const Features = ({ features }: FeaturesProps) => {
  return (
    <section className="py-24 md:py-32 bg-card">
      <div className="container">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
            Built for Modern Teams
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage issues efficiently and elegantly
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || iconMap["zap"];
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-background border border-border hover:border-primary/50 smooth-transition animate-fade-in hover:shadow-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-6 inline-flex p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 smooth-transition">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
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
