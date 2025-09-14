import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick,
  className 
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center justify-center p-8 rounded-lg",
        "bg-card border border-border transition-all duration-200",
        "hover:bg-card-hover hover:border-primary/30 hover:shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        className
      )}
    >
      <div className="mb-4 p-4 rounded-lg bg-surface group-hover:bg-surface-hover transition-colors">
        <Icon className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <h3 className="text-base font-medium text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground text-center">{description}</p>
      )}
      <div className="absolute inset-0 rounded-lg bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </button>
  );
};

export default WorkflowCard;