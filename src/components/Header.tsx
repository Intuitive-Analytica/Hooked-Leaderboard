import { FiSun, FiMoon } from 'react-icons/fi';
import useTheme from '../hooks/useTheme';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-dark-card shadow-sm border-b border-gray-200 dark:border-dark-border">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <img src="/logo.svg" alt="Hooked Logo" className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0" />
            <h1 className="text-xl md:text-2xl font-bold -mb-3" style={{
              fontFamily: '"Plus Jakarta Sans", "Plus Jakarta Sans Fallback", system-ui, sans-serif',
              color: '#2e125e',
              fontWeight: 700,
              lineHeight: '1'
            }}>
              leaderboard
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <FiSun className="text-xl text-yellow-500" />
            ) : (
              <FiMoon className="text-xl text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;