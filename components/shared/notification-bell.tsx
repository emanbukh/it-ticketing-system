import Link from "next/link";
import { markAllNotificationsReadAction } from "@/lib/actions/notifications";
import { getUnreadCount, getUserNotifications } from "@/lib/notifications";
import { formatDate } from "@/lib/utils";

export async function NotificationBell({ userId }: { userId: string }) {
  const [items, unread] = await Promise.all([
    getUserNotifications(userId, 8),
    getUnreadCount(userId),
  ]);

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-soft">
        <span>🔔 Notifications</span>
        {unread > 0 ? (
          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">{unread}</span>
        ) : null}
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <p className="text-sm font-semibold text-slate-900">Recent</p>
          {unread > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <button type="submit" className="text-xs font-medium text-blue-600 hover:underline">
                Mark all read
              </button>
            </form>
          ) : null}
        </div>
        <div className="mt-2 max-h-80 space-y-2 overflow-auto">
          {items.length === 0 ? (
            <p className="px-2 py-4 text-sm text-slate-500">No notifications yet.</p>
          ) : (
            items.map((n) => {
              const content = (
                <div className={`rounded-xl p-3 ${n.readAt ? "bg-slate-50" : "bg-blue-50"}`}>
                  <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{n.body}</p>
                  <p className="mt-2 text-[11px] text-slate-400">{formatDate(n.createdAt)}</p>
                </div>
              );
              return n.link ? (
                <Link key={n.id} href={n.link} className="block">
                  {content}
                </Link>
              ) : (
                <div key={n.id}>{content}</div>
              );
            })
          )}
        </div>
      </div>
    </details>
  );
}
