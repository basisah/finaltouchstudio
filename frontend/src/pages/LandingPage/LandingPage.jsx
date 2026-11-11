import PageLayout from "../../components/layout/PageLayout";
import { useCatalog } from "../../hooks/useCatalog";
import Hero from "./sections/Hero";
import Occasions from "./sections/Occasions";
import FeaturedRentals from "./sections/FeaturedRentals";
import Packages from "./sections/Packages";
import HowItWorks from "./sections/HowItWorks";
import Stats from "./sections/Stats";
import Gallery from "./sections/Gallery";
import Testimonials from "./sections/Testimonials";
import Contact from "./sections/Contact";

/**
 * Home page. Sections render in this order; add, remove or reorder them here.
 * The catalogue is loaded once and handed to the sections that need it.
 */
export default function LandingPage() {
  const { items, categories, loading } = useCatalog();

  return (
    <PageLayout overlayNav>
      <Hero items={items} categories={categories} />
      <Occasions categories={categories} loading={loading} />
      <FeaturedRentals items={items} categories={categories} loading={loading} />
      <Packages />
      <HowItWorks />
      <Stats />
      <Gallery />
      <Testimonials />
      <Contact />
    </PageLayout>
  );
}
