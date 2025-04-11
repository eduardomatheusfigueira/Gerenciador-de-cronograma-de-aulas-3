export interface Oficina {
  id: number; // Or string if using UUIDs later
  nome: string;
  cargaHoraria: number;
  descricao?: string; // Optional
}
