// app/(home)/components/AboutSectionAsync.jsx
// Server component — fetches its own data, streams in via Suspense

import { connectDB } from '@/lib/mongodb';
import About from '@/models/About';
import { serialize } from '../page';
import AboutSection from './AboutSection';

async function getAbout() {
  try {
    await connectDB();
    const about = await About.findOne()
      .select(
        // Adjust to your actual About schema fields — exclude any base64 image fields
        'title subtitle description highlights mission vision createdAt'
        // ↑ NO image fields — load via /api/about/image if needed
      )
      .lean();
    return serialize(about) || {};
  } catch (err) {
    console.error('[AboutSectionAsync] fetch error:', err);
    return {};
  }
}

export default async function AboutSectionAsync() {
  const about = await getAbout();
  return <AboutSection about={about} />;
}
