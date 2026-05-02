import { useEffect } from "react";
import Hero from "./Hero";
import FeatureCards from "./FeatureCards";
import HowItWorks from "./HowItWorks";
import Dashboard from "./Dashboard";
import FAQ from "./FAQ";
import Pricing from "./Pricing";
import Testimonials from "./Testimonials";
import Footer from "./Footer";

export default function Home() {
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
            });
          }, 100);
        }
      }
    };

    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, []);

  return (
    <main>
      <Hero />
      <FeatureCards />
      <HowItWorks />
      <Dashboard />
      <Pricing />
      <Testimonials />
      <FAQ />
    </main>
  );
}
