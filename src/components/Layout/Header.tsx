import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-indigo-700 text-white p-4 shadow-md">
      <h1 className="text-2xl font-bold text-center">Cronograma de Aulas</h1>
      <p className="text-center text-indigo-200 text-sm">Sistema de gerenciamento de oficinas, educadores e turmas</p>
    </header>
  );
};

export default Header;
