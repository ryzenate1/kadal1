import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export function DashboardHeader({
  title,
  description,
  actions,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1 min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900 truncate">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>
      {actions && (
        <div className="flex-shrink-0 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}

export function DashboardHeaderWithAddButton({
  title,
  description,
  buttonLabel,
  onClick,
}: DashboardHeaderProps & {
  buttonLabel: string;
  onClick: () => void;
}) {
  return (
    <DashboardHeader
      title={title}
      description={description}
      actions={
        <Button 
          onClick={onClick}
          className="w-full sm:w-auto h-10 sm:h-9 text-sm touch-target"
          size="sm"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          <span className="truncate">{buttonLabel}</span>
        </Button>
      }
    />
  );
}