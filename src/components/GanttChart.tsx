import React, { useState } from 'react';
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ReferenceLine, 
} from 'recharts';
import { format, parseISO, isWithinInterval, addMinutes } from 'date-fns';
import { Diamond } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  category: string;
  start: string; // ISO date string
  end: string; // ISO date string
  dependencies?: string[];
  progress: number; // 0 to 100
  milestone?: boolean;
}

const taskData: Task[] = [
  {
    id: '1',
    name: 'Setup Development Environment',
    category: 'Setup',
    start: '2024-02-22T09:00',
    end: '2024-02-22T09:20',
    progress: 100,
  },
  {
    id: '2',
    name: 'Create Project Folder Structure',
    category: 'Setup',
    start: '2024-02-22T09:20',
    end: '2024-02-22T09:40',
    dependencies: ['1'],
    progress: 100,
  },
  {
    id: '3',
    name: 'Implement User Authentication System',
    category: 'Development',
    start: '2024-02-22T09:40',
    end: '2024-02-22T10:20',
    dependencies: ['2'],
    progress: 90,
  },
  {
    id: '4',
    name: 'Develop Home Page & Navigation System',
    category: 'Development',
    start: '2024-02-22T10:20',
    end: '2024-02-22T10:50',
    dependencies: ['3'],
    progress: 85,
  },
  {
    id: '5',
    name: 'Build Screen Time Tracking Functionality',
    category: 'Development',
    start: '2024-02-22T10:50',
    end: '2024-02-22T11:20',
    dependencies: ['4'],
    progress: 70,
  },
  {
    id: '6',
    name: 'Implement Alerts & Notifications System',
    category: 'Development',
    start: '2024-02-22T11:20',
    end: '2024-02-22T11:50',
    dependencies: ['5'],
    progress: 60,
  },
  {
    id: '7',
    name: 'Develop Screen Time Limit Settings',
    category: 'Development',
    start: '2024-02-22T11:50',
    end: '2024-02-22T12:20',
    dependencies: ['6'],
    progress: 50,
  },
  {
    id: '8',
    name: 'Implement Study & Bedtime Mode',
    category: 'Development',
    start: '2024-02-22T12:20',
    end: '2024-02-22T12:50',
    dependencies: ['7'],
    progress: 40,
  },
  {
    id: '9',
    name: 'Create Reports & Insights Page',
    category: 'Development',
    start: '2024-02-22T12:50',
    end: '2024-02-22T13:20',
    dependencies: ['8'],
    progress: 30,
  },
  {
    id: '10',
    name: 'Implement Parental Controls & Family Sharing',
    category: 'Development',
    start: '2024-02-22T13:20',
    end: '2024-02-22T13:50',
    dependencies: ['9'],
    progress: 20,
  },
  {
    id: '11',
    name: 'Develop App Restriction & Blocking Features',
    category: 'Development',
    start: '2024-02-22T13:50',
    end: '2024-02-22T14:20',
    dependencies: ['10'],
    progress: 10,
  },
  {
    id: '12',
    name: 'Configure Security & Data Privacy Features',
    category: 'Security',
    start: '2024-02-22T14:20',
    end: '2024-02-22T14:50',
    dependencies: ['11'],
    progress: 5,
  },
  {
    id: '13',
    name: 'Implement User Profile & Settings Management',
    category: 'Development',
    start: '2024-02-22T14:50',
    end: '2024-02-22T15:20',
    dependencies: ['12'],
    progress: 0,
  },
  {
    id: '14',
    name: 'Optimize App Performance & Reduce Size',
    category: 'Optimization',
    start: '2024-02-22T15:20',
    end: '2024-02-22T15:50',
    dependencies: ['13'],
    progress: 0,
  },
  {
    id: '15',
    name: 'Conduct Internal Testing & Debugging',
    category: 'Testing',
    start: '2024-02-22T15:50',
    end: '2024-02-22T16:20',
    dependencies: ['14'],
    progress: 0,
  },
  {
    id: '16',
    name: 'Project Completion',
    category: 'Milestone',
    start: '2024-02-22T16:20',
    end: '2024-02-22T16:20',
    dependencies: ['15'],
    progress: 0,
    milestone: true,
  }
];

// Convert tasks to a format suitable for Recharts
const prepareChartData = (tasks: Task[]) => {
  return tasks.map(task => {
    const startDate = parseISO(task.start);
    const endDate = parseISO(task.end);
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    
    return {
      id: task.id,
      name: task.name,
      category: task.category,
      startDate,
      endDate,
      startTime,
      endTime,
      duration: endTime - startTime,
      dependencies: task.dependencies || [],
      progress: task.progress,
      milestone: task.milestone || false
    };
  });
};

// Calculate time scale for the chart
const getTimeRange = (tasks: Task[]) => {
  const startDates = tasks.map(task => new Date(task.start).getTime());
  const endDates = tasks.map(task => new Date(task.end).getTime());
  
  const minTime = Math.min(...startDates);
  const maxTime = Math.max(...endDates);
  
  const startDate = new Date(minTime);
  const endDate = new Date(maxTime);
  
  return { 
    startDate, 
    endDate,
    startTime: minTime,
    endTime: maxTime
  };
};

// Generate time slots for the timeline
const generateTimeSlots = (startDate: Date, endDate: Date, intervalMinutes = 30) => {
  const slots = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    slots.push({
      time: currentDate.getTime(),
      label: format(currentDate, 'HH:mm')
    });
    currentDate = addMinutes(currentDate, intervalMinutes);
  }
  
  return slots;
};

const GanttChart = () => {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [draggingConnection, setDraggingConnection] = useState(false);
  
  const processedTasks = prepareChartData(taskData);
  const timeRange = getTimeRange(taskData);
  const timeSlots = generateTimeSlots(timeRange.startDate, timeRange.endDate, 30);
  
  // Current time reference line
  const currentTime = new Date().getTime();
  const showCurrentTime = isWithinInterval(
    new Date(currentTime),
    { start: timeRange.startDate, end: timeRange.endDate }
  );

  // Calculate chart config for colors
  const chartConfig = {
    task: { 
      color: "#4f46e5", 
      label: "Task" 
    },
    progress: { 
      color: "#818cf8", 
      label: "Progress" 
    },
    dependency: { 
      color: "#d1d5db", 
      label: "Dependency" 
    },
    milestone: { 
      color: "#ef4444", 
      label: "Milestone" 
    },
    currentTime: { 
      color: "#10b981", 
      label: "Current Time" 
    }
  };

  // Generate ticks for x-axis
  const generateTicks = () => {
    return timeSlots.map(slot => slot.time);
  };

  // Custom task formatter for bars
  const taskFormatter = (value: any, name: string, props: any) => {
    const task = processedTasks.find(t => t.id === props.payload.id);
    if (!task) return null;
    
    return (
      <div>
        <p className="font-semibold">{task.name}</p>
        <p className="text-xs text-gray-500">
          {format(task.startDate, 'HH:mm')} - {format(task.endDate, 'HH:mm')}
        </p>
        <p className="text-xs">Progress: {task.progress}%</p>
        <p className="text-xs">Category: {task.category}</p>
      </div>
    );
  };

  return (
    <div className="w-full border rounded-lg shadow-sm overflow-hidden">
      <h2 className="text-xl font-bold p-4 border-b">Project Schedule - February 22, 2024</h2>
      
      <div className="flex flex-col">
        {/* Time Slots Header - Fixed size to ensure alignment */}
        <div className="flex border-b">
          <div className="w-[280px] min-w-[280px] border-r p-2">
            <h3 className="font-semibold">Tasks</h3>
          </div>
          <div className="flex-1 flex">
            {timeSlots.map((slot, index) => (
              <div key={index} className="flex-1 px-1 py-1 text-center text-[10px] font-medium border-r whitespace-nowrap overflow-hidden">
                {slot.label}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col">
          {processedTasks.map((task, index) => (
            <div 
              key={task.id}
              className={`flex w-full hover:bg-muted/50 ${selectedTask === task.id ? 'bg-muted/80' : ''}`}
              onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
            >
              {/* Task Name Column */}
              <div className="w-[280px] min-w-[280px] border-r p-2 flex items-center">
                <div className="flex items-center gap-2 w-full">
                  <span className="text-xs font-medium w-[24px]">{task.id}</span>
                  {task.milestone ? 
                    <Diamond className="h-3 w-3 text-red-500 flex-shrink-0" /> : 
                    <div className={`h-2 w-2 rounded-sm flex-shrink-0 ${
                      task.category === 'Setup' ? 'bg-blue-500' : 
                      task.category === 'Security' ? 'bg-amber-500' : 
                      task.category === 'Testing' ? 'bg-green-500' : 
                      task.category === 'Optimization' ? 'bg-purple-500' : 
                      'bg-primary'
                    }`} />
                  }
                  <span className="text-xs truncate">{task.name}</span>
                </div>
              </div>
              
              {/* Gantt Bar Area */}
              <div className="flex-1 relative h-[30px] border-b">
                {/* Timeline Grid */}
                <div className="absolute inset-0 flex">
                  {timeSlots.map((_, i) => (
                    <div key={i} className="flex-1 border-r border-gray-100"></div>
                  ))}
                </div>
                
                {/* Task Bar */}
                <div
                  className="absolute h-[20px] top-[5px] rounded-sm"
                  style={{
                    left: `${((task.startTime - timeRange.startTime) / (timeRange.endTime - timeRange.startTime)) * 100}%`,
                    width: `${(task.duration / (timeRange.endTime - timeRange.startTime)) * 100}%`,
                    backgroundColor: task.milestone ? 
                      'transparent' : 
                      task.category === 'Setup' ? '#3b82f6' : 
                      task.category === 'Security' ? '#f59e0b' : 
                      task.category === 'Testing' ? '#10b981' : 
                      task.category === 'Optimization' ? '#8b5cf6' : 
                      '#4f46e5'
                  }}
                >
                  {task.milestone ? (
                    <div className="absolute left-0 top-[50%] transform -translate-y-1/2">
                      <Diamond className="h-5 w-5 text-red-500" />
                    </div>
                  ) : (
                    <>
                      {/* Progress Bar */}
                      <div 
                        className="h-full rounded-sm"
                        style={{
                          width: `${task.progress}%`,
                          backgroundColor: '#818cf8'
                        }}
                      ></div>
                      
                      {/* Task Label on Bar */}
                      <div className="absolute inset-0 flex items-center px-1 overflow-hidden">
                        <span className="text-[9px] text-white whitespace-nowrap">
                          {task.name} ({task.progress}%)
                        </span>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Task Time Display */}
                <div 
                  className="absolute top-[5px] text-[8px] text-gray-500 whitespace-nowrap"
                  style={{
                    left: `${((task.startTime - timeRange.startTime) / (timeRange.endTime - timeRange.startTime)) * 100}%`,
                    transform: 'translateX(-100%)'
                  }}
                >
                  {format(task.startDate, 'HH:mm')}
                </div>
                <div 
                  className="absolute top-[5px] text-[8px] text-gray-500 whitespace-nowrap"
                  style={{
                    left: `${((task.endTime - timeRange.startTime) / (timeRange.endTime - timeRange.startTime)) * 100}%`,
                    transform: 'translateX(4px)'
                  }}
                >
                  {format(task.endDate, 'HH:mm')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Dependencies visualization with draggable connections */}
      <svg 
        className="absolute top-0 left-0 w-full h-full pointer-events-none" 
        style={{ zIndex: 10 }}
      >
        {processedTasks.map((task, taskIndex) => {
          if (!task.dependencies?.length) return null;
          
          return task.dependencies.map(depId => {
            const dependencyTask = processedTasks.find(t => t.id === depId);
            const depIndex = processedTasks.findIndex(t => t.id === depId);
            
            if (!dependencyTask || depIndex < 0 || taskIndex < 0) return null;
            
            // Calculate positions based on chart dimensions
            const chartWidth = document.querySelector('.flex-1')?.clientWidth || 800;
            const rowHeight = 30;
            
            // Calculate Y coordinates (based on row positions)
            const depY = (depIndex * rowHeight) + 50; // Add header offset
            const taskY = (taskIndex * rowHeight) + 50;
            
            // Calculate X coordinates based on task time positions and chart width
            const leftOffset = 280; // Width of the task name column
            const depTaskEndX = leftOffset + ((dependencyTask.endTime - timeRange.startTime) / 
              (timeRange.endTime - timeRange.startTime)) * chartWidth;
            const taskStartX = leftOffset + ((task.startTime - timeRange.startTime) / 
              (timeRange.endTime - timeRange.startTime)) * chartWidth;
            
            // Path for curved dependency line
            const path = `
              M ${depTaskEndX} ${depY + 15}
              C ${depTaskEndX + 20} ${depY + 15},
                ${taskStartX - 20} ${taskY + 15},
                ${taskStartX} ${taskY + 15}
            `;
            
            return (
              <g key={`${task.id}-${depId}`} className="dependency-line">
                <path
                  d={path}
                  stroke="var(--color-dependency)"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  fill="none"
                  className="transition-all duration-300 hover:stroke-primary hover:stroke-2"
                />
                <text
                  x={(depTaskEndX + taskStartX) / 2}
                  y={(depY + taskY) / 2 + 10}
                  fontSize="8"
                  textAnchor="middle"
                  fill="var(--color-dependency)"
                  className="pointer-events-auto cursor-move"
                  onMouseDown={() => setDraggingConnection(true)}
                  onMouseUp={() => setDraggingConnection(false)}
                >
                  {format(dependencyTask.endDate, 'HH:mm')} → {format(task.startDate, 'HH:mm')}
                </text>
              </g>
            );
          });
        })}
      </svg>
      
      {/* Current Time Line */}
      {showCurrentTime && (
        <div 
          className="absolute top-[40px] bottom-0 border-l-2 border-dashed border-green-500 z-10"
          style={{
            left: `${280 + ((currentTime - timeRange.startTime) / (timeRange.endTime - timeRange.startTime)) * (document.querySelector('.flex-1')?.clientWidth || 800)}px`
          }}
        >
          <div className="bg-green-500 text-white text-[8px] px-1 rounded absolute -translate-x-1/2">Now</div>
        </div>
      )}
      
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-2 px-4 pb-2">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-sm bg-blue-500"></div>
          <span className="text-xs">Setup</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-sm bg-primary"></div>
          <span className="text-xs">Dev</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-sm bg-amber-500"></div>
          <span className="text-xs">Security</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-sm bg-purple-500"></div>
          <span className="text-xs">Optimize</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-sm bg-green-500"></div>
          <span className="text-xs">Testing</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-sm bg-indigo-400"></div>
          <span className="text-xs">Progress</span>
        </div>
        <div className="flex items-center gap-1">
          <Diamond className="h-3 w-3 text-red-500" />
          <span className="text-xs">Milestone</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 border-l-2 border-dashed border-green-500"></div>
          <span className="text-xs">Current Time</span>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
