
import React, { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";


const defaultData = {
  hero: {
    title: 'Report issues. Track progress. Make a difference.',
    subtitle: 'Smart, simple civic reporting for your community',
    cta: 'Get Started',
  },
  features: [
    { title: 'Report', description: 'Quickly report issues in your neighborhood.' },
    { title: 'Track', description: 'Monitor progress as issues are resolved.' },
    { title: 'Engage', description: 'Connect with your community and officials.' },
  ],
  howItWorks: [
    { title: 'Report an Issue', description: 'Describe the problem and attach photos.' },
    { title: 'Assign & Track', description: 'Officials receive and act on reports.' },
    { title: 'Resolve & Close', description: 'See the resolution and close the loop.' },
  ],
};

const Index = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch('/api/home')
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;
        if (json && json.success && json.data) {
          setData(json.data);
        } else if (json && json.data) {
          setData(json.data);
        } else {
          // fallback to default if API returns unexpected shape
          setData(defaultData);
        }
      })
      .catch(() => {
        // On any fetch error, use static fallback so the homepage still renders
        if (mounted) setData(defaultData);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="text-center py-32">Loading...</div>;
  if (!data) return <div className="text-center py-32 text-red-500">Failed to load home page</div>;

  return (
    <main className="min-h-screen">
      <Hero hero={data.hero} />
      <Features features={data.features} />
      <HowItWorks steps={data.howItWorks} />
      <CTA />
      <Footer />
    </main>
  );
};

export default Index;
