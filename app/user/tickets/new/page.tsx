import { TicketCreateForm } from "@/components/forms/ticket-create-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";

export default function NewTicketPage() {
  return (
    <>
      <PageHeader
        eyebrow="New Ticket"
        title="Submit an IT Ticket"
        description="Describe the issue clearly so the IT team can investigate and respond quickly."
      />
      <Card className="max-w-3xl">
        <TicketCreateForm />
      </Card>
    </>
  );
}
