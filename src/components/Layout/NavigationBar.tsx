import React from 'react';
import { NavLink } from 'react-router-dom';

// Define the structure for navigation links
interface NavItem {
  path: string;
  label: string;
  icon?: string; // Optional: Add icon name later if needed
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard' },
  { path: '/oficinas', label: 'Oficinas' },
  { path: '/educadores', label: 'Educadores' },
  { path: '/turmas', label: 'Turmas' },
  { path: '/agendamentos', label: 'Agendamentos' },
  { path: '/relatorios', label: 'Relatórios' },
  { path: '/configuracoes', label: 'Configurações' },
];

const NavigationBar: React.FC = () => {
  const baseStyle = "block px-4 py-2 rounded-lg mr-2 mb-2 transition-colors duration-150";
  const inactiveStyle = "bg-gray-300 text-gray-800 hover:bg-gray-400";
  const activeStyle = "bg-indigo-600 text-white";

  return (
    <nav className="w-1/5 mr-8"> {/* Adjust width as needed */}
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          // Handle index route ('/') active state correctly
          end={item.path === '/'} 
          className={({ isActive }) => 
            `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
          }
        >
          {/* Optional: Add icon here later */}
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default NavigationBar;
