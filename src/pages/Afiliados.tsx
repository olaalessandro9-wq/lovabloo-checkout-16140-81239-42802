import { MainLayout } from "@/components/layout/MainLayout";
import { Users } from "lucide-react";

const Afiliados = () => {
  // Lista zerada - aguardando dados reais do banco
  const afiliados: any[] = [];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Afiliados</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus afiliados e comissões
          </p>
        </div>

        {afiliados.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Nenhum afiliado cadastrado
            </h2>
            <p className="text-muted-foreground max-w-md">
              Quando você tiver afiliados cadastrados no sistema, eles aparecerão aqui com suas métricas de desempenho.
            </p>
          </div>
        ) : (
          <div>
            {/* Tabela de afiliados virá aqui quando houver dados */}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Afiliados;
