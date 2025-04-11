import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { Oficina } from '../interfaces/Oficina';
import { Educador } from '../interfaces/Educador';
import { Turma } from '../interfaces/Turma';
import { Agendamento } from '../interfaces/Agendamento';

// --- Interfaces ---

// Shape of the global application state
interface AppState {
  oficinas: Oficina[];
  educadores: Educador[];
  turmas: Turma[];
  agendamentos: Agendamento[];
}

// Shape of the context value provided to consumers
interface AppContextType {
  dados: AppState;
  isLoading: boolean; 
  // CRUD Functions
  addOficina: (oficina: Omit<Oficina, 'id'>) => void; 
  updateOficina: (oficina: Oficina) => void;
  deleteOficina: (id: number) => void;
  addEducador: (educador: Omit<Educador, 'id'>) => void;
  updateEducador: (educador: Educador) => void;
  deleteEducador: (id: number) => void;
  addTurma: (turma: Omit<Turma, 'id'>) => void; 
  updateTurma: (turma: Turma) => void;
  deleteTurma: (id: number) => void;
  addAgendamento: (agendamentoBase: Omit<Agendamento, 'id' | 'data'>, datas: string[]) => boolean; 
  updateAgendamento: (agendamento: Agendamento) => boolean; 
  deleteAgendamento: (id: number) => void;
  // Data Management Functions
  exportarDados: () => void;
  importarDados: (jsonData: string) => boolean; // Accepts JSON string, returns true on success
  limparDados: () => void;
}

// --- Initial State ---

const initialState: AppState = {
  oficinas: [],
  educadores: [],
  turmas: [],
  agendamentos: [],
};

// Define initial context with placeholder functions
const initialContextValue: AppContextType = {
  dados: initialState,
  isLoading: true,
  addOficina: () => { console.warn('addOficina not implemented'); },
  updateOficina: () => { console.warn('updateOficina not implemented'); },
  deleteOficina: () => { console.warn('deleteOficina not implemented'); },
  addEducador: () => { console.warn('addEducador not implemented'); },
  updateEducador: () => { console.warn('updateEducador not implemented'); },
  deleteEducador: () => { console.warn('deleteEducador not implemented'); },
  addTurma: () => { console.warn('addTurma not implemented'); }, 
  updateTurma: () => { console.warn('updateTurma not implemented'); }, 
  deleteTurma: () => { console.warn('deleteTurma not implemented'); }, 
  addAgendamento: () => { console.warn('addAgendamento not implemented'); return false; }, 
  updateAgendamento: () => { console.warn('updateAgendamento not implemented'); return false; }, 
  deleteAgendamento: () => { console.warn('deleteAgendamento not implemented'); }, 
  exportarDados: () => { console.warn('exportarDados not implemented'); }, 
  importarDados: () => { console.warn('importarDados not implemented'); return false; }, 
  limparDados: () => { console.warn('limparDados not implemented'); }, 
};

// --- Context Creation ---

const DataContext = createContext<AppContextType>(initialContextValue);

// --- Provider Component ---

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [dados, setDados] = useState<AppState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const localStorageKey = 'gerenciadorOficinasDataReact'; 

  // Load data from localStorage on initial mount
  useEffect(() => {
    console.log('Attempting to load data from localStorage...');
    setIsLoading(true);
    try {
      const dadosSalvos = localStorage.getItem(localStorageKey);
      if (dadosSalvos) {
        const parsedData = JSON.parse(dadosSalvos);
        // Basic validation to ensure arrays exist
        setDados({
            oficinas: Array.isArray(parsedData.oficinas) ? parsedData.oficinas : [],
            educadores: Array.isArray(parsedData.educadores) ? parsedData.educadores : [],
            turmas: Array.isArray(parsedData.turmas) ? parsedData.turmas : [],
            agendamentos: Array.isArray(parsedData.agendamentos) ? parsedData.agendamentos : [],
        });
        console.log('Data loaded successfully.');
      } else {
        console.log('No saved data found, using initial state.');
        setDados(initialState); 
      }
    } catch (error) {
      console.error("Erro ao carregar dados do localStorage:", error);
      setDados(initialState);
    } finally {
      setIsLoading(false);
      console.log('Finished loading attempt.');
    }
  }, []); 

  // Save data to localStorage whenever 'dados' state changes
  useEffect(() => {
    if (!isLoading) {
       console.log('Saving data to localStorage...');
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(dados));
        console.log('Data saved successfully.');
      } catch (error) {
        console.error("Erro ao salvar dados no localStorage:", error);
      }
    }
  }, [dados, isLoading]); 

  // --- ID Generation ---
  const generateId = useCallback(() => {
     return Date.now() + Math.floor(Math.random() * 10000); 
  }, []);

  // --- CRUD Functions ---
  const addOficina = useCallback((newOficinaData: Omit<Oficina, 'id'>) => { setDados(prev => ({ ...prev, oficinas: [...prev.oficinas, { ...newOficinaData, id: generateId() }] })); }, [generateId]);
  const updateOficina = useCallback((updatedOficina: Oficina) => { setDados(prev => ({ ...prev, oficinas: prev.oficinas.map(o => o.id === updatedOficina.id ? updatedOficina : o) })); }, []);
  const deleteOficina = useCallback((id: number) => { const isUsed = dados.agendamentos.some(a => a.oficinaId === id); if (isUsed) { alert('Não é possível excluir uma oficina com agendamentos associados.'); return; } setDados(prev => ({ ...prev, oficinas: prev.oficinas.filter(o => o.id !== id) })); }, [dados.agendamentos]); 
  const addEducador = useCallback((newEducadorData: Omit<Educador, 'id'>) => { setDados(prev => ({ ...prev, educadores: [...prev.educadores, { ...newEducadorData, id: generateId() }] })); }, [generateId]);
  const updateEducador = useCallback((updatedEducador: Educador) => { setDados(prev => ({ ...prev, educadores: prev.educadores.map(e => e.id === updatedEducador.id ? updatedEducador : e) })); }, []);
  const deleteEducador = useCallback((id: number) => { const isUsed = dados.agendamentos.some(a => a.educadorId === id); if (isUsed) { alert('Não é possível excluir um educador com agendamentos associados.'); return; } setDados(prev => ({ ...prev, educadores: prev.educadores.filter(e => e.id !== id) })); }, [dados.agendamentos]); 
  const addTurma = useCallback((newTurmaData: Omit<Turma, 'id'>) => { setDados(prev => ({ ...prev, turmas: [...prev.turmas, { ...newTurmaData, id: generateId() }] })); }, [generateId]);
  const updateTurma = useCallback((updatedTurma: Turma) => { setDados(prev => ({ ...prev, turmas: prev.turmas.map(t => t.id === updatedTurma.id ? updatedTurma : t) })); }, []);
  const deleteTurma = useCallback((id: number) => { const isUsed = dados.agendamentos.some(a => a.turmaId === id); if (isUsed) { alert('Não é possível excluir uma turma com agendamentos associados.'); return; } setDados(prev => ({ ...prev, turmas: prev.turmas.filter(t => t.id !== id) })); }, [dados.agendamentos]); 
  const verificarConflitos = useCallback((educadorId: number, data: string, horaInicio: string, horaFim: string, excludeId: number | null = null): boolean => { return dados.agendamentos.some(a => { if (a.id === excludeId) return false; if (a.educadorId !== educadorId) return false; if (a.data !== data) return false; return ((horaInicio >= a.horaInicio && horaInicio < a.horaFim) || (horaFim > a.horaInicio && horaFim <= a.horaFim) || (horaInicio <= a.horaInicio && horaFim >= a.horaFim)); }); }, [dados.agendamentos]);
  const addAgendamento = useCallback((agendamentoBase: Omit<Agendamento, 'id' | 'data'>, datas: string[]): boolean => { let conflitos: string[] = []; const novosAgendamentos: Agendamento[] = []; for (const data of datas) { if (!data) continue; if (verificarConflitos(agendamentoBase.educadorId, data, agendamentoBase.horaInicio, agendamentoBase.horaFim)) { conflitos.push(data); } else { novosAgendamentos.push({ ...agendamentoBase, id: generateId(), data: data, }); } } if (conflitos.length > 0) { alert(`Conflito de horário detectado para o educador nas datas: ${conflitos.join(', ')}.`); return false; } if (novosAgendamentos.length === 0) { alert('Nenhuma data válida fornecida para agendamento.'); return false; } setDados(prev => ({ ...prev, agendamentos: [...prev.agendamentos, ...novosAgendamentos], })); return true; }, [generateId, verificarConflitos]);
  const updateAgendamento = useCallback((updatedAgendamento: Agendamento): boolean => { if (verificarConflitos(updatedAgendamento.educadorId, updatedAgendamento.data, updatedAgendamento.horaInicio, updatedAgendamento.horaFim, updatedAgendamento.id)) { alert(`Conflito de horário detectado para o educador na data ${updatedAgendamento.data}.`); return false; } setDados(prev => ({ ...prev, agendamentos: prev.agendamentos.map(a => a.id === updatedAgendamento.id ? updatedAgendamento : a) })); return true; }, [verificarConflitos]);
  const deleteAgendamento = useCallback((id: number) => { setDados(prev => ({ ...prev, agendamentos: prev.agendamentos.filter(a => a.id !== id) })); }, []);

  // --- Data Management Functions ---
  const exportarDados = useCallback(() => {
    try {
      const dadosJSON = JSON.stringify(dados, null, 2); // Pretty print JSON
      const blob = new Blob([dadosJSON], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gerenciador-oficinas-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a); // Required for Firefox
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert("Dados exportados com sucesso!"); // Replace with Snackbar
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      alert("Ocorreu um erro ao tentar exportar os dados."); // Replace with Snackbar
    }
  }, [dados]); 

  const importarDados = useCallback((jsonData: string): boolean => {
    if (!window.confirm("A importação substituirá todos os dados atuais. Deseja continuar?")) {
        return false;
    }
    try {
      const importedData = JSON.parse(jsonData);
      // Basic validation
      if (typeof importedData !== 'object' || importedData === null || 
          !Array.isArray(importedData.oficinas) || 
          !Array.isArray(importedData.educadores) || 
          !Array.isArray(importedData.turmas) || 
          !Array.isArray(importedData.agendamentos)) {
        throw new Error("Estrutura de dados inválida no arquivo JSON.");
      }
      // Consider adding more specific validation for each item type if needed
      
      // Prevent saving partial state during import by setting loading flag
      setIsLoading(true); 
      setDados(importedData); // Replace current state
      // The useEffect for saving will trigger once isLoading becomes false again
      setIsLoading(false); 
      alert("Dados importados com sucesso!"); // Replace with Snackbar
      return true;
    } catch (error: any) {
      console.error("Erro ao importar dados:", error);
      alert(`Erro ao importar dados: ${error.message}`); // Replace with Snackbar
      setIsLoading(false); // Ensure loading is reset even on error
      return false;
    }
  }, []); 

  const limparDados = useCallback(() => {
    if (window.confirm("Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita!")) {
      setIsLoading(true); // Prevent saving intermediate empty state
      setDados(initialState); // Reset state to initial empty state
      setIsLoading(false); // Allow saving the empty state
      alert("Todos os dados foram removidos."); // Replace with Snackbar
    }
  }, []); 

  // --- Context Value ---
  const contextValue: AppContextType = {
    dados,
    isLoading,
    // CRUD
    addOficina,
    updateOficina,
    deleteOficina,
    addEducador,
    updateEducador,
    deleteEducador,
    addTurma,       
    updateTurma,    
    deleteTurma,    
    addAgendamento, 
    updateAgendamento, 
    deleteAgendamento, 
    // Data Management
    exportarDados,
    importarDados,
    limparDados,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// --- Custom Hook for consuming context ---
export const useData = (): AppContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
