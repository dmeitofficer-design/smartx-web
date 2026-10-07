import { connectDB } from '@/lib/mongodb';
import About from '@/models/About';
import AboutSection from '../components/AboutSection'; // Adjust relative import based on your tree placement

export const dynamic = 'force-dynamic';

const stringifyAndClean = (data) => {
  if (!data) return null;
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (key === '_id' && value) return value.toString();
    return value;
  }));
};

async function getAboutData() {
  await connectDB();
  const about = await About.findOne().lean();
  return stringifyAndClean(about) || {};
}

export default async function AboutPage() {
  const aboutData = await getAboutData();
  
  return (
    <main>
      <AboutSection about={aboutData} />
    </main>
  );
}