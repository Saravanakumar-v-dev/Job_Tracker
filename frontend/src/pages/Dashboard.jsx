import { useEffect, useState } from 'react';
import {
    AlertCircle,
    Briefcase,
    CalendarClock,
    CheckCircle2,
    Gauge,
    Sparkles,
    Target,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import api from '../services/api';

const defaultStats = {
    totalApplications: 0,
    statusBreakdown: { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 },
    interviewRate: 0,
    offerRate: 0,
    rejectionRate: 0,
    successRatio: 0,
    avgAtsScore: 0,
    avgInterviewProbability: 0,
    analyzedApplications: 0,
    withResumeCount: 0,
    topSkillGaps: [],
    upcomingReminders: [],
    monthlyActivity: [],
};

const STAT_COLORS = {
    Applied: '#6366f1',
    Interview: '#f59e0b',
    Offer: '#10b981',
    Rejected: '#ef4444',
};

const StatCard = ({ icon, title, value, helper }) => (
    <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary-500/10 text-primary-300 border border-primary-500/20">
                {icon}
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-theme-secondary">{title}</span>
        </div>
        <div className="text-3xl font-display font-black text-theme-heading">{value}</div>
        <p className="text-sm text-theme-secondary mt-2">{helper}</p>
    </div>
);

const ChartCard = ({ title, description, children, action }) => (
    <div className="glass-card rounded-3xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
            <div>
                <h3 className="text-xl font-display font-bold text-theme-heading">{title}</h3>
                <p className="text-sm text-theme-secondary mt-1">{description}</p>
            </div>
            {action}
        </div>
        {children}
    </div>
);

const ProgressRow = ({ label, value }) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-theme-primary">{label}</span>
            <span className="text-theme-heading font-semibold">{value}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800/60 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500" style={{ width: `${Math.max(4, value)}%` }} />
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="glass-panel rounded-2xl px-4 py-3">
            <p className="text-sm font-semibold text-theme-heading mb-1">{label}</p>
            {payload.map((entry) => (
                <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
                    {entry.name}: {entry.value}
                </p>
            ))}
        </div>
    );
};

export const Dashboard = () => {
    const [stats, setStats] = useState(defaultStats);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/jobs/stats');
                setStats({
                    ...defaultStats,
                    ...response.data,
                    statusBreakdown: {
                        ...defaultStats.statusBreakdown,
                        ...(response.data.statusBreakdown || {}),
                    },
                });
            } catch (error) {
                console.error('Failed to fetch job analytics', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statusData = Object.entries(stats.statusBreakdown).map(([name, value]) => ({
        name,
        value,
        fill: STAT_COLORS[name],
    }));

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="skeleton h-24" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="skeleton h-40" />
                    ))}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                    <div className="xl:col-span-3 skeleton h-[360px]" />
                    <div className="xl:col-span-2 skeleton h-[360px]" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-semibold">
                        <Sparkles className="w-4 h-4" />
                        AI hiring intelligence
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-display font-black text-theme-heading tracking-tight mt-4">Pipeline health at a glance</h2>
                    <p className="text-theme-secondary mt-2 max-w-2xl">
                        See how your application funnel is converting, where ATS alignment is strongest, and which skill gaps are slowing interviews down.
                    </p>
                </div>
                <div className="glass-card rounded-3xl px-5 py-4 min-w-[260px]">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-center">
                            <Target className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-theme-secondary">Average interview odds</p>
                            <p className="text-2xl font-display font-black text-theme-heading">{stats.avgInterviewProbability}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    icon={<Briefcase className="w-6 h-6" />}
                    title="Applications"
                    value={stats.totalApplications}
                    helper={`${stats.withResumeCount} tracked with a linked resume`}
                />
                <StatCard
                    icon={<Gauge className="w-6 h-6" />}
                    title="Avg ATS"
                    value={`${stats.avgAtsScore}%`}
                    helper={`${stats.analyzedApplications} applications analyzed`}
                />
                <StatCard
                    icon={<CheckCircle2 className="w-6 h-6" />}
                    title="Interview Rate"
                    value={`${stats.interviewRate}%`}
                    helper={`${stats.offerRate}% of applications turned into offers`}
                />
                <StatCard
                    icon={<CalendarClock className="w-6 h-6" />}
                    title="Success Ratio"
                    value={`${stats.successRatio}%`}
                    helper={`${stats.upcomingReminders.length} follow-ups queued`}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                <div className="xl:col-span-3 space-y-6">
                    <ChartCard
                        title="Application funnel"
                        description="A quick look at where your opportunities currently sit."
                        action={<div className="text-sm text-theme-secondary">{stats.totalApplications} total records</div>}
                    >
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData} margin={{ top: 8, right: 12, left: -24, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" name="Applications" radius={[10, 10, 0, 0]} barSize={44}>
                                        {statusData.map((entry) => (
                                            <Cell key={entry.name} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    <ChartCard
                        title="Six-month momentum"
                        description="Track how consistently you are applying and where interviews or offers are landing."
                    >
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.monthlyActivity} margin={{ top: 10, right: 12, left: -24, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="applicationsFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                                        </linearGradient>
                                        <linearGradient id="offersFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="applications" name="Applications" stroke="#6366f1" fill="url(#applicationsFill)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="offers" name="Offers" stroke="#10b981" fill="url(#offersFill)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>

                <div className="xl:col-span-2 space-y-6">
                    <ChartCard
                        title="Readiness scores"
                        description="How strong the tracked resumes look from an ATS and interview perspective."
                    >
                        <div className="space-y-5">
                            <ProgressRow label="Average ATS score" value={stats.avgAtsScore} />
                            <ProgressRow label="Average interview probability" value={stats.avgInterviewProbability} />
                            <ProgressRow label="Interview rate" value={stats.interviewRate} />
                            <ProgressRow label="Offer rate" value={stats.offerRate} />
                        </div>
                    </ChartCard>

                    <ChartCard
                        title="Top skill gaps"
                        description="Repeated missing skills across your tracked applications."
                    >
                        {stats.topSkillGaps.length ? (
                            <div className="space-y-4">
                                {stats.topSkillGaps.map((gap) => (
                                    <div key={gap.skill} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm gap-4">
                                            <span className="text-theme-primary">{gap.skill}</span>
                                            <span className="text-theme-secondary">{gap.count} mentions</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-800/60 overflow-hidden">
                                            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500" style={{ width: `${Math.min(100, gap.count * 16)}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-start gap-3 text-sm text-theme-secondary">
                                <AlertCircle className="w-4 h-4 text-primary-300 mt-0.5" />
                                Analyze a few resumes against job descriptions and your recurring skill gaps will appear here.
                            </div>
                        )}
                    </ChartCard>

                    <ChartCard
                        title="Upcoming follow-ups"
                        description="Reminders that are still open in your application pipeline."
                    >
                        {stats.upcomingReminders.length ? (
                            <div className="space-y-3">
                                {stats.upcomingReminders.map((reminder) => (
                                    <div
                                        key={reminder.id}
                                        className="rounded-2xl border px-4 py-3"
                                        style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-theme-heading">{reminder.role}</p>
                                                <p className="text-sm text-theme-secondary">{reminder.company}</p>
                                            </div>
                                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">
                                                {new Date(reminder.followUpDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-theme-secondary">No pending reminders right now. Enable follow-ups on active applications to keep this list warm.</p>
                        )}
                    </ChartCard>
                </div>
            </div>
        </div>
    );
};
