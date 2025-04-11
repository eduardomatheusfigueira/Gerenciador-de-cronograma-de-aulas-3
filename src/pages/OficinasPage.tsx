import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Oficina } from '../interfaces/Oficina';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

// Define the type for the form state
type OficinaFormData = Omit<Oficina, 'id'> & { id?: number }; // Use '&' for intersection type

const OficinasPage: React.FC = () => {
  const { dados, isLoading, addOficina, updateOficina, deleteOficina } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [currentOficina, setCurrentOficina] = useState<OficinaFormData>({
    nome: '',
    cargaHoraria: 0,
    descricao: '',
  });

  // Effect to reset form when switching between add/edit or when data loads
  useEffect(() => {
    if (!isEditing) {
      resetForm();
    }
  }, [isEditing, isLoading]); // Depend on isLoading too if initial data matters

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentOficina((prev: OficinaFormData) => ({ // Add explicit type for 'prev'
      ...prev,
      [name]: name === 'cargaHoraria' ? parseFloat(value) || 0 : value,
    }));
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentOficina({ nome: '', cargaHoraria: 0, descricao: '' });
  };

  const handleEdit = (oficina: Oficina) => {
    setIsEditing(true);
    setCurrentOficina({ ...oficina }); // Load existing data into form
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta oficina? Verifique se não há agendamentos associados.')) {
       // Ideally, check for dependencies (agendamentos) before calling delete
       // This check might be better placed within the context delete function itself
      deleteOficina(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOficina.nome || currentOficina.cargaHoraria <= 0 || isNaN(currentOficina.cargaHoraria)) { // Added NaN check
      alert('Por favor, preencha o nome e uma carga horária válida (> 0).'); // Replace with Snackbar later
      return;
    }

    if (isEditing && currentOficina.id != null) { // Check id is not null/undefined
      updateOficina(currentOficina as Oficina); // Type assertion is okay here as we checked id
    } else {
      // Omit 'id' when adding
      const { id, ...newOficinaData } = currentOficina;
      addOficina(newOficinaData);
    }
    resetForm(); // Clear form after submission
  };

  if (isLoading) {
    return <div>Carregando oficinas...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">Gerenciar Oficinas</h2>
      
      {/* Add/Edit Form */}
      <div className="bg-indigo-50 p-4 rounded-lg mb-6">
        <h3 className="font-bold text-lg mb-2">{isEditing ? 'Editar Oficina' : 'Adicionar Nova Oficina'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome da Oficina</label>
              <input 
                type="text" 
                id="nome" 
                name="nome" 
                value={currentOficina.nome}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2" 
                required 
              />
            </div>
            <div>
              <label htmlFor="cargaHoraria" className="block text-sm font-medium text-gray-700">Carga Horária (horas)</label>
              <input 
                type="number" 
                id="cargaHoraria" 
                name="cargaHoraria" 
                // Use empty string for 0 to avoid displaying it initially if desired, but handle parsing
                value={currentOficina.cargaHoraria === 0 ? '' : currentOficina.cargaHoraria} 
                onChange={handleInputChange}
                min="0.5" 
                step="0.5" 
                placeholder="Ex: 20"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2" 
                required 
              />
            </div>
          </div>
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição (opcional)</label>
            <textarea 
              id="descricao" 
              name="descricao" 
              value={currentOficina.descricao || ''}
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
              {isEditing ? 'Salvar Alterações' : 'Adicionar Oficina'}
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
      
      {/* Oficina List Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carga Horária</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dados.oficinas.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-gray-500 text-sm text-center" colSpan={4}>Nenhuma oficina cadastrada</td>
              </tr>
            ) : (
              dados.oficinas.map(oficina => (
                <tr key={oficina.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{oficina.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{oficina.cargaHoraria} horas</td>
                  <td className="px-6 py-4 whitespace-normal max-w-xs truncate" title={oficina.descricao}>{oficina.descricao || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(oficina)} 
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      onClick={() => handleDelete(oficina.id)} 
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

export default OficinasPage;
