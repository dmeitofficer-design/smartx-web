import { connectDB } from '@/lib/mongodb';
import Team from '@/models/Team';
import TeamSection from '../components/TeamSection'; // Adjust relative import based on your tree placement

export const dynamic = 'force-dynamic';

const stringifyAndClean = (data) => {
  if (!data) return null;
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (key === '_id' && value) return value.toString();
    return value;
  }));
};

async function getTeamData() {
  await connectDB();
  const team = await Team.find({ published: true }).sort({ order: 1 }).lean();
  return stringifyAndClean(team) || [];
}

export default async function TeamPage() {
  const teamData = await getTeamData();

  return (
    <main className="pt-24">
      <TeamSection team={teamData} />
    </main>
  );
}