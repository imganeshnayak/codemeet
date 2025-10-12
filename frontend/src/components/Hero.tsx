import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent"></div>
      </div>

      {/* Hero Content - Bottom Left Positioning */}
      <div className="relative z-10 h-full flex items-end">
        <div className="container pb-20 md:pb-32">
          <div className="max-w-3xl animate-fade-in-slow">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white text-shadow leading-tight">
              Transform Issues
              <br />
              Into Action
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl mb-8 text-white/90 text-shadow font-light max-w-2xl">
              A cinematic platform for intelligent issue tracking and resolution.
              Beautiful, intuitive, and powerful.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button
                  variant="hero"
                  size="lg"
                  className="text-base md:text-lg px-8 py-6 h-auto"
                >
                  Get Started
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base md:text-lg px-8 py-6 h-auto bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white"
                >
                  <Play className="mr-2" />
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
