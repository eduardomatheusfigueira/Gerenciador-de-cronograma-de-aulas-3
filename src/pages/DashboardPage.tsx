import React from 'react';
import { useData } from '../context/DataContext'; // Import the hook

const DashboardPage: React.FC = () => {
  const { dados, isLoading } = useData(); // Use the hook to get state and loading status

  if (isLoading) {
    return <div>Carregando dados...</div>; // Show loading indicator
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">Dashboard</h2>
      
      {/* Summary Cards - Now using data from context */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg shadow">
          <h3 className="font-bold text-blue-800 mb-2">Oficinas</h3>
          <p className="text-3xl font-bold">{dados.oficinas.length}</p> 
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow">
          <h3 className="font-bold text-green-800 mb-2">Educadores</h3>
          <p className="text-3xl font-bold">{dados.educadores.length}</p> 
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow">
          <h3 className="font-bold text-yellow-800 mb-2">Agendamentos</h3>
          <p className="text-3xl font-bold">{dados.agendamentos.length}</p> 
        </div>
      </div>

      {/* Placeholder for Dashboard Calendar */}
      <div className="bg-white shadow rounded-lg p-4 mb-8">
         <h3 className="text-xl font-bold mb-3 text-indigo-700">Calendário (Placeholder)</h3>
         {/* Calendar component will go here */}
         <p className="p-4 text-gray-500">Visualização do calendário...</p>
      </div>

      {/* Placeholder for Próximos Agendamentos */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-3 text-indigo-700">Próximos Agendamentos (Placeholder)</h3>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Table or list for upcoming schedules will go here */}
           <p className="p-4 text-gray-500">Lista de próximos agendamentos...</p>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
