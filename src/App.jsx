import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PostList from "./components/PostList";
import PostDetail from "./pages/PostDetail";
import ThemeToggle from "./components/ThemeToggle";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import NetworkStatus from "./components/NetworkStatus";
import UpdateNotification from "./components/UpdateNotification";


const AppContent = () => {
  const { theme } = useTheme();
  
  return (
    <Router>
      <div className={`min-h-screen ${theme}-theme`}>
        <header className="sticky top-0 bg-opacity-90 backdrop-blur-sm z-10 shadow-md px-4 py-3">
          <div className="flex justify-between items-center max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Virtualized Feed
            </h1>
            <ThemeToggle />
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<PostList />} />
            <Route path="/post/:id" element={<PostDetail />} />
          </Routes>
        </main>
        <footer className="mt-8 py-4 border-t">
          <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Virtualized Feed. All rights reserved.
          </div>
        </footer>
        <NetworkStatus/>
        <UpdateNotification/>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;