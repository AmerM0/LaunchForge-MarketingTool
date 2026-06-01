import { LeadsGenerator } from "@/components/leads/LeadsGenerator";

export const metadata = { title: "Lead Finder — AI Brand Architect" };

export default function LeadsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <LeadsGenerator />
    </div>
  );
}
