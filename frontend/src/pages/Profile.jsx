import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Shield, Calendar, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export const Profile = () => {
    const { user } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email] = useState(user?.email || '');

    const handleSave = (e) => {
        e.preventDefault();
        toast.success('Profile updated successfully');
    };

    const joined = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : 'Recently';

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            <div>
                <h2 className="text-3xl sm:text-4xl font-display font-black theme-text-heading tracking-tight">Agent Profile</h2>
                <p className="theme-text-secondary mt-2 text-sm md:text-base">Configure your personal settings and preferences.</p>
            </div>

            {/* Profile Card */}
            <div className="glass-card rounded-[2rem] overflow-hidden shadow-2xl relative" style={{ borderColor: 'var(--border-color)' }}>
                
                {/* Abstract Top Glow */}
                <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-gradient-to-br from-primary-600/20 via-accent-600/10 to-transparent blur-[100px] pointer-events-none" />

                {/* Banner */}
                <div className="h-40 bg-gradient-to-r from-primary-600 to-accent-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0xMHY2aDZ2LTZoLTZ6bTEwIDEwdjZoNnYtNmgtNnptMC0xMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                <div className="px-8 sm:px-12 pb-12 relative z-10">
                    {/* Avatar */}
                    <div className="-mt-20 flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-10 text-center sm:text-left">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
                            <div className="relative w-32 h-32 rounded-3xl border-2 flex items-center justify-center text-theme-heading text-5xl font-display font-black shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                {user?.name?.charAt(0).toUpperCase()}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20 mix-blend-overlay"></div>
                            </div>
                        </div>
                        <div className="pb-2">
                            <h3 className="text-3xl font-display font-black theme-text-heading mb-1">{user?.name}</h3>
                            <p className="theme-text-secondary font-medium tracking-wide">{user?.email}</p>
                        </div>
                    </div>

                    {/* Info Badges */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-10 pb-10" style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                            <Shield className="w-4 h-4" />
                            Verified Access
                        </span>
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-theme-secondary text-xs font-bold uppercase tracking-wider backdrop-blur-md" style={{ backgroundColor: 'var(--bg-badge)', border: '1px solid var(--border-color)' }}>
                            <Calendar className="w-4 h-4" />
                            Operative since: {joined}
                        </span>
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                            <Award className="w-4 h-4" />
                            Pro Tier
                        </span>
                    </div>

                    {/* Edit Form */}
                    <div className="max-w-2xl">
                        <h4 className="text-xl font-display font-bold theme-text-heading mb-6">Personal Details</h4>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-bold theme-text-secondary uppercase tracking-widest mb-1">Clearance Level</p>
                                    <p className="theme-text-heading font-medium mb-4">Standard Operator</p>
                                    <label className="block text-[11px] font-bold theme-text-secondary mb-2 uppercase tracking-widest">Full Name</label>
                                    <div className="relative group">
                                        <User className="w-5 h-5 text-theme-muted absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary-400" />
                                        <input
                                            type="text"
                                            className="input-field pl-12"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-theme-secondary mb-2 uppercase tracking-widest">
                                        Email Address <span className="text-xs text-primary-500/50 ml-1">(Immutable)</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="w-5 h-5 text-theme-muted absolute left-4 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="email"
                                            className="input-field pl-12 opacity-50 cursor-not-allowed"
                                            value={email}
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex pt-4">
                                <button type="submit" className="btn-primary">
                                    Update Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
