import React, { useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faUpload, faTrashAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
// Assuming you might add a Google icon later if needed
// import { faGoogle } from '@fortawesome/free-brands-svg-icons'; 

const ConfiguracoesPage: React.FC = () => {
  const { exportarDados, importarDados, limparDados } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  const handleExportClick = () => {
    exportarDados();
    // Consider adding a success notification via Snackbar here
  };

  const handleImportClick = () => {
    // Trigger the hidden file input
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null); // Clear previous errors
    setImportSuccess(false); // Clear previous success message
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== 'application/json') {
      setImportError("O arquivo selecionado não é um JSON válido.");
      if(fileInputRef.current) fileInputRef.current.value = ''; // Clear input
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) {
             throw new Error("Conteúdo do arquivo vazio ou inválido.");
        }
        const success = importarDados(content); // Call context function
        if (success) {
            setImportSuccess(true);
            // Optionally show Snackbar notification
        } else {
             // Error message should be handled by the context alert for now
             // setImportError("Falha ao importar dados. Verifique o console."); 
        }
      } catch (error: any) {
        console.error("Erro ao processar arquivo JSON:", error);
        setImportError(`Erro ao processar arquivo: ${error.message}`);
      } finally {
           if(fileInputRef.current) fileInputRef.current.value = ''; // Clear input regardless of outcome
      }
    };
     reader.onerror = () => {
         setImportError("Erro ao ler o arquivo.");
         if(fileInputRef.current) fileInputRef.current.value = ''; // Clear input
     };
    reader.readAsText(file);
  };

  const handleClearClick = () => {
    // Confirmation is handled within the context function
    limparDados();
    // Consider adding a success notification via Snackbar here
  };


  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">Configurações</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Exportar Dados */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-4">Exportar Dados</h3>
          <p className="text-gray-600 mb-4">Exporte todos os dados do sistema (oficinas, educadores, turmas, agendamentos) para um arquivo JSON.</p>
          <button 
            onClick={handleExportClick}
            className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2" /> Exportar Dados
          </button>
        </div>
        
        {/* Importar Dados */}
         <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-4">Importar Dados</h3>
          <p className="text-gray-600 mb-4">Importe dados de um arquivo JSON previamente exportado.</p>
          <p className="text-red-600 font-semibold mb-4 flex items-center">
             <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" /> Atenção: A importação substituirá todos os dados atuais!
          </p>
          <div className="flex flex-col space-y-3">
             {/* Hidden file input */}
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept=".json,application/json" 
                className="hidden" 
             />
             {/* Button to trigger file input */}
            <button 
                onClick={handleImportClick}
                className="inline-flex items-center w-full justify-center bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              <FontAwesomeIcon icon={faUpload} className="mr-2" /> Selecionar Arquivo e Importar
            </button>
             {importError && <p className="text-red-600 text-sm mt-2">{importError}</p>}
             {importSuccess && <p className="text-green-600 text-sm mt-2">Dados importados com sucesso!</p>}
          </div>
        </div>

      </div>
      
      {/* Integrações */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h3 className="font-bold text-lg mb-4">Integrações</h3>
        <p className="text-gray-600 mb-4">Configure integrações com outros serviços (funcionalidade futura).</p>
         <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Google Agenda</h4>
            <p className="text-gray-600 mb-4">Sincronizar agendamentos com o Google Agenda.</p>
            <button className="bg-gray-200 text-gray-500 px-4 py-2 rounded cursor-not-allowed" disabled>
                {/* <FontAwesomeIcon icon={faGoogle} className="mr-2" /> */} Conectar com Google (Em breve)
            </button>
        </div>
      </div>
      
      {/* Limpar Dados */}
      <div className="bg-white p-4 rounded-lg shadow border border-red-300">
        <h3 className="font-bold text-lg mb-4 text-red-700">Limpar Dados</h3>
        <p className="text-gray-600 mb-4">Remova permanentemente todos os dados (oficinas, educadores, turmas, agendamentos) do sistema.</p>
         <p className="text-red-600 font-semibold mb-4 flex items-center">
             <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" /> Atenção: Esta ação não pode ser desfeita!
          </p>
        <button 
            onClick={handleClearClick}
            className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          <FontAwesomeIcon icon={faTrashAlt} className="mr-2" /> Limpar Todos os Dados
        </button>
      </div>

    </div>
  );
};

export default ConfiguracoesPage;
