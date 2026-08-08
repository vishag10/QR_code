import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';

// ── Utility: format ISO date to readable local string ─────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

// ── Utility: Export array of objects to CSV download ─────────────────────────
function exportToCSV(data, filename = 'exhibition_submissions.csv') {
  if (!data || data.length === 0) return;

  const headers = ['S.No', 'Full Name', 'Phone Number', 'Registered At'];
  const rows = data.map((row, i) => [
    i + 1,
    `"${(row.fullName || '').replace(/"/g, '""')}"`,
    row.phoneNumber || '',
    `"${formatDate(row.createdAt)}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Icons ────────────────────────────────────────────────────────────────────
const SpinnerIcon = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const QRIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ hasSearch }) {
  return (
    <tr>
      <td colSpan={4} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3 text-white/30">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
          </svg>
          <p className="font-medium text-sm">
            {hasSearch ? 'No results match your search.' : 'No submissions yet.'}
          </p>
          {hasSearch && (
            <p className="text-xs">Try a different name or phone number.</p>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Main Dashboard Component ──────────────────────────────────────────────────
export default function AdminDashboard() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions]   = useState([]);
  const [totalCount, setTotalCount]     = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const debounceTimer = useRef(null);

  // ── Debounce search input ───────────────────────────────────────────────────
  function handleSearchChange(e) {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(val), 350);
  }

  // ── Fetch submissions from API ──────────────────────────────────────────────
  const fetchSubmissions = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const params = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const res = await api.get('/api/submissions', { params });
      setSubmissions(res.data.data || []);
      setTotalCount(res.data.totalCount ?? 0);
      setFilteredCount(res.data.filteredCount ?? 0);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load submissions. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // ── CSV Export (exports ALL data, not just current search) ─────────────────
  async function handleExportCSV() {
    setExportLoading(true);
    try {
      const res = await api.get('/api/submissions');
      const allData = res.data.data || [];
      const timestamp = new Date().toISOString().slice(0, 10);
      exportToCSV(allData, `exhibition_submissions_${timestamp}.csv`);
    } catch {
      alert('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/admin/login', { replace: true });
  }

  const hasSearch = Boolean(debouncedSearch.trim());

  // ── Stats Cards ─────────────────────────────────────────────────────────────
  const stats = [
    {
      label: 'Total Registrations',
      value: totalCount,
      color: 'from-brand-600 to-purple-700',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      label: hasSearch ? 'Matching Results' : "Today's Entries",
      value: hasSearch
        ? filteredCount
        : submissions.filter((s) => {
            const today = new Date().toDateString();
            return new Date(s.createdAt).toDateString() === today;
          }).length,
      color: 'from-emerald-600 to-teal-700',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
        </svg>
      ),
    },
  ];

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="animated-bg min-h-screen relative overflow-x-hidden">
      {/* Decorative orbs */}
      <div className="orb w-96 h-96 bg-brand-800 top-[-120px] right-[-80px]" />
      <div className="orb w-64 h-64 bg-indigo-900 bottom-0 left-[-60px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">

        {/* ── Top Navigation ── */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">Admin Dashboard</h1>
              <p className="text-white/40 text-xs">Logged in as <span className="text-brand-400 font-medium">{username}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/qr')}
              className="btn-secondary flex items-center gap-1.5"
            >
              <QRIcon /> QR Generator
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-all"
            >
              <LogoutIcon /> Logout
            </button>
          </div>
        </header>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="glass-card p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shrink-0 shadow-lg`}>
                {s.icon}
              </div>
              <div>
                <p className="text-white/50 text-xs font-medium">{s.label}</p>
                <p className="text-3xl font-bold text-white">{loading ? '…' : s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="glass-card p-4 mb-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
              <SearchIcon />
            </div>
            <input
              id="search-input"
              type="search"
              placeholder="Search by name or phone…"
              value={search}
              onChange={handleSearchChange}
              className="form-input pl-9 py-2.5 text-sm"
            />
          </div>

          {/* Results badge */}
          {hasSearch && !loading && (
            <span className="badge bg-brand-900/60 text-brand-300 border border-brand-700">
              {filteredCount} result{filteredCount !== 1 ? 's' : ''} found
            </span>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {/* Refresh */}
            <button
              onClick={() => fetchSubmissions(true)}
              disabled={refreshing}
              className="btn-secondary flex items-center gap-1.5"
            >
              <span className={refreshing ? 'animate-spin' : ''}><RefreshIcon /></span>
              Refresh
            </button>

            {/* CSV Export */}
            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              disabled={exportLoading || loading || totalCount === 0}
              className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-semibold
                         bg-gradient-to-r from-emerald-700 to-teal-700 text-white
                         hover:from-emerald-600 hover:to-teal-600
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all shadow-lg shadow-emerald-900/30"
            >
              {exportLoading ? <SpinnerIcon /> : <DownloadIcon />}
              Export CSV
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="glass-card overflow-hidden">
          {error && (
            <div className="p-4 m-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-12">#</th>
                  <th>Full Name</th>
                  <th>Phone Number</th>
                  <th>Registered At</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <div className="flex items-center justify-center gap-3 text-white/40">
                        <SpinnerIcon />
                        <span className="text-sm">Loading submissions…</span>
                      </div>
                    </td>
                  </tr>
                ) : submissions.length === 0 ? (
                  <EmptyState hasSearch={hasSearch} />
                ) : (
                  submissions.map((row, index) => (
                    <tr key={row._id} className="animate-fade-in">
                      <td className="text-white/30 text-xs font-mono">{index + 1}</td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          {/* Avatar initial */}
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-700 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {(row.fullName || '?').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-white">{row.fullName}</span>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-white/70">+91 {row.phoneNumber}</span>
                      </td>
                      <td>
                        <span className="text-white/50 text-xs">{formatDate(row.createdAt)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {!loading && submissions.length > 0 && (
            <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
              <p className="text-white/30 text-xs">
                Showing <span className="text-white/50 font-medium">{submissions.length}</span> of{' '}
                <span className="text-white/50 font-medium">{totalCount}</span> total entries
              </p>
              {hasSearch && (
                <button
                  onClick={() => { setSearch(''); setDebouncedSearch(''); }}
                  className="text-brand-400 text-xs hover:text-brand-300 transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
