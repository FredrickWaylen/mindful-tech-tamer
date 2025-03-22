
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
          <div className="w-[200px] min-w-[200px] border-r p-2">
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
        
        <div className="flex">
          {/* Tasks List - Fixed width */}
          <div className="w-[200px] min-w-[200px] border-r max-h-[600px]">
            <div className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px] text-xs p-2">ID</TableHead>
                    <TableHead className="text-xs p-2">Task</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedTasks.map((task) => (
                    <TableRow 
                      key={task.id} 
                      className={`hover:bg-muted/80 ${selectedTask === task.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                      style={{ height: '38px' }}
                    >
                      <TableCell className="font-medium text-xs p-2">{task.id}</TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center gap-1">
                          {task.milestone ? 
                            <Diamond className="h-3 w-3 text-red-500" /> : 
                            <div className={`h-2 w-2 rounded-sm ${
                              task.category === 'Setup' ? 'bg-blue-500' : 
                              task.category === 'Security' ? 'bg-amber-500' : 
                              task.category === 'Testing' ? 'bg-green-500' : 
                              task.category === 'Optimization' ? 'bg-purple-500' : 
                              'bg-primary'
                            }`} />
                          }
                          <span className="truncate text-xs max-w-[120px]">{task.name}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          {/* Gantt Chart - Takes remaining width */}
          <div className="flex-1 relative p-0">
            <div className="h-[600px]">
              <ChartContainer 
                config={chartConfig} 
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={processedTasks}
                    layout="vertical"
                    margin={{ top: 20, right: 30, bottom: 20, left: 0 }}
                    barSize={16}
                  >
                    <XAxis
                      type="number"
                      dataKey="startTime"
                      domain={[timeRange.startTime, timeRange.endTime]}
                      tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                      ticks={generateTicks()}
                      stroke="#888"
                      fontSize={10}
                      tickMargin={5}
                    />
                    <YAxis
                      type="category"
                      dataKey="id"
                      hide
                    />
                    
                    {/* Render task bars */}
                    <Bar
                      dataKey="duration"
                      fill="var(--color-task)"
                      background={{ fill: '#eee' }}
                      radius={[4, 4, 4, 4]}
                      shape={(props: any) => {
                        const { x, y, width, height, payload } = props;
                        const task = processedTasks.find(t => t.id === payload.id);
                        
                        if (task?.milestone) {
                          // Render milestone as diamond
                          return (
                            <g>
                              <polygon
                                points={`${x},${y + height/2} ${x + 8},${y} ${x + 16},${y + height/2} ${x + 8},${y + height}`}
                                fill="var(--color-milestone)"
                              />
                              <text
                                x={x + width + 4}
                                y={y + height/2 + 4}
                                fill="#333"
                                fontSize="10"
                                textAnchor="start"
                              >
                                {task.name}
                              </text>
                            </g>
                          );
                        }
                        
                        // Regular task bar with color based on category
                        let fill = "#4f46e5"; // Default color
                        if (task) {
                          if (task.category === 'Setup') fill = "#3b82f6"; // Blue
                          else if (task.category === 'Security') fill = "#f59e0b"; // Amber
                          else if (task.category === 'Testing') fill = "#10b981"; // Green
                          else if (task.category === 'Optimization') fill = "#8b5cf6"; // Purple
                        }
                        
                        return (
                          <g>
                            <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} ry={4} />
                            
                            {/* Progress overlay */}
                            {task && task.progress > 0 && (
                              <rect 
                                x={x} 
                                y={y} 
                                width={width * (task.progress / 100)} 
                                height={height} 
                                fill="var(--color-progress)"
                                rx={4} 
                                ry={4}
                              />
                            )}
                            
                            {/* Task label on bar if wide enough */}
                            {width > 50 && (
                              <text
                                x={x + 4}
                                y={y + height/2 + 4}
                                fill="#fff"
                                fontSize="9"
                                textAnchor="start"
                              >
                                {task?.name.substring(0, Math.floor(width/6))}
                                {task && task.name.length > Math.floor(width/6) ? "..." : ""}
                              </text>
                            )}
                          </g>
                        );
                      }}
                    />
                    
                    {/* Current time reference line */}
                    {showCurrentTime && (
                      <ReferenceLine
                        x={currentTime}
                        stroke="var(--color-currentTime)"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        label={{
                          value: 'Now',
                          position: 'top',
                          fill: 'var(--color-currentTime)',
                          fontSize: 10
                        }}
                      />
                    )}
                    
                    <ChartTooltip
                      content={
                        <ChartTooltipContent 
                          formatter={taskFormatter}
                        />
                      }
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              
              {/* Dependencies visualization with draggable connections */}
              <svg 
                className="absolute top-0 left-0 w-full h-full pointer-events-none" 
                style={{ zIndex: 10 }}
              >
                {processedTasks.map(task => {
                  if (!task.dependencies?.length) return null;
                  
                  return task.dependencies.map(depId => {
                    const dependencyTask = processedTasks.find(t => t.id === depId);
                    if (!dependencyTask) return null;
                    
                    // Calculate task positions based on their index
                    const taskIndex = processedTasks.findIndex(t => t.id === task.id);
                    const depIndex = processedTasks.findIndex(t => t.id === depId);
                    
                    if (taskIndex < 0 || depIndex < 0) return null;
                    
                    // Calculate task coordinates for drawing dependency lines
                    const depY = depIndex * 38 + 38;
                    const taskY = taskIndex * 38 + 38;
                    
                    // Calculate X coordinates based on task time positions
                    const depTaskEndX = 200 + ((dependencyTask.endTime - timeRange.startTime) / 
                      (timeRange.endTime - timeRange.startTime)) * (window.innerWidth - 250);
                    const taskStartX = 200 + ((task.startTime - timeRange.startTime) / 
                      (timeRange.endTime - timeRange.startTime)) * (window.innerWidth - 250);
                    
                    // Path for curved dependency line
                    const path = `
                      M ${depTaskEndX} ${depY}
                      C ${depTaskEndX + 20} ${depY},
                        ${taskStartX - 20} ${taskY},
                        ${taskStartX} ${taskY}
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
                          y={(depY + taskY) / 2 - 5}
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
            </div>
          </div>
        </div>
      </div>
      
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
