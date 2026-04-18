import { Menu, Moon, Sparkles, Sun } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export const Header = ({ onMenuToggle }) => {
    const { user } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    return (
        <header
            className="h-20"
            style={{
                backgroundColor: 'var(--bg-header)',
                backdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--border-color)',
                position: 'sticky',
                top: 0,
                zIndex: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1rem',
            }}
        >
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
                        Welcome back, <span className="text-gradient font-bold">{user?.name || user?.email?.split('@')[0] || 'User'}</span>
                    </h1>
                    <p className="text-sm text-theme-secondary mt-1">Track applications, surface gaps, and follow up on time.</p>
                </div>
            </div>

            <div className="flex items-center gap-4 px-4">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-input)' }}>
                    <Sparkles className="w-4 h-4 text-primary-400" />
                    <span className="text-sm font-medium text-theme-secondary">Career copilot online</span>
                </div>

                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl border transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    aria-label="Toggle theme"
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-sm font-bold relative cursor-pointer group" style={{ boxShadow: 'var(--shadow-btn)' }}>
                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    <div className="absolute inset-0 rounded-full ring-2 ring-primary-400 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                </div>
            </div>
        </header>
    );
};
