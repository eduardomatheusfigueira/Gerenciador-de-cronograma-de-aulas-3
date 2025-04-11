import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { Agendamento } from '../interfaces/Agendamento';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faPlusCircle, faTimesCircle, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

// Define the type for the form state (excluding id and potentially data for multi-add)
type AgendamentoFormData = Omit<Agendamento, 'id' | 'data'> & { id?: number; data?: string }; // data is optional for edit

// Define the type for filters
interface AgendamentoFilters {
  oficinaId: string;
  educadorId: string;
  turmaId: string;
  periodo: 'todos' | 'futuro' | 'passado' | 'semana' | 'mes';
}

const AgendamentosPage: React.FC = () => {
  const { dados, isLoading, addAgendamento, updateAgendamento, deleteAgendamento } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [currentAgendamento, setCurrentAgendamento] = useState<AgendamentoFormData>({
    oficinaId: 0, // Use 0 or '' as initial placeholder if needed
    educadorId: 0,
    turmaId: 0,
    horaInicio: '',
    horaFim: '',
    observacoes: '',
  });
  const [dates, setDates] = useState<string[]>(['']); // State for multiple dates in the form
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filters, setFilters] = useState<AgendamentoFilters>({
    oficinaId: '',
    educadorId: '',
    turmaId: '',
    periodo: 'todos',
  });
  const [calendarDate, setCalendarDate] = useState(new Date()); // State for the calendar view month

  // Reset form when switching modes or data loads
  useEffect(() => {
    if (!isEditing) {
      resetForm();
    }
  }, [isEditing, isLoading]);

  // --- Form Handling ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentAgendamento(prev => ({
      ...prev,
      // Convert IDs to numbers if they are selects
      [name]: (name === 'oficinaId' || name === 'educadorId' || name === 'turmaId') ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleDateChange = (index: number, value: string) => {
    const newDates = [...dates];
    newDates[index] = value;
    setDates(newDates);
  };

  const addDateField = () => {
    setDates([...dates, '']);
  };

  const removeDateField = (index: number) => {
    if (dates.length > 1) { // Prevent removing the last field
      const newDates = dates.filter((_, i) => i !== index);
      setDates(newDates);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentAgendamento({ oficinaId: 0, educadorId: 0, turmaId: 0, horaInicio: '', horaFim: '', observacoes: '' });
    setDates(['']); // Reset to a single empty date field
  };

  const handleEdit = (agendamento: Agendamento) => {
    setIsEditing(true);
    setCurrentAgendamento({ ...agendamento }); // Load existing data
    setDates([agendamento.data]); // Set the single date for editing
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      deleteAgendamento(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { oficinaId, educadorId, turmaId, horaInicio, horaFim } = currentAgendamento;
    const validDates = dates.filter(d => d); // Filter out empty date strings

    if (!oficinaId || !educadorId || !turmaId || !horaInicio || !horaFim || (validDates.length === 0 && !isEditing) || (isEditing && !currentAgendamento.data)) {
      alert('Preencha todos os campos obrigatórios (Oficina, Educador, Turma, Data(s), Horários).'); // Replace with Snackbar
      return;
    }
    if (horaInicio >= horaFim) {
      alert('O horário de término deve ser posterior ao horário de início.'); // Replace with Snackbar
      return;
    }

    let success = false;
    if (isEditing && currentAgendamento.id != null && currentAgendamento.data) {
       // Ensure all required fields are present for update
       const agendamentoToUpdate: Agendamento = {
           id: currentAgendamento.id,
           oficinaId: parseInt(currentAgendamento.oficinaId.toString(), 10), // Ensure number
           educadorId: parseInt(currentAgendamento.educadorId.toString(), 10), // Ensure number
           turmaId: parseInt(currentAgendamento.turmaId.toString(), 10), // Ensure number
           data: currentAgendamento.data,
           horaInicio: currentAgendamento.horaInicio,
           horaFim: currentAgendamento.horaFim,
           observacoes: currentAgendamento.observacoes
       };
       success = updateAgendamento(agendamentoToUpdate);
    } else if (!isEditing) {
      const { id, data, ...baseData } = currentAgendamento; // Exclude id and data
       const baseDataWithNumbers = {
           ...baseData,
           oficinaId: parseInt(baseData.oficinaId.toString(), 10),
           educadorId: parseInt(baseData.educadorId.toString(), 10),
           turmaId: parseInt(baseData.turmaId.toString(), 10),
       };
      success = addAgendamento(baseDataWithNumbers, validDates);
    }

    if (success) {
      resetForm(); // Clear form after successful submission
    }
  };

  // --- Filtering Logic ---
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredAgendamentos = useMemo(() => {
    let filtered = [...dados.agendamentos];

    if (filters.oficinaId) {
      filtered = filtered.filter(a => a.oficinaId === parseInt(filters.oficinaId, 10));
    }
    if (filters.educadorId) {
      filtered = filtered.filter(a => a.educadorId === parseInt(filters.educadorId, 10));
    }
    if (filters.turmaId) {
      filtered = filtered.filter(a => a.turmaId === parseInt(filters.turmaId, 10));
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (filters.periodo === 'futuro') {
      filtered = filtered.filter(a => new Date(a.data + 'T00:00:00') >= hoje);
    } else if (filters.periodo === 'passado') {
      filtered = filtered.filter(a => new Date(a.data + 'T00:00:00') < hoje);
    } else if (filters.periodo === 'semana') {
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay());
      inicioSemana.setHours(0, 0, 0, 0);
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6);
      fimSemana.setHours(23, 59, 59, 999);
      filtered = filtered.filter(a => {
        const dataAgendamento = new Date(a.data + 'T00:00:00');
        return dataAgendamento >= inicioSemana && dataAgendamento <= fimSemana;
      });
    } else if (filters.periodo === 'mes') {
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      fimMes.setHours(23, 59, 59, 999);
      filtered = filtered.filter(a => {
        const dataAgendamento = new Date(a.data + 'T00:00:00');
        return dataAgendamento >= inicioMes && dataAgendamento <= fimMes;
      });
    }

    // Sort by date and time
    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.data}T${a.horaInicio}`);
      const dateB = new Date(`${b.data}T${b.horaInicio}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [dados.agendamentos, filters]);

  // --- Calendar Logic ---
  const renderCalendar = useCallback(() => {
    const calendarDaysElement = document.getElementById('calendar-days-view'); // Use specific ID
    const calendarTitleElement = document.getElementById('calendar-title-view'); // Use specific ID
    if (!calendarDaysElement || !calendarTitleElement) return '';

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    calendarTitleElement.textContent = `${monthNames[calendarDate.getMonth()]} ${calendarDate.getFullYear()}`;

    const firstDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
    const lastDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
    const firstDayWeekday = firstDay.getDay();
    let calendarHTML = '';

    // Placeholders for previous month
    for (let i = 0; i < firstDayWeekday; i++) {
      calendarHTML += `<div class="p-2 bg-gray-100 min-h-[100px] text-gray-400 border"></div>`;
    }

    // Current month days
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
      const dateString = currentDate.toISOString().split('T')[0];
      const agendamentosDoDia = filteredAgendamentos.filter(a => a.data === dateString); // Use filtered data
      const isToday = currentDate.toDateString() === today.toDateString();
      const todayClass = isToday ? 'bg-indigo-50 border-indigo-200' : 'bg-white';

      calendarHTML += `
        <div class="p-2 ${todayClass} min-h-[100px] border relative">
          <div class="text-right font-bold ${isToday ? 'text-indigo-600' : ''}">${day}</div>
          <div class="text-xs mt-1 max-h-[80px] overflow-y-auto">
            ${agendamentosDoDia.map(agendamento => {
              const oficina = dados.oficinas.find(o => o.id === agendamento.oficinaId) || { nome: "?" };
              const educador = dados.educadores.find(e => e.id === agendamento.educadorId) || { nome: "?" };
              return `
                <div class="bg-indigo-100 p-1 mb-1 rounded text-indigo-800 cursor-pointer" onclick="document.getElementById('edit-agendamento-${agendamento.id}')?.click()">
                  <div class="font-bold">${agendamento.horaInicio} - ${oficina.nome}</div>
                  <div>${educador.nome}</div>
                  {/* Hidden button to trigger edit from outside React */}
                  <button id="edit-agendamento-${agendamento.id}" style="display:none;" data-id="${agendamento.id}"></button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
     // Placeholders for next month
    const totalCells = firstDayWeekday + lastDay.getDate();
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < remainingCells; i++) {
        calendarHTML += `<div class="p-2 bg-gray-100 min-h-[100px] text-gray-400 border"></div>`;
    }

    calendarDaysElement.innerHTML = calendarHTML;

     // Add listeners to hidden edit buttons after rendering
     agendamentosDoDia.forEach(agendamento => {
         const btn = document.getElementById(`edit-agendamento-${agendamento.id}`);
         btn?.addEventListener('click', () => handleEdit(agendamento));
     });

  }, [calendarDate, filteredAgendamentos, dados.oficinas, dados.educadores]); // Dependencies

  // Render calendar when viewMode or calendarDate changes
  useEffect(() => {
    if (viewMode === 'calendar') {
      renderCalendar();
    }
  }, [viewMode, renderCalendar]); // renderCalendar is stable due to useCallback

  // --- Render ---
  if (isLoading) {
    return <div>Carregando agendamentos...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">Gerenciar Agendamentos</h2>
      
      {/* Add/Edit Form */}
      <div className="bg-indigo-50 p-4 rounded-lg mb-6">
        <h3 className="font-bold text-lg mb-2">{isEditing ? 'Editar Agendamento' : 'Adicionar Novo Agendamento'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Oficina, Educador, Turma */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="oficinaId" className="block text-sm font-medium text-gray-700">Oficina</label>
              <select id="oficinaId" name="oficinaId" value={currentAgendamento.oficinaId || ''} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2">
                <option value="">Selecione...</option>
                {dados.oficinas.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="educadorId" className="block text-sm font-medium text-gray-700">Educador</label>
              <select id="educadorId" name="educadorId" value={currentAgendamento.educadorId || ''} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2">
                <option value="">Selecione...</option>
                 {dados.educadores.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="turmaId" className="block text-sm font-medium text-gray-700">Turma</label>
              <select id="turmaId" name="turmaId" value={currentAgendamento.turmaId || ''} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2">
                <option value="">Selecione...</option>
                 {dados.turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </div>
          </div>
          {/* Row 2: Dates, Horarios */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* Dates Input */}
             <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isEditing ? 'Data' : 'Datas'}
                </label>
                <div id="agendamento-datas-container" className="space-y-2">
                    {dates.map((date, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <input 
                                type="date" 
                                value={date}
                                onChange={(e) => handleDateChange(index, e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2" 
                                required={!isEditing} // Required only when adding
                                disabled={isEditing} // Disable multi-date when editing
                            />
                            {!isEditing && dates.length > 1 && (
                                <button 
                                    type="button" 
                                    onClick={() => removeDateField(index)}
                                    className="text-red-500 hover:text-red-700"
                                    title="Remover Data"
                                >
                                    <FontAwesomeIcon icon={faTimesCircle} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {!isEditing && (
                    <button 
                        type="button" 
                        onClick={addDateField} 
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                        <FontAwesomeIcon icon={faPlusCircle} className="mr-1" /> Adicionar outra data
                    </button>
                )}
            </div>
            {/* Horarios */}
            <div>
              <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-700">Horário de Início</label>
              <input type="time" id="horaInicio" name="horaInicio" value={currentAgendamento.horaInicio} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2" />
            </div>
            <div>
              <label htmlFor="horaFim" className="block text-sm font-medium text-gray-700">Horário de Término</label>
              <input type="time" id="horaFim" name="horaFim" value={currentAgendamento.horaFim} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2" />
            </div>
          </div>
          {/* Row 3: Observacoes */}
          <div>
            <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">Observações (opcional)</label>
            <textarea id="observacoes" name="observacoes" value={currentAgendamento.observacoes || ''} onChange={handleInputChange} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2"></textarea>
          </div>
          {/* Row 4: Buttons */}
          <div className="flex items-center space-x-3">
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              {isEditing ? 'Salvar Alterações' : 'Adicionar Agendamento(s)'}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Cancelar Edição
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* View Toggle and Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Visualizar Agendamentos</h3>
            <div className="flex space-x-2">
                <button onClick={() => setViewMode('list')} className={`px-3 py-1 rounded text-sm ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}>Lista</button>
                <button onClick={() => setViewMode('calendar')} className={`px-3 py-1 rounded text-sm ${viewMode === 'calendar' ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}>Calendário</button>
            </div>
        </div>
        
        {/* Filter controls */}
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label htmlFor="filtro-oficinaId" className="block text-sm font-medium text-gray-700">Filtrar por Oficina</label>
                    <select id="filtro-oficinaId" name="oficinaId" value={filters.oficinaId} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2">
                        <option value="">Todas</option>
                        {dados.oficinas.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="filtro-educadorId" className="block text-sm font-medium text-gray-700">Filtrar por Educador</label>
                    <select id="filtro-educadorId" name="educadorId" value={filters.educadorId} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2">
                        <option value="">Todos</option>
                        {dados.educadores.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="filtro-turmaId" className="block text-sm font-medium text-gray-700">Filtrar por Turma</label>
                    <select id="filtro-turmaId" name="turmaId" value={filters.turmaId} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2">
                        <option value="">Todas</option>
                        {dados.turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="filtro-periodo" className="block text-sm font-medium text-gray-700">Período</label>
                    <select id="filtro-periodo" name="periodo" value={filters.periodo} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2">
                        <option value="todos">Todos</option>
                        <option value="futuro">Próximos</option>
                        <option value="passado">Passados</option>
                        <option value="semana">Esta semana</option>
                        <option value="mes">Este mês</option>
                    </select>
                </div>
            </div>
        </div>
      </div>

      {/* Conditional Rendering based on viewMode */}
      {viewMode === 'list' && (
        <div id="list-view" className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oficina</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Educador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turma</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAgendamentos.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-gray-500 text-sm text-center" colSpan={6}>Nenhum agendamento encontrado com os filtros aplicados.</td>
                </tr>
              ) : (
                filteredAgendamentos.map(agendamento => {
                  const oficina = dados.oficinas.find(o => o.id === agendamento.oficinaId);
                  const educador = dados.educadores.find(e => e.id === agendamento.educadorId);
                  const turma = dados.turmas.find(t => t.id === agendamento.turmaId);
                  const dataAg = new Date(agendamento.data + 'T00:00:00');
                  const hoje = new Date(); hoje.setHours(0,0,0,0);
                  const isPast = dataAg < hoje;

                  return (
                    <tr key={agendamento.id} className={isPast ? 'text-gray-400' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">{dataAg.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{agendamento.horaInicio} - {agendamento.horaFim}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{oficina?.nome || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{educador?.nome || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{turma?.nome || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleEdit(agendamento)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Editar"><FontAwesomeIcon icon={faEdit} /></button>
                        <button onClick={() => handleDelete(agendamento.id)} className="text-red-600 hover:text-red-900" title="Excluir"><FontAwesomeIcon icon={faTrashAlt} /></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'calendar' && (
         <div id="calendar-view-container" className="bg-white shadow rounded-lg p-4"> {/* Changed ID */}
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                    <FontAwesomeIcon icon={faChevronLeft} className="mr-1" /> Anterior
                </button>
                <h3 id="calendar-title-view" className="text-lg font-bold"></h3> {/* Changed ID */}
                <button onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                    Próximo <FontAwesomeIcon icon={faChevronRight} className="ml-1" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-sm">
                <div className="text-center font-bold bg-gray-100 py-2">Dom</div>
                <div className="text-center font-bold bg-gray-100 py-2">Seg</div>
                <div className="text-center font-bold bg-gray-100 py-2">Ter</div>
                <div className="text-center font-bold bg-gray-100 py-2">Qua</div>
                <div className="text-center font-bold bg-gray-100 py-2">Qui</div>
                <div className="text-center font-bold bg-gray-100 py-2">Sex</div>
                <div className="text-center font-bold bg-gray-100 py-2">Sáb</div>
            </div>
            <div id="calendar-days-view" className="grid grid-cols-7 gap-1 mt-1"> {/* Changed ID */}
                {/* Calendar days will be generated by useEffect/renderCalendar */}
            </div>
        </div>
      )}
    </div>
  );
};

export default AgendamentosPage;
