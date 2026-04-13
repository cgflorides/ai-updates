import NewsDashboard from "@/components/NewsDashboard";
import { getNewsBundle } from "@/lib/news";

export default async function HomePage() {
  const data = await getNewsBundle();

  return <NewsDashboard initialData={data} />;
}
