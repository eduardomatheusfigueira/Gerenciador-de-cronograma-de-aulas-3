import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Turma } from '../interfaces/Turma';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

// Define the type for the form state
type TurmaFormData = Omit<Turma, 'id'> & { id?: number }; // id is optional

const TurmasPage: React.FC = () => {
  const { dados, isLoading, addTurma, updateTurma, deleteTurma } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [currentTurma, setCurrentTurma] = useState<TurmaFormData>({
    nome: '',
    periodo: '',
    observacoes: '',
  });

  // Effect to reset form when switching between add/edit or when data loads
  useEffect(() => {
    if (!isEditing) {
      resetForm();
    }
  }, [isEditing, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentTurma((prev: TurmaFormData) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentTurma({ nome: '', periodo: '', observacoes: '' });
  };

  const handleEdit = (turma: Turma) => {
    setIsEditing(true);
    setCurrentTurma({ ...turma }); // Load existing data into form
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta turma? Verifique se não há agendamentos associados.')) {
      // Dependency check is handled in the context function
      deleteTurma(id); 
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTurma.nome) {
      alert('Por favor, preencha o nome da turma.'); // Replace with Snackbar later
      return;
    }

    if (isEditing && currentTurma.id != null) {
      updateTurma(currentTurma as Turma); // Type assertion okay as id is checked
    } else {
      const { id, ...newTurmaData } = currentTurma;
      addTurma(newTurmaData);
    }
    resetForm(); // Clear form after submission
  };

  if (isLoading) {
    return <div>Carregando turmas...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">Gerenciar Turmas</h2>
      
      {/* Add/Edit Form */}
      <div className="bg-indigo-50 p-4 rounded-lg mb-6">
        <h3 className="font-bold text-lg mb-2">{isEditing ? 'Editar Turma' : 'Adicionar Nova Turma'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome da Turma</label>
              <input 
                type="text" 
                id="nome" 
                name="nome" 
                value={currentTurma.nome}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2" 
                required 
              />
            </div>
            <div>
              <label htmlFor="periodo" className="block text-sm font-medium text-gray-700">Período</label>
              <input 
                type="text" 
                id="periodo" 
                name="periodo" 
                placeholder="Ex: Manhã, Tarde, 2024.1"
                value={currentTurma.periodo || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2" 
              />
            </div>
          </div>
          <div>
            <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">Observações (opcional)</label>
            <textarea 
              id="observacoes" 
              name="observacoes" 
              value={currentTurma.observacoes || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2" 
              rows={2}
            ></textarea>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              type="submit" 
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isEditing ? 'Salvar Alterações' : 'Adicionar Turma'}
            </button>
            {isEditing && (
              <button 
                type="button" 
                onClick={resetForm}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar Edição
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Turma List Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observações</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dados.turmas.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-gray-500 text-sm text-center" colSpan={4}>Nenhuma turma cadastrada</td>
              </tr>
            ) : (
              dados.turmas.map(turma => (
                <tr key={turma.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{turma.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{turma.periodo || "-"}</td>
                  <td className="px-6 py-4 whitespace-normal max-w-xs truncate" title={turma.observacoes}>{turma.observacoes || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(turma)} 
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      onClick={() => handleDelete(turma.id)} 
                      className="text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TurmasPage;
