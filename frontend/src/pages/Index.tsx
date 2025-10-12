
import React, { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";


const Index = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/home")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.message || "Failed to load home page data");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load home page data");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-32">Loading...</div>;
  if (error) return <div className="text-center py-32 text-red-500">{error}</div>;

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
