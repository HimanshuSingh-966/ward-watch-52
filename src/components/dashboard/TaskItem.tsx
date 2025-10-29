import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Pill, Heart, Droplet, Utensils, FlaskConical, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

type TaskType = 'medication' | 'vitals' | 'bath' | 'meal' | 'investigation' | 'procedure';

interface TaskItemProps {
  type: TaskType;
  taskType?: string;
  itemName?: string;
  scheduledTime: string;
  details: any;
  isCompleted: boolean;
  isDueSoon: boolean;
  isOverdue: boolean;
  onComplete: (completed: boolean) => void;
}

const taskIcons = {
  medication: Pill,
  vitals: Heart,
  bath: Droplet,
  meal: Utensils,
  investigation: FlaskConical,
  procedure: Stethoscope,
};

const taskLabels = {
  medication: 'Medication',
  vitals: 'Vital Signs',
  bath: 'Bathing',
  meal: 'Meal',
  investigation: 'Investigation',
  procedure: 'Procedure',
};

export const TaskItem = ({ 
  type, 
  taskType,
  itemName,
  scheduledTime, 
  details, 
  isCompleted, 
  isDueSoon, 
  isOverdue,
  onComplete 
}: TaskItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = taskIcons[type] || Pill;
  const label = taskType || taskLabels[type] || 'Task';
  
  const getStatusColor = () => {
    if (isCompleted) return 'bg-success/10 border-success/30';
    if (isOverdue) return 'bg-destructive/10 border-destructive/30';
    if (isDueSoon) return 'bg-warning/10 border-warning/30';
    return 'bg-muted/50 border-border';
  };

  const getStatusDot = () => {
    if (isCompleted) return 'bg-success';
    if (isOverdue) return 'bg-destructive';
    if (isDueSoon) return 'bg-warning';
    return 'bg-muted-foreground';
  };

  return (
    <div className={cn('border rounded-lg overflow-hidden transition-all', getStatusColor())}>
      <div 
        className="p-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={cn('h-2 w-2 rounded-full', getStatusDot())} />
            <Icon className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-base">{label}</span>
                {itemName && <span className="text-sm text-muted-foreground">• {itemName}</span>}
                {isCompleted && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success font-medium">
                    Completed
                  </span>
                )}
                {isOverdue && !isCompleted && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive font-medium">
                    Overdue
                  </span>
                )}
                {isDueSoon && !isCompleted && !isOverdue && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning font-medium">
                    Due Soon
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Scheduled: {scheduledTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={isCompleted}
              onCheckedChange={onComplete}
              onClick={(e) => e.stopPropagation()}
            />
            <Button variant="ghost" size="sm">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t bg-card/50">
          <div className="space-y-2 text-sm">
            {type === 'medication' && details && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Medication:</span>
                  <span className="font-medium">{details.medication_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dosage:</span>
                  <span className="font-medium">{details.dosage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route:</span>
                  <span className="font-medium">{details.route_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frequency:</span>
                  <span className="font-medium">{details.frequency}</span>
                </div>
              </>
            )}
            {type === 'investigation' && details && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investigation:</span>
                  <span className="font-medium">{details.investigation_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frequency:</span>
                  <span className="font-medium">{details.frequency}</span>
                </div>
              </>
            )}
            {type === 'procedure' && details && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Procedure:</span>
                  <span className="font-medium">{details.procedure_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frequency:</span>
                  <span className="font-medium">{details.frequency}</span>
                </div>
              </>
            )}
            {type === 'vitals' && (
              <p className="text-muted-foreground">Record temperature, BP, heart rate, respiratory rate, and oxygen saturation.</p>
            )}
            {type === 'bath' && (
              <p className="text-muted-foreground">Assist patient with bathing and personal hygiene.</p>
            )}
            {type === 'meal' && (
              <p className="text-muted-foreground">Ensure patient receives and consumes prescribed meal.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
