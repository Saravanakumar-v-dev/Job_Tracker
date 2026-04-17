import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Briefcase, Building2, Calendar, FileText, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const statusConfig = {
    Applied: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]' },
    Interview: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', dot: 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' },
    Offer: { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' },
    Rejected: { color: 'bg-red-500/10 text-red-500 border-red-500/20', dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' },
};

const statusEmoji = { Applied: '📤', Interview: '💬', Offer: '🎉', Rejected: '❌' };

export const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('dateApplied');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        company: '', role: '', status: 'Applied', dateApplied: new Date().toISOString().split('T')[0], notes: ''
    });
    const [editingId, setEditingId] = useState(null);

    const fetchJobs = async () => {
        try {
            const res = await api.get('/jobs');
            setJobs(res.data);
        } catch (error) {
            toast.error('Failed to fetch telemetry');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this record? This action is irreversible.')) return;
        try {
            await api.delete(`/jobs/${id}`);
            toast.success('Record purged');
            setJobs(jobs.filter(j => j._id !== id));
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                const res = await api.put(`/jobs/${editingId}`, formData);
                setJobs(jobs.map(j => j._id === editingId ? res.data : j));
                toast.success('Database updated!');
            } else {
                const res = await api.post('/jobs', formData);
                setJobs([res.data, ...jobs]);
                toast.success('New record established!');
            }
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to sync');
        } finally {
            setSaving(false);
        }
    };

    const openEditModal = (job) => {
        setEditingId(job._id);
        setFormData({
            company: job.company,
            role: job.role,
            status: job.status,
            dateApplied: job.dateApplied ? new Date(job.dateApplied).toISOString().split('T')[0] : '',
            notes: job.notes || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ company: '', role: '', status: 'Applied', dateApplied: new Date().toISOString().split('T')[0], notes: '' });
    };

    const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const filteredJobs = jobs
        .filter(job =>
            (filterStatus === 'All' || job.status === filterStatus) &&
            (job.company.toLowerCase().includes(search.toLowerCase()) || job.role.toLowerCase().includes(search.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortBy === 'dateApplied') return new Date(b.dateApplied) - new Date(a.dateApplied);
            if (sortBy === 'company') return a.company.localeCompare(b.company);
            if (sortBy === 'status') return a.status.localeCompare(b.status);
            return 0;
        });

    return (
        <div className="space-y-6 animate-fade-in-up relative z-10">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div>
                    <h2 className="text-3xl sm:text-4xl font-display font-black theme-text-heading tracking-tight">Active Operations</h2>
                    <p className="text-theme-secondary mt-2 text-sm md:text-base">
                        Monitoring {jobs.length} total applications · {filteredJobs.length} visible in current view.
                    </p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary shrink-0 py-3">
                    <Plus className="w-5 h-5" />
                    New Entry
                </button>
            </div>

            {/* Toolbar */}
            <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="relative flex-1 group">
                    <Search className="w-5 h-5 text-theme-muted absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by company or role..."
                        className="input-field pl-12"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <div className="relative group">
                        <select
                            className="input-field pr-10 pl-4 appearance-none cursor-pointer min-w-[160px] text-theme-heading font-bold"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Applied">📤 Applied</option>
                            <option value="Interview">💬 Interview</option>
                            <option value="Offer">🎉 Offer</option>
                            <option value="Rejected">❌ Rejected</option>
                        </select>
                        <ChevronDown className="w-5 h-5 text-theme-muted absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-theme-primary transition-colors" />
                    </div>
                    <div className="relative group">
                        <select
                            className="input-field pr-10 pl-10 appearance-none cursor-pointer min-w-[150px] text-theme-heading font-bold"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="dateApplied">Sort Date</option>
                            <option value="company">Company</option>
                            <option value="status">Status</option>
                        </select>
                        <SlidersHorizontal className="w-4 h-4 text-theme-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-theme-primary transition-colors" />
                        <ChevronDown className="w-4 h-4 text-theme-muted absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-theme-primary transition-colors" />
                    </div>
                </div>
            </div>

            {/* Job Cards Container */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="skeleton h-56" />
                        ))}
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="glass-card text-center py-24 px-6 rounded-3xl border-dashed border-2 flex flex-col items-center justify-center" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/5" style={{ backgroundColor: 'var(--bg-badge)' }}>
                            <Briefcase className="w-10 h-10 text-theme-muted" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-theme-heading mb-3">Void Detected</h3>
                        <p className="text-theme-secondary text-base max-w-md mx-auto mb-8">
                            {search || filterStatus !== 'All'
                                ? 'No matching records found in the database. Readjust your parameters.'
                                : "The pipeline is currently empty. Initiate a new record to begin tracking your progress."}
                        </p>
                        {!search && filterStatus === 'All' && (
                            <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                                <Plus className="w-5 h-5" /> Initialize First Record
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredJobs.map(job => (
                            <div key={job._id} className="glass-card p-6 group flex flex-col h-full rounded-3xl hover:border-primary-500/30">
                                {/* Card Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl font-display font-black text-theme-heading shadow-inner group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all" style={{ backgroundColor: 'var(--bg-badge)', borderColor: 'var(--border-color)' }}>
                                        {job.company.charAt(0).toUpperCase()}
                                    </div>
                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${statusConfig[job.status]?.color}`}>
                                        <span className={`w-2 h-2 rounded-full ${statusConfig[job.status]?.dot}`} />
                                        {job.status}
                                    </span>
                                </div>

                                {/* Card Body */}
                                <div className="flex-1">
                                    <h3 className="text-xl font-display font-bold text-theme-heading mb-2 leading-tight group-hover:text-primary-400 transition-colors" title={job.role}>
                                        {job.role}
                                    </h3>
                                    <p className="text-sm text-theme-secondary font-medium flex items-center gap-2 mb-4">
                                        <Building2 className="w-4 h-4 text-theme-muted" />
                                        {job.company}
                                    </p>

                                    {job.notes && (
                                        <div className="mt-4 rounded-xl px-4 py-3 border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                                            <p className="text-xs text-theme-secondary line-clamp-3 leading-relaxed">
                                                {job.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer */}
                                <div className="mt-6 pt-5 flex justify-between items-center" style={{ borderTop: '1px solid var(--border-color)' }}>
                                    <span className="text-xs font-bold text-theme-secondary uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                        {new Date(job.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(job)}
                                            className="p-2.5 rounded-xl text-theme-secondary hover:text-theme-primary hover:bg-primary-500/20 border border-transparent hover:border-primary-500/30 transition-all"
                                            title="Edit Record"
                                            style={{ backgroundColor: 'var(--bg-badge)' }}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(job._id)}
                                            className="p-2.5 rounded-xl text-theme-secondary hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                                            title="Purge Record"
                                            style={{ backgroundColor: 'var(--bg-badge)' }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ─── Premium Add/Edit Modal (Glassmorphism) ─── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" onClick={closeModal}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                    
                    <div
                        className="relative w-full max-w-2xl glass-card shadow-2xl rounded-3xl overflow-hidden animate-scale-in border theme-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Glow Behind Modal */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-primary-600/10 to-transparent pointer-events-none" />

                        {/* Modal Header */}
                        <div className="px-8 pt-8 pb-6 border-b flex items-start justify-between relative z-10" style={{ borderColor: 'var(--border-color)' }}>
                            <div>
                                <h3 className="text-2xl font-display font-black text-theme-heading tracking-tight">
                                    {editingId ? 'Modify Record' : 'Initialize New Record'}
                                </h3>
                                <p className="text-sm text-theme-secondary mt-1 font-medium">
                                    {editingId ? 'Update telemetry data for this application.' : 'Input parameters for the new application.'}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2.5 rounded-xl text-theme-muted hover:text-theme-primary transition-colors" style={{ backgroundColor: 'var(--bg-hover)' }}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSave} className="p-8 space-y-6 relative z-10" style={{ backgroundColor: 'var(--bg-card)' }}>
                            {/* Company & Role Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[11px] font-bold text-theme-secondary mb-2 uppercase tracking-widest">
                                        Organization Name
                                    </label>
                                    <div className="relative group">
                                        <Building2 className="w-5 h-5 text-theme-muted absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-400 transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Google"
                                            className="input-field pl-12"
                                            value={formData.company}
                                            onChange={e => updateField('company', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-theme-secondary mb-2 uppercase tracking-widest">
                                        Designation
                                    </label>
                                    <div className="relative group">
                                        <Briefcase className="w-5 h-5 text-theme-muted absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-400 transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Senior Frontend Engineer"
                                            className="input-field pl-12"
                                            value={formData.role}
                                            onChange={e => updateField('role', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status Selection */}
                            <div>
                                <label className="block text-[11px] font-bold text-theme-secondary mb-2 uppercase tracking-widest">
                                    Current Status Metric
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {['Applied', 'Interview', 'Offer', 'Rejected'].map(status => (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => updateField('status', status)}
                                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                                                formData.status === status
                                                    ? `${statusConfig[status]?.color} ring-1 ring-current shadow-lg scale-[1.02]`
                                                    : 'text-theme-secondary hover:text-theme-primary'
                                            }`}
                                            style={formData.status !== status ? { borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-input)' } : {}}
                                        >
                                            <span className="text-2xl mb-1 filter drop-shadow-sm">{statusEmoji[status]}</span>
                                            <span className={`text-[11px] uppercase tracking-wider font-bold ${formData.status === status ? '' : 'text-theme-muted'}`}>
                                                {status}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date Row */}
                            <div>
                                <label className="block text-[11px] font-bold text-theme-secondary mb-2 uppercase tracking-widest">
                                    Timestamp
                                </label>
                                <div className="relative group max-w-xs">
                                    <Calendar className="w-5 h-5 text-theme-muted absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-400 transition-colors" />
                                    <input
                                        type="date"
                                        className="input-field pl-12"
                                        value={formData.dateApplied}
                                        onChange={e => updateField('dateApplied', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-[11px] font-bold text-theme-secondary mb-2 uppercase tracking-widest flex items-center justify-between">
                                    <span>Encrypted Notes</span>
                                    <span className="text-theme-muted font-normal lowercase tracking-normal">(Optional)</span>
                                </label>
                                <div className="relative group">
                                    <FileText className="w-5 h-5 text-theme-muted absolute left-4 top-4 group-focus-within:text-primary-400 transition-colors" />
                                    <textarea
                                        rows="4"
                                        placeholder="Add context, interview impressions, or negotiation details..."
                                        className="input-field pl-12 resize-none py-4 leading-relaxed"
                                        value={formData.notes}
                                        onChange={e => updateField('notes', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-4 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                <button type="button" onClick={closeModal} className="btn-secondary">
                                    Abort
                                </button>
                                <button type="submit" disabled={saving} className="btn-primary">
                                    {saving ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                            Syncing...
                                        </span>
                                    ) : (
                                        editingId ? 'Commit Update' : 'Initialize Record'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
