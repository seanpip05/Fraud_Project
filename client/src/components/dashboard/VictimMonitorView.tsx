import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    Button,
    Alert,
    type SvgIconProps,
    IconButton,
    TextField,
    InputAdornment
} from "@mui/material";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import ShieldIcon from "@mui/icons-material/Shield";
import SecurityIcon from "@mui/icons-material/Security";
import GppBadIcon from "@mui/icons-material/GppBad";
import RefreshIcon from "@mui/icons-material/Refresh";
import BlockIcon from "@mui/icons-material/Block";
import TimelineIcon from "@mui/icons-material/Timeline";
import WarningIcon from "@mui/icons-material/Warning";
import FeedIcon from "@mui/icons-material/RssFeed";
import Chip from "@mui/material/Chip";
import { VICTIM_API_BASE } from "../../config";

// Interface for server statistics
interface VictimStats {
    totalAttacks: number;
    attacksLastMinute: number;
    blockedIpsCount: number;
    currentRiskScore: number;
}

// Interface for chart data points
interface ChartData {
    time: string;
    attacks: number;
    blocked: number;
}

// Interface for live log feed
interface RecentLog {
    id: number;
    clientIp: string;
    endpoint: string;
    responseStatus: number;
    riskScore: number;
    timestamp: string;
}

export const VictimMonitorView: React.FC = () => {
    const [stats, setStats] = useState<VictimStats>({
        totalAttacks: 0,
        attacksLastMinute: 0,
        blockedIpsCount: 0,
        currentRiskScore: 0,
    });
    const [blacklist, setBlacklist] = useState<string[]>([]);
    const [chartHistory, setChartHistory] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ipToBlock, setIpToBlock] = useState("");
    const [unblockConfirm, setUnblockConfirm] = useState<{ open: boolean; ip: string }>({ open: false, ip: "" });
    const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);

    const API_BASE = `${VICTIM_API_BASE}/analytics`;
    const lastTotalRef = useRef(0);

    // Fetching data from the Victim Server (Server 2)
    const fetchData = useCallback(async () => {
        try {
            const statsRes = await fetch(`${API_BASE}/stats`);
            if (!statsRes.ok) throw new Error("Failed to fetch stats");
            const statsData = await statsRes.json();

            lastTotalRef.current = statsData.totalAttacks;
            setStats(statsData);

            // Update chart history (keep last 20 points)
            setChartHistory(prev => {
                const newData = [
                    ...prev,
                    {
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                        attacks: statsData.attacksLastMinute,
                        blocked: statsData.blockedIpsCount
                    }
                ];
                return newData.slice(-20);
            });

            const blacklistRes = await fetch(`${API_BASE}/blacklist`);
            const blacklistData = await blacklistRes.json();
            setBlacklist(blacklistData);
        } catch (err) {
            console.error("Error fetching data", err);
            setError("Communication Error: Server 2 is unreachable.");
        }
    }, []);

    // טעינה נפרדת ומהירה (כל שנייה) של הלוגים לפיד החי
    const fetchLiveFeed = useCallback(async () => {
        try {
            const logsRes = await fetch(`${API_BASE}/logs`);
            if (!logsRes.ok) return;
            const logsData: RecentLog[] = await logsRes.json();

            const oneHourAgo = Date.now() - 3 * 60 * 1000;
            const recentOnly = logsData
                .filter(log => new Date(log.timestamp).getTime() > oneHourAgo)
                .slice(0, 15); // מקסימום 15 שורות בפיד

            setRecentLogs(recentOnly);
        } catch { /* Logs feed is optional */ }
    }, []);

    useEffect(() => {
        fetchData();
        fetchLiveFeed();
        // סטטיסטיקות ורשימה שחורה — כל 3 שניות
        const statsInterval = setInterval(fetchData, 1000);
        // פיד חי — כל שנייה לתחושת זמן אמת
        const feedInterval = setInterval(fetchLiveFeed, 1000);
        return () => {
            clearInterval(statsInterval);
            clearInterval(feedInterval);
        };
    }, [fetchData, fetchLiveFeed]);

    const handleBlock = async () => {
        if (!ipToBlock) return;
        try {
            setLoading(true);
            await fetch(`${API_BASE}/block?ip=${encodeURIComponent(ipToBlock)}`, { method: "POST" });
            setIpToBlock("");
            fetchData();
        } catch (err) {
            console.error("Block failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnblockClick = (ip: string) => {
        setUnblockConfirm({ open: true, ip });
    };

    const handleUnblockConfirm = async () => {
        const ip = unblockConfirm.ip;
        setUnblockConfirm({ open: false, ip: "" });
        try {
            await fetch(`${API_BASE}/unblock?ip=${encodeURIComponent(ip)}`, { method: "DELETE" });
            fetchData();
        } catch (err) {
            console.error("Unblock failed", err);
        }
    };

    return (
        <Box sx={{ p: 4, backgroundColor: "#1e1e1e", minHeight: "100vh" }}>
            {/* Header Section */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4, alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ color: "#1A3B89", fontWeight: 800, letterSpacing: -1 }}>
                        Cyber Defense Command
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Real-time intrusion detection and automated response
                    </Typography>
                </Box>
                <IconButton onClick={fetchData} color="primary" sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#f1f5f9' } }}>
                    <RefreshIcon />
                </IconButton>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 4 }} variant="filled">{error}</Alert>}

            {/* Summary Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Total Incidents" value={stats.totalAttacks} icon={<GppBadIcon />} color="#ef4444" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Active Threats (1m)" value={stats.attacksLastMinute} icon={<SecurityIcon />} color="#f59e0b" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Shielded IPs" value={stats.blockedIpsCount} icon={<ShieldIcon />} color="#10b981" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: 4, borderLeft: `6px solid ${stats.currentRiskScore > 70 ? '#ef4444' : stats.currentRiskScore > 30 ? '#f59e0b' : '#10b981'}`, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: '20px !important' }}>
                            <Box sx={{ p: 1.5, backgroundColor: `${stats.currentRiskScore > 70 ? '#ef4444' : stats.currentRiskScore > 30 ? '#f59e0b' : '#10b981'}15`, borderRadius: 3, color: stats.currentRiskScore > 70 ? '#ef4444' : stats.currentRiskScore > 30 ? '#f59e0b' : '#10b981' }}>
                                <WarningIcon fontSize="medium" />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Threat Level
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#6b8bd5' }}>
                                    {Math.round(stats.currentRiskScore || 0)} / 100
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Live Traffic Monitoring Chart */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card sx={{ height: '100%', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: 4 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                                <TimelineIcon color="primary" /> Live Attack Traffic
                            </Typography>
                            <Box sx={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={chartHistory}>
                                        <defs>
                                            <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="time" hide />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#6b8bd5', border: 'none', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="attacks"
                                            stroke="#ef4444"
                                            fillOpacity={1}
                                            fill="url(#colorAttacks)"
                                            strokeWidth={3}
                                            name="Attacks/min"
                                            animationDuration={300}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Action Panel */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    {/* Manual Blocking Card */}
                    <Card sx={{ mb: 3, borderRadius: 4, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                                Manual Containment
                            </Typography>
                            <TextField
                                fullWidth
                                label="Attacker IP Address"
                                size="small"
                                value={ipToBlock}
                                onChange={(e) => setIpToBlock(e.target.value)}
                                sx={{ mb: 2, mt: 1 }}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><BlockIcon fontSize="small" /></InputAdornment>,
                                }}
                            />
                            <Button
                                fullWidth
                                variant="contained"
                                color="error"
                                onClick={handleBlock}
                                disabled={!ipToBlock || loading}
                                sx={{ borderRadius: 2, py: 1.2, fontWeight: 'bold' }}
                            >
                                Immediate Block
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Active Blacklist Monitor */}
                    <Card sx={{ borderRadius: 4, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                        <CardContent>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ShieldIcon fontSize="small" color="success" /> Restricted Entities ({blacklist.length})
                            </Typography>
                            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                                {blacklist.map((ip) => (
                                    <Box
                                        key={ip}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 1.5,
                                            p: 1.5,
                                            bgcolor: '#fff1f2',
                                            borderRadius: 3,
                                            border: '1px solid #fecaca'
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#be123c' }}>
                                            {ip}
                                        </Typography>
                                        <IconButton size="small" color="success" onClick={() => handleUnblockClick(ip)} title="Release IP">
                                            <RefreshIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                                {blacklist.length === 0 && (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                                        No active blocks detected
                                    </Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            {/* חלון אישור לשחרור IP */}
            <ConfirmDialog
                open={unblockConfirm.open}
                title="Release Blocked IP?"
                message={`Are you sure you want to unblock IP address ${unblockConfirm.ip}? This will allow all traffic from this address to reach the server again.`}
                confirmLabel="Release IP"
                confirmColor="warning"
                onConfirm={handleUnblockConfirm}
                onCancel={() => setUnblockConfirm({ open: false, ip: '' })}
            />

            {/* Live Attack Feed */}
            <Card sx={{ mt: 3, borderRadius: 4, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                        <FeedIcon color="error" /> Live Attack Feed
                        <Chip label="LIVE" color="error" size="small" sx={{ ml: 1, fontWeight: 'bold', animation: 'pulse 2s infinite' }} />
                    </Typography>
                    <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
                        {recentLogs.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3, fontStyle: 'italic' }}>
                                No recent attack activity detected. Start a simulation to see live data.
                            </Typography>
                        ) : (
                            recentLogs.map((log) => {
                                const isBlocked = log.responseStatus >= 400;
                                const statusColor = log.responseStatus === 200 ? '#10b981' :
                                    log.responseStatus === 429 ? '#f59e0b' : '#ef4444';
                                return (
                                    <Box
                                        key={log.id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            py: 1,
                                            px: 2,
                                            mb: 0.5,
                                            borderRadius: 2,
                                            borderLeft: `4px solid ${statusColor}`,
                                            bgcolor: isBlocked ? 'rgba(239,68,68,0.05)' : 'rgba(16,185,129,0.03)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                                        }}
                                    >
                                        <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontFamily: 'monospace', minWidth: 70 }}>
                                            {new Date(log.timestamp).toLocaleTimeString('en-GB')}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 'bold', minWidth: 110 }}>
                                            {log.clientIp}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontFamily: 'monospace', flex: 1 }}>
                                            → {log.endpoint}
                                        </Typography>
                                        <Chip
                                            label={log.responseStatus}
                                            size="small"
                                            sx={{
                                                fontWeight: 'bold',
                                                fontSize: '0.7rem',
                                                bgcolor: statusColor,
                                                color: 'white',
                                                minWidth: 45,
                                            }}
                                        />
                                        <Chip
                                            label={`Risk: ${log.riskScore}`}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                fontWeight: 'bold',
                                                fontSize: '0.7rem',
                                                borderColor: log.riskScore >= 100 ? '#ef4444' : log.riskScore > 5 ? '#f59e0b' : '#10b981',
                                                color: log.riskScore >= 100 ? '#ef4444' : log.riskScore > 5 ? '#f59e0b' : '#10b981',
                                            }}
                                        />
                                    </Box>
                                );
                            })
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

// Reusable component for statistics cards
const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <Card sx={{ borderRadius: 4, borderLeft: `6px solid ${color}`, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: '20px !important' }}>
            <Box sx={{ p: 1.5, backgroundColor: `${color}15`, borderRadius: 3, color: color }}>
                {React.isValidElement<SvgIconProps>(icon)
                    ? React.cloneElement(icon, { fontSize: 'medium' })
                    : icon}
            </Box>
            <Box>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#6b8bd5' }}>
                    {value.toLocaleString()}
                </Typography>
            </Box>
        </CardContent>
    </Card>
);