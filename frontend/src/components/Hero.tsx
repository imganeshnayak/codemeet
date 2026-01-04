
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

type HeroProps = {
  hero: {
    title: string;
    subtitle: string;
    cta: string;
  };
};

const Hero = ({ hero }: HeroProps) => {
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
  {/* Dark gradient overlay (top black -> transparent) to match design */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
      </div>

      {/* Hero Content - Bottom Left Positioning */}
      <div className="relative z-10 h-full flex items-end">
        <div className="container px-4 sm:px-6 pb-12 sm:pb-20 md:pb-32">
          <div className="max-w-3xl animate-fade-in-slow">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-bold mb-6 text-white text-shadow leading-tight">
              A Smart Platform that bridges Citizens and Authorities.
              <br />
              Report.Track.Resolve.
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-8 text-white/90 text-shadow font-light max-w-2xl">
              Empowering citizens with a smart, transparent, and collaborative platform for civic issue reporting and resolution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button
                  variant="hero"
                  size="lg"
                  className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto w-full sm:w-auto"
                >
                  {hero.cta}
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto w-full bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white"
                >
                  <Play className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  Login
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
