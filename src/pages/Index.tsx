import { MainLayout } from "@/components/layout/MainLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentCustomersTable } from "@/components/dashboard/RecentCustomersTable";
import { Calendar } from "lucide-react";

const Index = () => {
  // Dados zerados - aguardando integração real com banco de dados
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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>Dashboard</h1>
            <p className="text-sm" style={{ color: 'var(--subtext)' }}>Visão geral das suas vendas e métricas</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-card/50 border border-border/50 rounded-xl hover:bg-card hover:border-primary/30 transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-primary/5" style={{ color: 'var(--text)' }}>
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Selecionar período</span>
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
