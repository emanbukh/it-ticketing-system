import { Role } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate, initials } from "@/lib/utils";

type Reply = {
  id: string;
  message: string;
  createdAt: Date;
  senderRole: Role;
  sender: {
    name: string;
  };
};

type ConversationThreadProps = {
  replies: Reply[];
};

export function ConversationThread({ replies }: ConversationThreadProps) {
  if (!replies.length) {
    return (
      <Card className="border-dashed border-slate-200">
        <p className="text-sm text-slate-500">No replies yet. The conversation will appear here.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {replies.map((reply) => {
        const isAdmin = reply.senderRole === Role.ADMIN;

        return (
          <div
            key={reply.id}
            className={`flex gap-3 ${isAdmin ? "md:justify-end" : "md:justify-start"}`}
          >
            {!isAdmin ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-sm font-semibold text-slate-700">
                {initials(reply.sender.name)}
              </div>
            ) : null}
            <div
              className={`max-w-2xl rounded-3xl px-5 py-4 shadow-soft ${
                isAdmin
                  ? "bg-gradient-to-br from-navy to-blue-700 text-white"
                  : "bg-white text-slate-900"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className={`text-sm font-semibold ${isAdmin ? "text-white" : "text-slate-900"}`}>
                  {reply.sender.name}
                </p>
                <Badge
                  className={
                    isAdmin
                      ? "bg-white/10 text-blue-50 ring-white/20"
                      : "bg-slate-100 text-slate-700 ring-slate-200"
                  }
                >
                  {isAdmin ? "Admin" : "User"}
                </Badge>
              </div>
              <div
                className={`prose prose-sm mt-3 max-w-none ${isAdmin ? "prose-invert text-blue-50" : "text-slate-600"}`}
                dangerouslySetInnerHTML={{ __html: reply.message }}
              />
              <p className={`mt-3 text-xs ${isAdmin ? "text-blue-100" : "text-slate-400"}`}>
                {formatDate(reply.createdAt)}
              </p>
            </div>
            {isAdmin ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-sm font-semibold text-blue-700">
                IT
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
