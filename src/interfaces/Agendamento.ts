export interface Agendamento {
  id: number; // Or string
  oficinaId: number; // Or string, matching Oficina['id']
  educadorId: number; // Or string, matching Educador['id']
  turmaId: number; // Or string, matching Turma['id']
  data: string; // YYYY-MM-DD format
  horaInicio: string; // HH:MM format
  horaFim: string; // HH:MM format
  observacoes?: string; // Optional
}
