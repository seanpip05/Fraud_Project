import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  TextField,
  InputAdornment
} from "@mui/material";
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
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import BlockIcon from "@mui/icons-material/Block";
import TimelineIcon from "@mui/icons-material/Timeline";

// Interface for server statistics
interface VictimStats {
  totalAttacks: number;
  attacksLastMinute: number;
  blockedIpsCount: number;
}

// Interface for chart data points
interface ChartData {
  time: string;
  attacks: number;
  blocked: number;
}

export const VictimMonitorView: React.FC = () => {
  const [stats, setStats] = useState<VictimStats>({
    totalAttacks: 0,
    attacksLastMinute: 0,
    blockedIpsCount: 0,
  });
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [chartHistory, setChartHistory] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ipToBlock, setIpToBlock] = useState("");

  const API_BASE = "http://localhost:8081/api/analytics";
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
      setError("Communication Error: Server 2 is unreachable.");
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); 
    return () => clearInterval(interval);
  }, [fetchData]);

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

  const handleUnblock = async (ip: string) => {
    try {
      await fetch(`${API_BASE}/unblock?ip=${encodeURIComponent(ip)}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error("Unblock failed", err);
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4, alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#0f172a", fontWeight: 800, letterSpacing: -1 }}>
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
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Total Incidents" value={stats.totalAttacks} icon={<GppBadIcon />} color="#ef4444" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Active Threats (1m)" value={stats.attacksLastMinute} icon={<SecurityIcon />} color="#f59e0b" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Shielded IPs" value={stats.blockedIpsCount} icon={<ShieldIcon />} color="#10b981" />
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
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
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
                    <IconButton size="small" color="success" onClick={() => handleUnblock(ip)} title="Release IP">
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
    </Box>
  );
};

// Reusable component for statistics cards
const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <Card sx={{ borderRadius: 4, borderLeft: `6px solid ${color}`, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: '20px !important' }}>
      <Box sx={{ p: 1.5, backgroundColor: `${color}15`, borderRadius: 3, color: color }}>
        {React.cloneElement(icon as React.ReactElement<any>, { fontSize: 'medium' })}
      </Box>
      <Box>
        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>
          {value.toLocaleString()}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);