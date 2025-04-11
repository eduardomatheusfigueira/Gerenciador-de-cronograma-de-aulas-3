import React, { useState, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { Agendamento } from '../interfaces/Agendamento';

// Define types for report results (can be refined later)
type EducadorReportItem = { educador: string; horas: string; totalAgendamentos: number; oficinasMinistradas: number; ultimosAgendamentos: any[] };
type OficinaReportItem = { oficina: string; cargaHoraria: number; totalAgendamentos: number; horasMinistradas: string; educadores: number; turmas: number };
type TurmaReportItem = { data: string; oficina: string; horario: string; educador: string };

const RelatoriosPage: React.FC = () => {
  const { dados, isLoading } = useData();

  // State for filters
  const [educadorPeriodo, setEducadorPeriodo] = useState<'todos' | 'mes' | 'semana'>('todos');
  const [oficinaPeriodo, setOficinaPeriodo] = useState<'todos' | 'mes' | 'semana'>('todos');
  const [turmaIdFiltro, setTurmaIdFiltro] = useState<string>('');
  const [turmaPeriodo, setTurmaPeriodo] = useState<'todos' | 'mes' | 'semana'>('todos');

  // State for report results
  const [educadorReport, setEducadorReport] = useState<EducadorReportItem[] | null>(null);
  const [oficinaReport, setOficinaReport] = useState<OficinaReportItem[] | null>(null);
  const [turmaReport, setTurmaReport] = useState<{ turmaNome: string; totalHoras: string; totalOficinas: number; totalEducadores: number; totalDias: number; cronograma: TurmaReportItem[] } | null>(null);

  // --- Helper Function to Filter by Period ---
  const filtrarAgendamentosPorPeriodo = useCallback((agendamentos: Agendamento[], periodo: 'todos' | 'mes' | 'semana'): Agendamento[] => {
    if (periodo === 'todos') return agendamentos;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    let inicioPeriodo: Date;
    let fimPeriodo: Date;

    if (periodo === 'semana') {
      inicioPeriodo = new Date(hoje);
      inicioPeriodo.setDate(hoje.getDate() - hoje.getDay());
      inicioPeriodo.setHours(0, 0, 0, 0);
      fimPeriodo = new Date(inicioPeriodo);
      fimPeriodo.setDate(inicioPeriodo.getDate() + 6);
      fimPeriodo.setHours(23, 59, 59, 999);
    } else { // mes
      inicioPeriodo = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      fimPeriodo = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      fimPeriodo.setHours(23, 59, 59, 999);
    }

    return agendamentos.filter(a => {
      const dataAgendamento = new Date(a.data + 'T00:00:00');
      return dataAgendamento >= inicioPeriodo && dataAgendamento <= fimPeriodo;
    });
  }, []);


  // --- Report Generation Logic ---

  const gerarRelatorioEducador = useCallback(() => {
    const agendamentosFiltrados = filtrarAgendamentosPorPeriodo(dados.agendamentos, educadorPeriodo);
    const horasPorEducador: EducadorReportItem[] = [];

    dados.educadores.forEach(educador => {
      const agendamentosEducador = agendamentosFiltrados.filter(a => a.educadorId === educador.id);
      if (agendamentosEducador.length > 0) {
        let totalMinutos = 0;
        let oficinasMinistradas = new Set<number>();
        let ultimosAgendamentos: any[] = []; // Simplified for now

        agendamentosEducador.sort((a, b) => new Date(`${b.data}T${b.horaInicio}`).getTime() - new Date(`${a.data}T${a.horaInicio}`).getTime());

        agendamentosEducador.forEach(agendamento => {
          const inicio = new Date(`2000-01-01T${agendamento.horaInicio}`);
          const fim = new Date(`2000-01-01T${agendamento.horaFim}`);
          if (inicio < fim) {
            totalMinutos += (fim.getTime() - inicio.getTime()) / (1000 * 60);
          }
          oficinasMinistradas.add(agendamento.oficinaId);
          // Get last 3 (simplified)
          if (ultimosAgendamentos.length < 3) {
             const oficina = dados.oficinas.find(o => o.id === agendamento.oficinaId);
             ultimosAgendamentos.push({ data: agendamento.data, oficina: oficina?.nome || '?', horario: `${agendamento.horaInicio}-${agendamento.horaFim}` });
          }
        });

        horasPorEducador.push({
          educador: educador.nome,
          horas: (totalMinutos / 60).toFixed(1),
          totalAgendamentos: agendamentosEducador.length,
          oficinasMinistradas: oficinasMinistradas.size,
          ultimosAgendamentos
        });
      }
    });
    setEducadorReport(horasPorEducador.sort((a, b) => parseFloat(b.horas) - parseFloat(a.horas)));
  }, [dados.agendamentos, dados.educadores, dados.oficinas, educadorPeriodo, filtrarAgendamentosPorPeriodo]);

  const gerarRelatorioOficinas = useCallback(() => {
     const agendamentosFiltrados = filtrarAgendamentosPorPeriodo(dados.agendamentos, oficinaPeriodo);
     const statsOficina: OficinaReportItem[] = [];

     dados.oficinas.forEach(oficina => {
         const agendamentosOficina = agendamentosFiltrados.filter(a => a.oficinaId === oficina.id);
         if (agendamentosOficina.length > 0) {
             let totalMinutos = 0;
             let educadoresUnicos = new Set<number>();
             let turmasUnicas = new Set<number>();

             agendamentosOficina.forEach(agendamento => {
                 const inicio = new Date(`2000-01-01T${agendamento.horaInicio}`);
                 const fim = new Date(`2000-01-01T${agendamento.horaFim}`);
                 if (inicio < fim) {
                     totalMinutos += (fim.getTime() - inicio.getTime()) / (1000 * 60);
                 }
                 educadoresUnicos.add(agendamento.educadorId);
                 turmasUnicas.add(agendamento.turmaId);
             });

             statsOficina.push({
                 oficina: oficina.nome,
                 cargaHoraria: oficina.cargaHoraria,
                 totalAgendamentos: agendamentosOficina.length,
                 horasMinistradas: (totalMinutos / 60).toFixed(1),
                 educadores: educadoresUnicos.size,
                 turmas: turmasUnicas.size
             });
         }
     });
     setOficinaReport(statsOficina.sort((a, b) => b.totalAgendamentos - a.totalAgendamentos));
  }, [dados.agendamentos, dados.oficinas, oficinaPeriodo, filtrarAgendamentosPorPeriodo]);

  const gerarRelatorioTurma = useCallback(() => {
      if (!turmaIdFiltro) {
          setTurmaReport(null); // Clear report if no turma selected
          alert("Selecione uma turma para gerar o relatório.");
          return;
      }
      const turmaNumId = parseInt(turmaIdFiltro, 10);
      const agendamentosFiltrados = filtrarAgendamentosPorPeriodo(dados.agendamentos, turmaPeriodo)
                                      .filter(a => a.turmaId === turmaNumId);

      if (agendamentosFiltrados.length === 0) {
          setTurmaReport(null);
          alert("Nenhum agendamento encontrado para esta turma no período selecionado.");
          return;
      }

      const turma = dados.turmas.find(t => t.id === turmaNumId);
      let totalMinutos = 0;
      const oficinasUnicas = new Set<number>();
      const educadoresUnicos = new Set<number>();
      const diasComOficinas = new Set<string>();
      const cronograma: TurmaReportItem[] = [];

      agendamentosFiltrados.sort((a, b) => new Date(`${a.data}T${a.horaInicio}`).getTime() - new Date(`${b.data}T${b.horaInicio}`).getTime());

      agendamentosFiltrados.forEach(agendamento => {
          const inicio = new Date(`2000-01-01T${agendamento.horaInicio}`);
          const fim = new Date(`2000-01-01T${agendamento.horaFim}`);
          if (inicio < fim) {
              totalMinutos += (fim.getTime() - inicio.getTime()) / (1000 * 60);
          }
          oficinasUnicas.add(agendamento.oficinaId);
          educadoresUnicos.add(agendamento.educadorId);
          diasComOficinas.add(agendamento.data);

          const oficina = dados.oficinas.find(o => o.id === agendamento.oficinaId);
          const educador = dados.educadores.find(e => e.id === agendamento.educadorId);
          const dataAg = new Date(agendamento.data + 'T00:00:00');

          cronograma.push({
              data: dataAg.toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' }),
              oficina: oficina?.nome || '?',
              horario: `${agendamento.horaInicio} - ${agendamento.horaFim}`,
              educador: educador?.nome || '?'
          });
      });

      setTurmaReport({
          turmaNome: turma?.nome || 'Desconhecida',
          totalHoras: (totalMinutos / 60).toFixed(1),
          totalOficinas: oficinasUnicas.size,
          totalEducadores: educadoresUnicos.size,
          totalDias: diasComOficinas.size,
          cronograma
      });

  }, [dados.agendamentos, dados.turmas, dados.oficinas, dados.educadores, turmaIdFiltro, turmaPeriodo, filtrarAgendamentosPorPeriodo]);


  if (isLoading) {
    return <div>Carregando dados para relatórios...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">Relatórios</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Carga Horária por Educador */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-4">Carga Horária por Educador</h3>
          <div className="flex space-x-3 mb-4">
             <select 
               value={educadorPeriodo} 
               onChange={(e) => setEducadorPeriodo(e.target.value as typeof educadorPeriodo)}
               className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2"
             >
                <option value="todos">Todo o período</option>
                <option value="mes">Este mês</option>
                <option value="semana">Esta semana</option>
             </select>
             <button onClick={gerarRelatorioEducador} className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Gerar</button>
          </div>
          <div className="bg-gray-50 p-3 rounded min-h-[150px] max-h-96 overflow-y-auto">
            {educadorReport === null ? (
                <p className="text-gray-500">Selecione um período e clique em "Gerar".</p>
            ) : educadorReport.length === 0 ? (
                 <p className="text-gray-500">Nenhum dado encontrado.</p>
            ) : (
                <div className="space-y-4">
                    {educadorReport.map(item => (
                         <div key={item.educador} className="border-b pb-3">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-md">{item.educador}</h4>
                                <span className="font-bold text-indigo-700">{item.horas}h</span>
                            </div>
                             <div className="flex text-xs text-gray-600 mt-1">
                                <div className="mr-3">{item.totalAgendamentos} agendamentos</div>
                                <div>{item.oficinasMinistradas} oficinas</div>
                            </div>
                            {/* Optionally display last few agendamentos */}
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
        
        {/* Oficinas mais Agendadas */}
         <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-4">Oficinas mais Agendadas</h3>
           <div className="flex space-x-3 mb-4">
             <select 
               value={oficinaPeriodo} 
               onChange={(e) => setOficinaPeriodo(e.target.value as typeof oficinaPeriodo)}
               className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2"
             >
                <option value="todos">Todo o período</option>
                <option value="mes">Este mês</option>
                <option value="semana">Esta semana</option>
             </select>
             <button onClick={gerarRelatorioOficinas} className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Gerar</button>
          </div>
          <div className="bg-gray-50 p-3 rounded min-h-[150px] max-h-96 overflow-y-auto">
             {oficinaReport === null ? (
                <p className="text-gray-500">Selecione um período e clique em "Gerar".</p>
            ) : oficinaReport.length === 0 ? (
                 <p className="text-gray-500">Nenhum dado encontrado.</p>
            ) : (
                 <table className="min-w-full text-xs">
                     <thead>
                         <tr>
                             <th className="text-left py-1">Oficina</th>
                             <th className="text-left py-1">Agend.</th>
                             <th className="text-left py-1">Horas</th>
                         </tr>
                     </thead>
                     <tbody>
                         {oficinaReport.map(item => (
                             <tr key={item.oficina} className="border-t">
                                 <td className="py-1 font-medium">{item.oficina}</td>
                                 <td className="py-1">{item.totalAgendamentos}</td>
                                 <td className="py-1">{item.horasMinistradas}h</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
            )}
          </div>
        </div>

      </div>

       {/* Agendamentos por Turma */}
       <div className="bg-white p-4 rounded-lg shadow mb-8">
          <h3 className="font-bold text-lg mb-4">Agendamentos por Turma</h3>
           <div className="flex flex-wrap gap-3 mb-4 items-center">
             <select 
               value={turmaIdFiltro} 
               onChange={(e) => setTurmaIdFiltro(e.target.value)}
               className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2"
             >
                 <option value="">Selecione uma turma...</option>
                 {dados.turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
             </select>
             <select 
               value={turmaPeriodo} 
               onChange={(e) => setTurmaPeriodo(e.target.value as typeof turmaPeriodo)}
               className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2"
             >
                <option value="todos">Todo o período</option>
                <option value="mes">Este mês</option>
                <option value="semana">Esta semana</option>
             </select>
             <button onClick={gerarRelatorioTurma} className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Gerar</button>
          </div>
          <div className="bg-gray-50 p-3 rounded min-h-[150px] max-h-96 overflow-y-auto">
             {turmaReport === null ? (
                <p className="text-gray-500">Selecione uma turma e período, depois clique em "Gerar".</p>
            ) : (
                <div>
                    <div className="bg-indigo-50 p-2 rounded mb-3 text-sm">
                        <h4 className="font-bold">{turmaReport.turmaNome}</h4>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 text-xs">
                            <span>Total Horas: {turmaReport.totalHoras}h</span>
                            <span>Oficinas: {turmaReport.totalOficinas}</span>
                            <span>Educadores: {turmaReport.totalEducadores}</span>
                            <span>Dias c/ Aulas: {turmaReport.totalDias}</span>
                        </div>
                    </div>
                    <h5 className="font-semibold text-sm mb-2">Cronograma:</h5>
                    <ul className="space-y-2">
                        {turmaReport.cronograma.map((item, index) => (
                            <li key={index} className="border-b pb-1 text-xs">
                                <div className="font-medium">{item.data}</div>
                                <div className="pl-2">{item.horario} - {item.oficina} ({item.educador})</div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
        </div>

    </div>
  );
};

export default RelatoriosPage;
