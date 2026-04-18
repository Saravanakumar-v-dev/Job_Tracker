import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Briefcase,
    Building2,
    Calendar,
    ExternalLink,
    FileText,
    Filter,
    Pencil,
    Plus,
    Search,
    Sparkles,
    Target,
    Trash2,
    X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const statusOptions = ['Applied', 'Interview', 'Offer', 'Rejected'];

const statusConfig = {
    Applied: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    Interview: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    Offer: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    Rejected: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
};

const initialFormState = () => ({
    company: '',
    role: '',
    status: 'Applied',
    dateApplied: new Date().toISOString().split('T')[0],
    location: '',
    jobUrl: '',
    jobDescription: '',
    notes: '',
    resumeName: '',
    atsScore: '',
    interviewProbability: '',
    keywordMatchPercentage: '',
    skillMatchPercentage: '',
    followUpDays: 5,
    reminderEnabled: true,
    emailNotifications: false,
});

const toInputDate = (value) => {
    if (!value) {
        return '';
    }

    return new Date(value).toISOString().split('T')[0];
};

const toNumberOrNull = (value) => {
    if (value === '' || value === null || value === undefined) {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const ScorePill = ({ label, value }) => (
    <div className="rounded-2xl px-3 py-2 border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
        <p className="text-[11px] uppercase tracking-[0.18em] text-theme-secondary font-semibold">{label}</p>
        <p className="text-lg font-display font-bold text-theme-heading mt-1">{value ?? '--'}{value !== null && value !== undefined && value !== '' ? '%' : ''}</p>
    </div>
);

export const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [sortBy, setSortBy] = useState('dateApplied');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(initialFormState);

    const fetchJobs = async () => {
        try {
            const response = await api.get('/jobs');
            setJobs(response.data);
        } catch (error) {
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const filteredJobs = useMemo(() => (
        [...jobs]
            .filter((job) => filterStatus === 'All' || job.status === filterStatus)
            .filter((job) => {
                const query = search.trim().toLowerCase();
                if (!query) {
                    return true;
                }

                return [
                    job.company,
                    job.role,
                    job.location,
                    job.resume?.fileName,
                ].some((value) => value?.toLowerCase().includes(query));
            })
            .sort((left, right) => {
                if (sortBy === 'company') {
                    return left.company.localeCompare(right.company);
                }

                if (sortBy === 'atsScore') {
                    return (right.analysis?.atsScore || 0) - (left.analysis?.atsScore || 0);
                }

                if (sortBy === 'interviewProbability') {
                    return (right.analysis?.interviewProbability || 0) - (left.analysis?.interviewProbability || 0);
                }

                return new Date(right.dateApplied) - new Date(left.dateApplied);
            })
    ), [filterStatus, jobs, search, sortBy]);

    const resetForm = () => {
        setEditingId(null);
        setFormData(initialFormState());
        setIsModalOpen(false);
    };

    const openCreateModal = () => {
        setEditingId(null);
        setFormData(initialFormState());
        setIsModalOpen(true);
    };

    const openEditModal = (job) => {
        setEditingId(job._id);
        setFormData({
            company: job.company || '',
            role: job.role || '',
            status: job.status || 'Applied',
            dateApplied: toInputDate(job.dateApplied),
            location: job.location || '',
            jobUrl: job.jobUrl || '',
            jobDescription: job.jobDescription || '',
            notes: job.notes || '',
            resumeName: job.resume?.fileName || '',
            atsScore: job.analysis?.atsScore ?? '',
            interviewProbability: job.analysis?.interviewProbability ?? '',
            keywordMatchPercentage: job.analysis?.keywordMatchPercentage ?? '',
            skillMatchPercentage: job.analysis?.skillMatchPercentage ?? '',
            followUpDays: job.reminder?.followUpDays ?? 5,
            reminderEnabled: Boolean(job.reminder?.enabled),
            emailNotifications: Boolean(job.reminder?.emailNotifications),
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this application?')) {
            return;
        }

        try {
            await api.delete(`/jobs/${id}`);
            setJobs((currentJobs) => currentJobs.filter((job) => job._id !== id));
            toast.success('Application removed');
        } catch (error) {
            toast.error('Failed to delete application');
        }
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setSaving(true);

        const payload = {
            company: formData.company,
            role: formData.role,
            status: formData.status,
            dateApplied: formData.dateApplied,
            location: formData.location,
            jobUrl: formData.jobUrl,
            jobDescription: formData.jobDescription,
            notes: formData.notes,
            resume: {
                fileName: formData.resumeName,
            },
            analysis: {
                atsScore: toNumberOrNull(formData.atsScore),
                interviewProbability: toNumberOrNull(formData.interviewProbability),
                keywordMatchPercentage: toNumberOrNull(formData.keywordMatchPercentage),
                skillMatchPercentage: toNumberOrNull(formData.skillMatchPercentage),
            },
            reminder: {
                enabled: formData.reminderEnabled,
                followUpDays: Number(formData.followUpDays) || 5,
                emailNotifications: formData.emailNotifications,
            },
        };

        try {
            if (editingId) {
                const response = await api.put(`/jobs/${editingId}`, payload);
                setJobs((currentJobs) => currentJobs.map((job) => (job._id === editingId ? response.data : job)));
                toast.success('Application updated');
            } else {
                const response = await api.post('/jobs', payload);
                setJobs((currentJobs) => [response.data, ...currentJobs]);
                toast.success('Application added');
            }

            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save application');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-semibold">
                        <Target className="w-4 h-4" />
                        Smart application tracking
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-display font-black text-theme-heading tracking-tight mt-4">Keep every application in motion</h2>
                    <p className="text-theme-secondary mt-2 max-w-2xl">
                        Store the resume you used, the latest ATS score, interview odds, and follow-up timing so nothing slips through the cracks.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link to="/copilot" className="btn-secondary">
                        <Sparkles className="w-4 h-4" />
                        Analyze Resume
                    </Link>
                    <button onClick={openCreateModal} className="btn-primary">
                        <Plus className="w-4 h-4" />
                        New Application
                    </button>
                </div>
            </div>

            <div className="glass-card rounded-3xl p-5 flex flex-col xl:flex-row gap-4 xl:items-center">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 text-theme-muted absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search company, role, location, or resume name"
                        className="input-field pl-12"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Filter className="w-4 h-4 text-theme-muted absolute left-4 top-1/2 -translate-y-1/2" />
                        <select className="input-field pl-10 pr-10" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
                            <option value="All">All statuses</option>
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <select className="input-field pr-10" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                        <option value="dateApplied">Latest applied</option>
                        <option value="company">Company name</option>
                        <option value="atsScore">Highest ATS score</option>
                        <option value="interviewProbability">Highest interview odds</option>
                    </select>
                </div>
            </div>

            <div className="min-h-[420px]">
                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="skeleton h-72" />
                        ))}
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="glass-card rounded-3xl p-12 text-center">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-300">
                            <Briefcase className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-theme-heading mt-6">No matching applications</h3>
                        <p className="text-theme-secondary mt-3 max-w-lg mx-auto">
                            Add a new application manually or start from the copilot workspace to save ATS analysis directly into your pipeline.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {filteredJobs.map((job) => (
                            <div key={job._id} className="glass-card rounded-3xl p-6 flex flex-col gap-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.18em] font-semibold border ${statusConfig[job.status]}`}>
                                            {job.status}
                                        </span>
                                        <h3 className="text-2xl font-display font-bold text-theme-heading mt-4">{job.role}</h3>
                                        <div className="flex items-center gap-2 text-theme-secondary text-sm mt-2">
                                            <Building2 className="w-4 h-4" />
                                            <span>{job.company}</span>
                                            {job.location ? <span>· {job.location}</span> : null}
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-display font-bold border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                                        {job.company?.charAt(0)?.toUpperCase()}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <ScorePill label="ATS Score" value={job.analysis?.atsScore} />
                                    <ScorePill label="Interview Odds" value={job.analysis?.interviewProbability} />
                                </div>

                                <div className="space-y-3 text-sm text-theme-secondary">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>Applied {new Date(job.dateApplied).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        <span>{job.resume?.fileName || 'Resume not linked yet'}</span>
                                    </div>
                                    {job.reminder?.enabled && job.reminder?.followUpDate ? (
                                        <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4" />
                                            <span>Follow up on {new Date(job.reminder.followUpDate).toLocaleDateString()}</span>
                                        </div>
                                    ) : null}
                                    {job.jobUrl ? (
                                        <a href={job.jobUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary-300 hover:text-primary-200">
                                            <ExternalLink className="w-4 h-4" />
                                            Open listing
                                        </a>
                                    ) : null}
                                </div>

                                {job.analysis?.missingSkills?.length ? (
                                    <div className="rounded-2xl px-4 py-3 border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                                        <p className="text-[11px] uppercase tracking-[0.18em] text-theme-secondary font-semibold">Top missing skills</p>
                                        <p className="text-sm text-theme-primary mt-2 line-clamp-2">{job.analysis.missingSkills.slice(0, 4).join(', ')}</p>
                                    </div>
                                ) : null}

                                {job.notes ? (
                                    <p className="text-sm text-theme-secondary leading-relaxed line-clamp-3">{job.notes}</p>
                                ) : null}

                                <div className="flex items-center justify-end gap-3 pt-2 mt-auto">
                                    <button onClick={() => openEditModal(job)} className="btn-secondary px-4 py-3">
                                        <Pencil className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(job._id)} className="btn-secondary px-4 py-3 text-red-300 hover:text-red-200">
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={resetForm}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                    <div
                        className="relative w-full max-w-4xl glass-card rounded-[2rem] overflow-hidden"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-8 py-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                            <div>
                                <h3 className="text-2xl font-display font-black text-theme-heading">{editingId ? 'Update application' : 'Add a new application'}</h3>
                                <p className="text-theme-secondary mt-1">Store tracking details, analysis metrics, and follow-up settings in one place.</p>
                            </div>
                            <button onClick={resetForm} className="p-2 rounded-xl text-theme-muted hover:text-theme-primary" style={{ backgroundColor: 'var(--bg-hover)' }}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-8 max-h-[85vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-theme-secondary mb-2">Company</label>
                                    <input className="input-field" value={formData.company} onChange={(event) => setFormData((current) => ({ ...current, company: event.target.value }))} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-theme-secondary mb-2">Role</label>
                                    <input className="input-field" value={formData.role} onChange={(event) => setFormData((current) => ({ ...current, role: event.target.value }))} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-theme-secondary mb-2">Status</label>
                                    <select className="input-field" value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}>
                                        {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-theme-secondary mb-2">Date applied</label>
                                    <input type="date" className="input-field" value={formData.dateApplied} onChange={(event) => setFormData((current) => ({ ...current, dateApplied: event.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-theme-secondary mb-2">Location</label>
                                    <input className="input-field" value={formData.location} onChange={(event) => setFormData((current) => ({ ...current, location: event.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-theme-secondary mb-2">Resume used</label>
                                    <input className="input-field" placeholder="e.g. backend-engineer-v3.pdf" value={formData.resumeName} onChange={(event) => setFormData((current) => ({ ...current, resumeName: event.target.value }))} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-theme-secondary mb-2">Job URL</label>
                                    <input className="input-field" placeholder="https://..." value={formData.jobUrl} onChange={(event) => setFormData((current) => ({ ...current, jobUrl: event.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-theme-secondary mb-2">Follow-up cadence (days)</label>
                                    <input type="number" min="1" max="90" className="input-field" value={formData.followUpDays} onChange={(event) => setFormData((current) => ({ ...current, followUpDays: event.target.value }))} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-theme-secondary mb-2">Job description</label>
                                <textarea className="input-field min-h-[150px]" value={formData.jobDescription} onChange={(event) => setFormData((current) => ({ ...current, jobDescription: event.target.value }))} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-theme-secondary mb-2">ATS score</label>
                                    <input type="number" min="0" max="100" className="input-field" value={formData.atsScore} onChange={(event) => setFormData((current) => ({ ...current, atsScore: event.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-theme-secondary mb-2">Interview probability</label>
                                    <input type="number" min="0" max="100" className="input-field" value={formData.interviewProbability} onChange={(event) => setFormData((current) => ({ ...current, interviewProbability: event.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-theme-secondary mb-2">Keyword match</label>
                                    <input type="number" min="0" max="100" className="input-field" value={formData.keywordMatchPercentage} onChange={(event) => setFormData((current) => ({ ...current, keywordMatchPercentage: event.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-theme-secondary mb-2">Skill match</label>
                                    <input type="number" min="0" max="100" className="input-field" value={formData.skillMatchPercentage} onChange={(event) => setFormData((current) => ({ ...current, skillMatchPercentage: event.target.value }))} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-theme-secondary mb-2">Notes</label>
                                <textarea className="input-field min-h-[120px]" value={formData.notes} onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="rounded-2xl border px-4 py-4 flex items-center justify-between gap-4" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                                    <div>
                                        <p className="font-semibold text-theme-heading">Enable follow-up reminders</p>
                                        <p className="text-sm text-theme-secondary mt-1">Automatically queue reminder timing for active applications.</p>
                                    </div>
                                    <input type="checkbox" checked={formData.reminderEnabled} onChange={(event) => setFormData((current) => ({ ...current, reminderEnabled: event.target.checked }))} className="w-5 h-5" />
                                </label>
                                <label className="rounded-2xl border px-4 py-4 flex items-center justify-between gap-4" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                                    <div>
                                        <p className="font-semibold text-theme-heading">Email reminders</p>
                                        <p className="text-sm text-theme-secondary mt-1">Send reminders through SMTP when your backend is configured.</p>
                                    </div>
                                    <input type="checkbox" checked={formData.emailNotifications} onChange={(event) => setFormData((current) => ({ ...current, emailNotifications: event.target.checked }))} className="w-5 h-5" />
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary">
                                    {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
