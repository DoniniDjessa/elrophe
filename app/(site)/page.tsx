import BestSellers from '@/components/site/BestSellers';
import CategoryGrid from '@/components/site/CategoryGrid';
import FeaturedProduct from '@/components/site/FeaturedProduct';
import Hero from '@/components/site/Hero';
import Ingredients from '@/components/site/Ingredients';
import Newsletter from '@/components/site/Newsletter';
import Philosophy from '@/components/site/Philosophy';
import Ritual from '@/components/site/Ritual';
import Testimonials from '@/components/site/Testimonials';
import { getCategories, getIngredients, getProducts, getSettings, getTestimonials } from '@/lib/data';

export default async function HomePage() {
  const [settings, categories, products, testimonials, ingredients] = await Promise.all([
    getSettings(),
    getCategories(),
    getProducts(),
    getTestimonials(),
    getIngredients(),
  ]);
  const { hero, sections } = settings;

  return (
    <>
      <Hero hero={hero} />
      {sections.featured.visible && <FeaturedProduct data={sections.featured} products={products} categories={categories} />}
      {sections.categories.visible && <CategoryGrid categories={categories} title={sections.categories.title} linkLabel={sections.categories.link_label} />}
      {sections.bestsellers.visible && products.length > 0 && <BestSellers products={products} heading={sections.bestsellers} />}
      {sections.philosophy.visible && <Philosophy data={sections.philosophy} />}
      {sections.ritual.visible && <Ritual data={sections.ritual} />}
      {sections.ingredients.visible && <Ingredients items={ingredients} heading={sections.ingredients} />}
      {sections.testimonials.visible && <Testimonials items={testimonials} heading={sections.testimonials} />}
      {sections.newsletter.visible && <Newsletter data={sections.newsletter} />}
    </>
  );
}
