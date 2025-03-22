
import GanttChart from "@/components/GanttChart";

const Index = () => {
  return (
    <div className="bg-background p-4">
      <div className="mx-auto">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Screen Time App Development Project</h1>
          <p className="text-sm text-muted-foreground">
            Project schedule for February 22, 2024
          </p>
        </div>
        
        <GanttChart />
      </div>
    </div>
  );
};

export default Index;
