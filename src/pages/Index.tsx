import { MainLayout } from "@/components/layout/MainLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentCustomersTable } from "@/components/dashboard/RecentCustomersTable";
import { Calendar } from "lucide-react";

const Index = () => {
  // Dados zerados - aguardando dados reais do banco
  const emptyChartData = [
    { date: "01/01", value: 0 },
    { date: "15/01", value: 0 },
    { date: "01/02", value: 0 },
    { date: "15/02", value: 0 },
    { date: "01/03", value: 0 },
    { date: "15/03", value: 0 },
    { date: "01/04", value: 0 },
    { date: "15/04", value: 0 },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Selecionar período</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Faturamento" value="R$ 0,00" showEye={false} />
          <MetricCard title="Vendas aprovadas" value="R$ 0,00" showEye={false} />
          <MetricCard title="Vendas pendentes" value="R$ 0,00" showEye={false} />
          <MetricCard title="Taxas" value="R$ 0,00" showEye={false} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Checkouts Iniciados" value={0} showEye={false} />
          <MetricCard title="Total de Vendas Aprovadas" value={0} showEye={false} />
          <MetricCard title="Total de Vendas Pendentes" value={0} showEye={false} />
          <MetricCard title="Taxa de Conversão" value="0%" showEye={false} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RevenueChart title="Faturamento" data={emptyChartData} />
          <RevenueChart title="Taxas" data={emptyChartData} />
          <RevenueChart title="E-mails" data={emptyChartData} />
        </div>

        <RecentCustomersTable />
      </div>
    </MainLayout>
  );
};

export default Index;
