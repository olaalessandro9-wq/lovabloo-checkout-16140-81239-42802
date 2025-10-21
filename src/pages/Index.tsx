import { MainLayout } from "@/components/layout/MainLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentCustomersTable } from "@/components/dashboard/RecentCustomersTable";
import { Calendar } from "lucide-react";

const Index = () => {
  // Mock data para os gráficos
  const faturamentoData = [
    { date: "07/07", value: 0 },
    { date: "21/07", value: 0 },
    { date: "05/08", value: 0 },
    { date: "19/08", value: 0 },
    { date: "03/09", value: 0 },
    { date: "17/09", value: 680 },
    { date: "01/10", value: 0 },
    { date: "20/10", value: 0 },
  ];

  const taxasData = [
    { date: "07/07", value: 0 },
    { date: "21/07", value: 0 },
    { date: "05/08", value: 0 },
    { date: "19/08", value: 0 },
    { date: "03/09", value: 0 },
    { date: "17/09", value: 0 },
    { date: "01/10", value: 0 },
    { date: "20/10", value: 22 },
  ];

  const emailsData = [
    { date: "07/07", value: 0 },
    { date: "21/07", value: 0 },
    { date: "05/08", value: 0 },
    { date: "19/08", value: 0 },
    { date: "03/09", value: 0 },
    { date: "17/09", value: 0 },
    { date: "01/10", value: 0 },
    { date: "20/10", value: 20 },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">1de jul - 20 de out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Faturamento" value="R$ 915,80" showEye={false} />
          <MetricCard title="Vendas aprovadas" value="R$ 497,66" showEye={false} />
          <MetricCard title="Vendas pendentes" value="R$ 418,14" showEye={false} />
          <MetricCard title="Taxas" value="R$ 21,83" showEye={false} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Checkouts Iniciados (IC)" value={41} showEye={false} />
          <MetricCard title="Total de Vendas Aprovadas" value={23} showEye={false} />
          <MetricCard title="Total de Vendas Pendentes" value={18} showEye={false} />
          <MetricCard title="Período" value="01/07 - 20/10" showEye={false} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RevenueChart title="Faturamento" data={faturamentoData} />
          <RevenueChart title="Taxas" data={taxasData} />
          <RevenueChart title="E-mails" data={emailsData} />
        </div>

        <RecentCustomersTable />
      </div>
    </MainLayout>
  );
};

export default Index;
