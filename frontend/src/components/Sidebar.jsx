import { NavLink, useNavigate } from 'react-router-dom';
import { Bot, Briefcase, LayoutDashboard, LogOut, Sparkles, User, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Sidebar = ({ mobile = false, onClose }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Copilot', path: '/copilot', icon: Sparkles },
        { name: 'Applications', path: '/jobs', icon: Briefcase },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    const handleNavClick = () => {
        if (mobile && onClose) {
            onClose();
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });

        if (mobile && onClose) {
            onClose();
        }
    };

    return (
        <aside className={`flex flex-col w-72 glass-panel border-y-0 border-l-0 border-r-white/5 h-screen ${mobile ? '' : 'hidden md:flex sticky top-0 relative overflow-hidden'}`}>
            {!mobile && (
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
            )}

            <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="text-xl font-display font-bold text-theme-heading tracking-tight">Job Copilot</span>
                        <p className="text-xs text-theme-secondary mt-0.5">AI-first career workflow</p>
                    </div>
                </div>
                {mobile && (
                    <button onClick={onClose} className="p-2 rounded-xl text-theme-muted hover:text-theme-primary transition-colors" style={{ backgroundColor: 'var(--bg-hover)' }}>
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4 relative z-10">
                <p className="px-4 text-[10px] font-bold text-theme-muted uppercase tracking-widest mb-4 font-display">Workspace</p>
                {navItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                                    isActive
                                        ? 'text-theme-heading font-bold'
                                        : 'text-theme-secondary hover:text-theme-primary'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-transparent border-l-2 border-primary-500" />
                                    )}
                                    <div className="relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5">
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : 'text-theme-muted group-hover:text-primary-400'}`} />
                                    </div>
                                    <span className="relative z-10 text-[15px] font-medium">{item.name}</span>

                                    {!isActive && (
                                        <div className="absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100" style={{ backgroundColor: 'var(--bg-hover)' }} />
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-4 mx-4 mb-6 rounded-2xl backdrop-blur-md relative z-10 group" style={{ backgroundColor: 'var(--bg-badge)', border: '1px solid var(--border-color)' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-theme-heading text-sm font-bold shadow-inner" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-theme-heading truncate font-display">{user?.name}</p>
                        <p className="text-xs text-theme-secondary truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="relative z-10 flex justify-center items-center gap-2 w-full px-3 py-2.5 rounded-xl border text-theme-secondary hover:text-red-500 hover:border-red-500/50 transition-all duration-300"
                    style={{ borderColor: 'var(--border-color)' }}
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
};
