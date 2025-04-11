import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Educador } from '../interfaces/Educador';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

// Define the type for the form state
type EducadorFormData = Omit<Educador, 'id'> & { id?: number }; // id is optional

const EducadoresPage: React.FC = () => {
  const { dados, isLoading, addEducador, updateEducador, deleteEducador } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [currentEducador, setCurrentEducador] = useState<EducadorFormData>({
    nome: '',
    email: '',
    telefone: '',
  });

  // Effect to reset form when switching between add/edit or when data loads
  useEffect(() => {
    if (!isEditing) {
      resetForm();
    }
  }, [isEditing, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentEducador((prev: EducadorFormData) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentEducador({ nome: '', email: '', telefone: '' });
  };

  const handleEdit = (educador: Educador) => {
    setIsEditing(true);
    setCurrentEducador({ ...educador }); // Load existing data into form
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este educador? Verifique se não há agendamentos associados.')) {
      // The dependency check is now handled within deleteEducador in the context
      deleteEducador(id); 
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEducador.nome) {
      alert('Por favor, preencha o nome do educador.'); // Replace with Snackbar later
      return;
    }

    if (isEditing && currentEducador.id != null) {
      updateEducador(currentEducador as Educador); // Type assertion okay as id is checked
    } else {
      const { id, ...newEducadorData } = currentEducador;
      addEducador(newEducadorData);
    }
    resetForm(); // Clear form after submission
  };

  if (isLoading) {
    return <div>Carregando educadores...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">Gerenciar Educadores</h2>
      
      {/* Add/Edit Form */}
      <div className="bg-indigo-50 p-4 rounded-lg mb-6">
        <h3 className="font-bold text-lg mb-2">{isEditing ? 'Editar Educador' : 'Adicionar Novo Educador'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome do Educador</label>
              <input 
                type="text" 
                id="nome" 
                name="nome" 
                value={currentEducador.nome}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2" 
                required 
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={currentEducador.email || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2" 
              />
            </div>
          </div>
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">Telefone (opcional)</label>
            <input 
              type="tel" 
              id="telefone" 
              name="telefone" 
              value={currentEducador.telefone || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2" 
            />
          </div>
          <div className="flex items-center space-x-3">
            <button 
              type="submit" 
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isEditing ? 'Salvar Alterações' : 'Adicionar Educador'}
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
      
      {/* Educador List Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dados.educadores.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-gray-500 text-sm text-center" colSpan={4}>Nenhum educador cadastrado</td>
              </tr>
            ) : (
              dados.educadores.map(educador => (
                <tr key={educador.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{educador.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{educador.email || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{educador.telefone || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(educador)} 
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      onClick={() => handleDelete(educador.id)} 
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

export default EducadoresPage;
