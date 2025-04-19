import { useState, useEffect } from "react";
import { Cpu, HardDrive, Wifi } from "lucide-react";
import MetricCard from "./MetricCard";
 
const SystemMetrics = () => {
  const [cpuUsage, setCpuUsage] = useState(42);
  const [memoryUsage, setMemoryUsage] = useState(68);
  const [networkStatus, setNetworkStatus] = useState(92);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 30) + 30);
      setMemoryUsage(Math.floor(Math.random() * 20) + 60);
      setNetworkStatus(Math.floor(Math.random() * 15) + 80);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        title="CPU Usage"
        value={cpuUsage}
        icon={Cpu}
        trend="up"
        color="cyan"
        detail="System Performance"
      />
      <MetricCard
        title="Memory"
        value={memoryUsage}
        icon={HardDrive}
        trend="stable"
        color="purple"
        detail="RAM Usage"
      />
      <MetricCard
        title="Network"
        value={networkStatus}
        icon={Wifi}
        trend="down"
        color="blue"
        detail="Connectivity"
      />
    </div>
  );
};

export default SystemMetrics;
