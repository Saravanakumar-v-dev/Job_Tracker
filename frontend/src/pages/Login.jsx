import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, githubLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        if (code) {
            handleGithubAuth(code);
        }
    }, [location]);

    const handleGithubAuth = async (code) => {
        setLoading(true);
        try {
            await githubLogin(code);
            toast.success('Welcome back via GitHub!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'GitHub OAuth failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back to your workspace!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const handleGithubClick = () => {
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
        if (!clientId) {
            toast.error('GitHub Client ID not configured.');
            return;
        }
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden page-bg">
            {/* Abstract Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-600/20 blur-[120px] pointer-events-none" />

            {/* Left Panel - Branding */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative z-10">
                <div>
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-3xl font-display font-bold text-theme-heading tracking-tight">JobTracker</span>
                    </div>
                </div>

                <div className="max-w-xl">
                    <h1 className="text-6xl font-display font-black text-theme-heading leading-[1.1] mb-6">
                        Manage your <br/>
                        <span className="text-gradient">career trajectory.</span>
                    </h1>
                    <p className="text-xl text-theme-secondary font-light mb-12 max-w-lg">
                        The single source of truth for your job hunting journey. Track, organize, and land the role you deserve.
                    </p>

                    <div className="flex gap-6">
                        <div className="glass-panel rounded-2xl p-6 border-white/10 flex-1">
                            <h3 className="text-3xl font-display font-bold text-theme-heading mb-1">500+</h3>
                            <p className="text-theme-muted text-sm">Designers & Devs</p>
                        </div>
                        <div className="glass-panel rounded-2xl p-6 border-white/10 flex-1">
                            <h3 className="text-3xl font-display font-bold text-theme-heading mb-1">98%</h3>
                            <p className="text-theme-muted text-sm">Success Rate</p>
                        </div>
                    </div>
                </div>
                
                <div className="text-theme-muted text-sm mt-8">
                    © 2026 JobTracker OS. All rights reserved.
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center items-center gap-3 mb-12">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-3xl font-display font-bold text-theme-heading">JobTracker</span>
                    </div>

                    <div className="glass-card p-10 rounded-[2rem] w-full">
                        <h2 className="text-3xl font-display font-bold text-theme-heading mb-2">
                            Welcome back
                        </h2>
                        <p className="text-theme-secondary mb-8 font-medium">
                            Log in to access your dashboard.
                        </p>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-bold text-theme-secondary mb-2 uppercase tracking-wider text-[11px]">Email address</label>
                                <div className="relative">
                                    <Mail className="w-5 h-5 text-theme-muted absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary-400" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="Enter your email"
                                        className="input-field pl-12"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-theme-secondary mb-2 uppercase tracking-wider flex justify-between">
                                    <span>Password</span>
                                    <a href="#" className="text-primary-400 hover:text-primary-300 normal-case tracking-normal">Forgot?</a>
                                </label>
                                <div className="relative group">
                                    <Lock className="w-5 h-5 text-theme-muted absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary-400" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="input-field pl-12"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                        Authenticating...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Sign In <ArrowRight className="w-5 h-5" />
                                    </span>
                                )}
                            </button>
                            
                            <div className="relative flex items-center py-5">
                                <div className="flex-grow border-t theme-border border-opacity-50"></div>
                                <span className="flex-shrink-0 mx-4 text-theme-muted text-xs uppercase tracking-widest font-bold">Or continue with</span>
                                <div className="flex-grow border-t theme-border border-opacity-50"></div>
                            </div>
                            
                            <button type="button" onClick={handleGithubClick} disabled={loading} className="btn-secondary w-full group">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                                GitHub
                            </button>
                        </form>

                        <p className="mt-8 text-center text-theme-secondary font-medium">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-bold hover:underline transition-all">
                                Create one free
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
