import { activity } from "@/lib/repo";
import ActivityList from "@/components/ActivityList";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  await requireAdmin();
  const items = await activity.recent(200);
  return (
    <div>
      <h1 className="font-display font-semibold text-2xl">Activity</h1>
      <p className="mt-1 text-sm text-steel">The last 200 changes, and who made them.</p>
      <div className="mt-6">
        <ActivityList items={items} />
      </div>
    </div>
  );
}
