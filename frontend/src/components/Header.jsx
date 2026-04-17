import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Menu, Search, Sun, Moon } from 'lucide-react';

export const Header = ({ onMenuToggle }) => {
    const { user } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    return (
        <header className="h-20" style={{ backgroundColor: 'var(--bg-header)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }}>
            <div className="flex items-center gap-4 px-4">
                <button
                    onClick={onMenuToggle}
                    className="md:hidden p-2.5 rounded-xl border transition-all"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    aria-label="Open menu"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="hidden sm:block">
                    <h1 className="text-lg font-display font-semibold flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                        Welcome, <span className="text-gradient font-bold">{user?.name || user?.email?.split('@')[0] || 'User'}</span> 👋
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-4 px-4">
                {/* Search Bar - Decorative */}
                <div className="hidden md:flex relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                    <div className="relative flex items-center rounded-full border px-4 py-2 transition-colors" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-input)' }}>
                        <Search className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            placeholder="Quick search..." 
                            className="bg-transparent border-none text-sm focus:outline-none focus:ring-0 ml-2 w-48"
                            style={{ color: 'var(--text-primary)' }}
                        />
                    </div>
                </div>

                {/* Theme Toggle */}
                <button 
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl border transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    aria-label="Toggle theme"
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-sm font-bold relative cursor-pointer group" style={{ boxShadow: 'var(--shadow-btn)' }}>
                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    <div className="absolute inset-0 rounded-full ring-2 ring-primary-400 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"></div>
                </div>
            </div>
        </header>
    );
};
