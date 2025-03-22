
import GanttChart from "@/components/GanttChart";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Project Management Gantt Chart</h1>
          <p className="text-muted-foreground">
            Timeline visualization for the Screen Time App development project
          </p>
        </div>
        
        <GanttChart />
      </div>
    </div>
  );
};

export default Index;
