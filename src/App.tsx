import { Outlet } from 'react-router-dom';
import Header from './components/Layout/Header'; // Import Header component
import NavigationBar from './components/Layout/NavigationBar'; // Import Navigation component
// import './App.css'; // Removed as we are using Tailwind via index.css

function App() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Header /> {/* Use Header component */}

      <div className="container mx-auto px-4 py-8 flex">
        <NavigationBar /> {/* Use NavigationBar component */}

        {/* Main Content Area */}
        <main className="w-4/5 bg-white rounded-lg shadow-lg p-6">
          <Outlet /> {/* Routed components will render here */}
        </main>
      </div>

      {/* Placeholder for Modal */}
      {/* Placeholder for Snackbar */}
    </div>
  );
}

export default App;
