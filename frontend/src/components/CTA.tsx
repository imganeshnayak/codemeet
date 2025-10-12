import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-br from-primary/5 via-accent/5 to-background relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }}></div>
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            Ready to Transform
            <br />
            Your Workflow?
          </h2>
          <p className="text-lg md:text-2xl text-muted-foreground mb-12 font-light max-w-2xl mx-auto">
            Join thousands of teams who've revolutionized their issue management with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="glow"
              size="lg"
              className="text-base md:text-lg px-10 py-7 h-auto"
            >
              Start Free Trial
              <ArrowRight className="ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base md:text-lg px-10 py-7 h-auto hover:bg-accent/10"
            >
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-8">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
