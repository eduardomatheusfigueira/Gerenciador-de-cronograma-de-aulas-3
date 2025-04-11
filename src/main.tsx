import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { DataProvider } from './context/DataContext.tsx'; // Import the provider
import DashboardPage from './pages/DashboardPage.tsx';
import OficinasPage from './pages/OficinasPage.tsx';
import EducadoresPage from './pages/EducadoresPage.tsx';
import TurmasPage from './pages/TurmasPage.tsx';
import AgendamentosPage from './pages/AgendamentosPage.tsx';
import RelatoriosPage from './pages/RelatoriosPage.tsx';
import ConfiguracoesPage from './pages/ConfiguracoesPage.tsx';

// Placeholder component for 404
const NotFoundPage = () => <div>404 - Page Not Found</div>;


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DataProvider> {/* Wrap the entire routing structure */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            {/* Index route uses the actual DashboardPage */}
            <Route index element={<DashboardPage />} />
            {/* Other routes nested within App layout */}
            <Route path="oficinas" element={<OficinasPage />} />
            <Route path="educadores" element={<EducadoresPage />} />
            <Route path="turmas" element={<TurmasPage />} />
            <Route path="agendamentos" element={<AgendamentosPage />} />
            <Route path="relatorios" element={<RelatoriosPage />} />
            <Route path="configuracoes" element={<ConfiguracoesPage />} />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  </StrictMode>,
);
