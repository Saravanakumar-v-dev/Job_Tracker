import { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, XCircle, Clock, TrendingUp, ArrowUpRight, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';

const StatCard = ({ title, count, icon, gradientBorder, iconBg, textHighlight }) => (
    <div className={`glass-card p-6 group relative overflow-hidden border-t-2 ${gradientBorder}`}>
        {/* Glow effect */}
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${iconBg} opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none`} />
        
        <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={`p-3 rounded-xl ${iconBg} bg-opacity-20 backdrop-blur-md border border-white/10 transition-transform duration-300 group-hover:-translate-y-1`}>
                {icon}
            </div>
            <ArrowUpRight className={`w-5 h-5 text-slate-500 group-hover:${textHighlight} transition-colors`} />
        </div>
        <p className="text-4xl font-display font-black theme-text-heading mb-1 relative z-10">{count}</p>
        <p className="text-sm font-bold theme-text-secondary uppercase tracking-wider relative z-10">{title}</p>
    </div>
);

const COLORS = ['#6366f1', '#eab308', '#10b981', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-panel px-4 py-3 rounded-xl border border-white/10">
                <p className="text-sm font-bold theme-text-heading mb-1">{label}</p>
                <p className="text-sm text-primary-400 font-medium">{payload[0].value} applications</p>
            </div>
        );
    }
    return null;
};

export const Dashboard = () => {
    const [stats, setStats] = useState({ Total: 0, Applied: 0, Interview: 0, Offer: 0, Rejected: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/jobs/stats');
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const chartData = [
        { name: 'Applied', count: stats.Applied, fill: '#6366f1' },
        { name: 'Interview', count: stats.Interview, fill: '#eab308' },
        { name: 'Offer', count: stats.Offer, fill: '#10b981' },
        { name: 'Rejected', count: stats.Rejected, fill: '#ef4444' },
    ];

    const pieData = chartData.filter(d => d.count > 0);

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="space-y-2">
                    <div className="skeleton h-10 w-64" />
                    <div className="skeleton h-5 w-80" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-40" />)}
                </div>
                <div className="skeleton h-96" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-display font-black theme-text-heading tracking-tight">Mission Control</h2>
                    <p className="theme-text-secondary mt-2 text-sm md:text-base">Real-time telemetry on your job seeking process.</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                    <Target className="w-5 h-5 text-indigo-400" />
                    <span>{stats.Total} Total Applications</span>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Applications"
                    count={stats.Total}
                    icon={<Briefcase className="w-6 h-6 text-indigo-400" />}
                    gradientBorder="border-t-indigo-500"
                    iconBg="bg-indigo-500"
                    textHighlight="text-indigo-400"
                />
                <StatCard
                    title="Interviews"
                    count={stats.Interview}
                    icon={<Clock className="w-6 h-6 text-yellow-400" />}
                    gradientBorder="border-t-yellow-500"
                    iconBg="bg-yellow-500"
                    textHighlight="text-yellow-400"
                />
                <StatCard
                    title="Offers"
                    count={stats.Offer}
                    icon={<CheckCircle className="w-6 h-6 text-emerald-400" />}
                    gradientBorder="border-t-emerald-500"
                    iconBg="bg-emerald-500"
                    textHighlight="text-emerald-400"
                />
                <StatCard
                    title="Rejected"
                    count={stats.Rejected}
                    icon={<XCircle className="w-6 h-6 text-red-400" />}
                    gradientBorder="border-t-red-500"
                    iconBg="bg-red-500"
                    textHighlight="text-red-400"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart */}
                <div className="lg:col-span-2 glass-card p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-display font-bold theme-text-heading mb-1">Pipeline Analytics</h3>
                            <p className="text-sm theme-text-secondary">Application volume by status category</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700">
                            <TrendingUp className="w-5 h-5 text-primary-400" />
                        </div>
                    </div>
                    
                    <div className="h-80 w-full relative">
                        {/* Glow behind chart */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 bg-primary-600/10 blur-3xl rounded-full" />
                        
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600, fontFamily: 'Outfit' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'Outfit' }}
                                    allowDecimals={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                                  {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="glass-card p-8 rounded-3xl flex flex-col">
                    <h3 className="text-xl font-display font-bold theme-text-heading mb-1">Status Split</h3>
                    <p className="text-sm theme-text-secondary mb-6">Current ratio of your applications</p>
                    
                    {pieData.length > 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center min-h-[250px] relative">
                             {/* Glow behind pie */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-accent-600/10 blur-3xl rounded-full pointer-events-none" />
                            
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="count"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        stroke="rgba(0,0,0,0.2)"
                                        strokeWidth={2}
                                        cornerRadius={8}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={entry.name} fill={COLORS[chartData.findIndex(d => d.name === entry.name)]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 mt-6">
                                {chartData.map((item, i) => (
                                    <div key={item.name} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider theme-text-secondary">
                                        <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i] }} />
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                                <TrendingUp className="w-8 h-8 text-slate-600" />
                            </div>
                            <p className="text-slate-400 text-sm font-medium">No data yet</p>
                            <p className="text-slate-500 text-xs mt-1">Add your first job to see stats!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
