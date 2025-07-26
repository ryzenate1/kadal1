"use client";

import { DashboardHeaderWithAddButton } from '@/components/dashboard/dashboard-header';
import { TrustedBadgeManager } from '@/components/admin/TrustedBadgeManager';
import { ApiStatus } from '@/components/dashboard/api-status';

export default function TrustedBadgesPage() {
  return (
    <div>
      <DashboardHeaderWithAddButton
        title="Trusted Badges"
        description="Manage the trusted badges shown on the client website homepage."
        buttonLabel="Add Badge"
        onClick={() => {}}
      />
      
      {/* API Connection Status */}
      <ApiStatus endpoint="trusted-badges" />
      
      <div className="mt-6">
        <TrustedBadgeManager />
      </div>
    </div>
  );
}