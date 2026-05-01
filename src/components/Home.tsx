import Hero from "./Hero";
import FeatureCards from "./FeatureCards";
import HowItWorks from "./HowItWorks";
import Dashboard from "./Dashboard";
import ImageGenerator from "./ImageGenerator";
import FAQ from "./FAQ";
import Pricing from "./Pricing";
import Testimonials from "./Testimonials";
import Footer from "./Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeatureCards />
      <HowItWorks />
      <ImageGenerator />
      <Dashboard />
      <Pricing />
      <Testimonials />
      <FAQ />
    </main>
  );
}
