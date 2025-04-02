
import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  colorVariant?: "default" | "success" | "warning";
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  colorVariant = "default",
  size = "md",
  animate = true,
}: ProgressBarProps) {
  const getBarClass = () => {
    let classes = "";
    
    // Size variants
    if (size === "sm") classes += "h-1.5 ";
    else if (size === "md") classes += "h-2.5 ";
    else if (size === "lg") classes += "h-3 ";
    
    // Color variants
    if (colorVariant === "success") classes += "bg-green-500 ";
    else if (colorVariant === "warning") classes += "bg-yellow-500 ";
    
    return classes;
  };

  const getHeightClass = () => {
    if (size === "sm") return "h-1.5";
    if (size === "md") return "h-2.5";
    return "h-3";
  };

  // Create custom indicator styles
  const indicatorStyles = {
    '--progress-width': `${value}%`,
    // Apply color variants to the indicator style
    backgroundColor: colorVariant === "success" 
      ? "var(--green-500, #22c55e)" 
      : colorVariant === "warning" 
        ? "var(--yellow-500, #eab308)" 
        : undefined
  } as React.CSSProperties;

  return (
    <div className="w-full space-y-1.5">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-sm font-medium">{label}</span>}
          {showPercentage && (
            <span className="text-sm text-muted-foreground">{Math.round(value)}%</span>
          )}
        </div>
      )}
      <Progress 
        value={value} 
        className={`${getHeightClass()} ${animate ? 'animate-progress-fill' : ''}`}
        style={indicatorStyles}
      />
    </div>
  );
}
