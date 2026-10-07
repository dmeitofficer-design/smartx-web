import { connectDB } from '@/lib/mongodb';
import Hero    from '@/models/Hero';
import About   from '@/models/About';
import Product from '@/models/Product';
import Team    from '@/models/Team';
import SiteSettings from '@/models/SiteSettings';

import HeroSection     from './components/HeroSection';
import AboutSection    from './components/AboutSection';
import ProductsSection from './components/ProductsSection';
import TeamSection     from './components/TeamSection';
import ContactSection  from './components/ContactSection';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getHomeData() {
  try {
    await connectDB();
    const [hero, about, products, team, settings] = await Promise.all([
      Hero.findOne().lean(),
      About.findOne().lean(),
      Product.find({ published: true }).sort({ order: 1, createdAt: -1 }).lean(),
      Team.find({ published: true }).sort({ order: 1 }).lean(),
      SiteSettings.findOne().lean(),
    ]);
    const s = (d) => d ? JSON.parse(JSON.stringify(d)) : {};
    return {
      hero:     s(hero),
      about:    s(about),
      products: products ? JSON.parse(JSON.stringify(products)) : [],
      team:     team     ? JSON.parse(JSON.stringify(team))     : [],
      settings: s(settings),
    };
  } catch {
    return { hero: {}, about: {}, products: [], team: [], settings: {} };
  }
}

export default async function HomePage() {
  const { hero, about, products, team, settings } = await getHomeData();
  return (
    <main>
      <HeroSection     hero={hero} />
     
      <ProductsSection products={products} />
       <AboutSection    about={about} />
      <TeamSection     team={team} />
      <ContactSection  settings={settings} />
    </main>
  );
}
