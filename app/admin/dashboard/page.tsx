'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Loader2, 
  RefreshCw, 
  LogOut, 
  Users, 
  MessageSquare, 
  DollarSign, 
  TrendingUp,
  Shield,
  AlertTriangle
} from 'lucide-react';

// Interfaces (same as before)
interface UserStats {
  userId: string;
  userName: string;
  userEmail: string;
  restaurantName: string;
  restaurantId: string;
  createdAt: string;
  messageStats: {
    menuMessages: { conversations: number; messages: number; cost: number };
    reviewMessages: { conversations: number; messages: number; cost: number };
    campaignMessages: { conversations: number; messages: number; cost: number };
    inboundMessages: { conversations: number; messages: number; cost: number };
  };
  totalStats: {
    totalConversations: number;
    totalMessages: number;
    totalCost: number;
  };
}

interface Summary {
  totalUsers: number;
  totalCost: number;
  totalMessages: number;
  totalConversations: number;
}

interface MonthlyUserStats {
  userId: string;
  userName: string;
  userEmail: string;
  restaurantName: string;
  restaurantId: string;
  year: number;
  month: number;
  monthName: string;
  messageStats: {
    menuMessages: { conversations: number; messages: number; cost: number };
    reviewMessages: { conversations: number; messages: number; cost: number };
    campaignMessages: { conversations: number; messages: number; cost: number };
    inboundMessages: { conversations: number; messages: number; cost: number };
  };
  totalStats: {
    totalConversations: number;
    totalMessages: number;
    totalCost: number;
  };
}

interface MonthlyStatsResponse {
  users: MonthlyUserStats[];
  summary: {
    year: number;
    month: number;
    monthName: string;
    totalUsers: number;
    totalCost: number;
    totalMessages: number;
    totalConversations: number;
  };
}

interface MonthlyTrend {
  year: number;
  month: number;
  monthName: string;
  totalUsers: number;
  totalCost: number;
  totalMessages: number;
  totalConversations: number;
  costBreakdown: {
    menu: number;
    reviews: number;
    campaigns: number;
    inbound: number;
  };
}

interface MonthlyTrendsResponse {
  trends: MonthlyTrend[];
  summary: {
    totalMonths: number;
    averageMonthlyCost: number;
    averageMonthlyMessages: number;
    peakMonth: MonthlyTrend;
    growth: {
      costGrowth: number;
      messageGrowth: number;
    } | null;
  };
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usersStats, setUsersStats] = useState<UserStats[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Stati per statistiche mensili
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStatsResponse | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrendsResponse | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [trendsMonths, setTrendsMonths] = useState(12);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  
  // Stati per test email campagne settimanali
  const [testEmail, setTestEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const router = useRouter();

  // Verifica autenticazione
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    // Carica i dati iniziali
    fetchUsersStats();
  }, [router]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const handleAuthError = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const fetchUsersStats = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/admin/users-stats', {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      const data = await response.json();
      console.log('Risposta API users-stats:', data); // Debug

      if (data.success) {
        // Il backend restituisce i dati in data.data
        const responseData = data.data || {};
        const users = responseData.users || [];
        setUsersStats(users);
        setSummary(responseData.summary || null);
      } else {
        setError(data.message || 'Errore nel caricamento dei dati');
      }
    } catch (error) {
      console.error('Errore nel caricamento statistiche:', error);
      setError('Errore di connessione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyStats = async (year: number, month: number) => {
    try {
      setLoadingMonthly(true);
      setError('');

      const response = await fetch(`/api/admin/monthly-stats?year=${year}&month=${month}`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      const data = await response.json();
      console.log('Risposta API monthly-stats:', data);

      if (data.success) {
        setMonthlyStats(data.data);
      } else {
        setError(data.message || 'Errore nel caricamento delle statistiche mensili');
      }
    } catch (error) {
      console.error('Errore nel caricamento statistiche mensili:', error);
      setError('Errore di connessione per le statistiche mensili.');
    } finally {
      setLoadingMonthly(false);
    }
  };

  const fetchMonthlyTrends = async (months: number) => {
    try {
      setLoadingMonthly(true);
      setError('');

      const response = await fetch(`/api/admin/monthly-trends?months=${months}`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      const data = await response.json();
      console.log('Risposta API monthly-trends:', data);

      if (data.success) {
        setMonthlyTrends(data.data);
      } else {
        setError(data.message || 'Errore nel caricamento dei trend mensili');
      }
    } catch (error) {
      console.error('Errore nel caricamento trend mensili:', error);
      setError('Errore di connessione per i trend mensili.');
    } finally {
      setLoadingMonthly(false);
    }
  };

  // Carica lista utenti per i test
  const fetchAvailableUsers = async () => {
    try {
      setLoadingUsers(true);

      const response = await fetch('/api/admin/users-list', {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      const data = await response.json();
      console.log('👥 Risposta users-list:', data);
      
      if (data.success && data.data) {
        setAvailableUsers(data.data);
        console.log('✅ Utenti caricati per test:', data.data.length);
      } else {
        console.error('❌ Errore risposta users-list:', data);
      }
    } catch (error) {
      console.error('Errore caricamento utenti:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Gestisce l'invio del test email
  const handleSendTestEmail = async () => {
    if (!testEmail || !selectedUser) {
      setTestResult('❌ Inserisci email e seleziona un utente');
      return;
    }

    try {
      setSendingTestEmail(true);
      setTestResult('');

             // Prima genera il suggerimento per l'utente selezionato
       const suggestionResponse = await fetch('/api/admin/weekly-campaign-test', {
         method: 'POST',
         headers: {
           ...getAuthHeaders(),
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           email: testEmail,
           userId: selectedUser
         })
       });

      if (suggestionResponse.status === 401) {
        handleAuthError();
        return;
      }

      const suggestionData = await suggestionResponse.json();

      if (suggestionData.success) {
        setTestResult(`✅ Email inviata con successo!
📧 Email ID: ${suggestionData.data.emailId}
📝 Suggerimento: ${suggestionData.data.suggestion.title}
🎯 Tipo: ${suggestionData.data.suggestion.campaignType}
📈 Impatto: ${suggestionData.data.suggestion.estimatedImpact}`);
      } else {
        setTestResult(`❌ Errore: ${suggestionData.error}`);
      }

    } catch (error) {
      console.error('Errore invio test email:', error);
      setTestResult(`❌ Errore di connessione: ${error.message}`);
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Trigger per tutti gli utenti
  const handleTriggerAllUsers = async () => {
    try {
      setSendingTestEmail(true);
      setTestResult('');

             const response = await fetch('/api/admin/trigger-weekly-campaign-suggestions', {
         method: 'POST',
         headers: {
           ...getAuthHeaders(),
           'Content-Type': 'application/json'
         }
       });

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      const data = await response.json();

      if (data.success) {
        setTestResult(`✅ Email inviate a tutti gli utenti!
⏰ Timestamp: ${new Date(data.timestamp).toLocaleString()}`);
      } else {
        setTestResult(`❌ Errore: ${data.error}`);
      }

    } catch (error) {
      console.error('Errore trigger email:', error);
      setTestResult(`❌ Errore di connessione: ${error.message}`);
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleRefreshStats = async () => {
    try {
      setRefreshing(true);
      
      const response = await fetch('/api/admin/refresh-stats', {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Ricarica le statistiche aggiornate
        await fetchUsersStats();
      } else {
        setError(data.message || 'Errore nell\'aggiornamento delle statistiche');
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento:', error);
      setError('Errore di connessione durante l\'aggiornamento.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  // Preparazione dati per i grafici
  const chartData = usersStats
    .sort((a, b) => b.totalStats.totalCost - a.totalStats.totalCost)
    .slice(0, 10)
    .map(user => ({
      name: user.restaurantName.length > 15 
        ? user.restaurantName.substring(0, 15) + '...' 
        : user.restaurantName,
      costo: user.totalStats.totalCost,
      messaggi: user.totalStats.totalMessages,
    }));

  const pieData = [
    { name: 'Menu (Marketing)', value: usersStats.reduce((sum, user) => sum + user.messageStats.menuMessages.cost, 0), color: '#8884d8' },
    { name: 'Recensioni (Utility)', value: usersStats.reduce((sum, user) => sum + user.messageStats.reviewMessages.cost, 0), color: '#82ca9d' },
    { name: 'Campagne (Marketing)', value: usersStats.reduce((sum, user) => sum + user.messageStats.campaignMessages.cost, 0), color: '#ffc658' },
    { name: 'Inbound (Service)', value: usersStats.reduce((sum, user) => sum + user.messageStats.inboundMessages.cost, 0), color: '#ff7300' },
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Caricamento dashboard admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Dashboard Admin</h1>
            <p className="text-gray-600">Monitoraggio costi e volumi MenuChat</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleRefreshStats}
            disabled={refreshing}
            variant="outline"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Aggiorna Statistiche
          </Button>
          <Button 
            onClick={async () => {
              try {
                const response = await fetch('/api/admin/users-stats', {
                  headers: getAuthHeaders(),
                });
                const data = await response.json();
                console.log('🔍 Test API Response:', data);
                alert(`Test API: ${data.success ? 'Successo' : 'Errore'}\nDettagli in console`);
              } catch (error) {
                console.error('❌ Test API Error:', error);
                alert('Errore nel test API - vedi console');
              }
            }}
            variant="outline"
            size="sm"
          >
            Test API
          </Button>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messaggi Totali</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalMessages.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversazioni</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalConversations.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Costo Totale</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalCost)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Messaggio quando non ci sono dati */}
      {!loading && (!usersStats || usersStats.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun dato disponibile</h3>
            <p className="text-gray-500 mb-4">
              Non sono stati trovati utenti o dati di messaggistica nel sistema.
            </p>
            <Button onClick={handleRefreshStats} disabled={refreshing}>
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Aggiorna Dati
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="tabella" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tabella">Tabella Utenti</TabsTrigger>
          <TabsTrigger value="grafici">Grafici</TabsTrigger>
          <TabsTrigger value="mensili">Statistiche Mensili</TabsTrigger>
          <TabsTrigger value="email-test">🚀 Test Email Campagne</TabsTrigger>
        </TabsList>

        <TabsContent value="tabella" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistiche Utenti</CardTitle>
              <CardDescription>
                Dettaglio dei costi e volumi per ogni utente della piattaforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersStats && usersStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utente</TableHead>
                        <TableHead>Ristorante</TableHead>
                        <TableHead>Registrato</TableHead>
                        <TableHead className="text-center">Menu<br/>(Marketing)</TableHead>
                        <TableHead className="text-center">Recensioni<br/>(Utility)</TableHead>
                        <TableHead className="text-center">Campagne<br/>(Marketing)</TableHead>
                        <TableHead className="text-center">Inbound<br/>(Service)</TableHead>
                        <TableHead className="text-right">Totale</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersStats.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.userName}</div>
                              <div className="text-sm text-gray-500">{user.userEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>{user.restaurantName}</TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell className="text-center">
                            <div className="text-sm">
                              <div>{user.messageStats.menuMessages.messages} msg</div>
                              <div className="text-green-600 font-medium">
                                {formatCurrency(user.messageStats.menuMessages.cost)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="text-sm">
                              <div>{user.messageStats.reviewMessages.messages} msg</div>
                              <div className="text-blue-600 font-medium">
                                {formatCurrency(user.messageStats.reviewMessages.cost)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="text-sm">
                              <div>{user.messageStats.campaignMessages.messages} msg</div>
                              <div className="text-orange-600 font-medium">
                                {formatCurrency(user.messageStats.campaignMessages.cost)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="text-sm">
                              <div>{user.messageStats.inboundMessages.messages} msg</div>
                              <div className="text-purple-600 font-medium">
                                {formatCurrency(user.messageStats.inboundMessages.cost)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div>
                              <div className="font-medium">{user.totalStats.totalMessages} msg</div>
                              <div className="text-lg font-bold">
                                {formatCurrency(user.totalStats.totalCost)}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nessun utente trovato. Prova ad aggiornare i dati.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grafici" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Utenti per Costo</CardTitle>
                <CardDescription>Ristoranti con i costi più elevati</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'costo' ? formatCurrency(Number(value)) : value,
                        name === 'costo' ? 'Costo' : 'Messaggi'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="costo" fill="#8884d8" name="Costo ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuzione Costi per Tipo</CardTitle>
                <CardDescription>Breakdown dei costi per categoria di messaggio</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mensili" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Filtri per mese specifico */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiche per Mese Specifico</CardTitle>
                <CardDescription>Visualizza i costi per un mese particolare</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Anno</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="w-full p-2 border rounded-md"
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Mese</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="w-full p-2 border rounded-md"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>
                          {new Date(2024, month - 1, 1).toLocaleDateString('it-IT', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button
                  onClick={() => fetchMonthlyStats(selectedYear, selectedMonth)}
                  disabled={loadingMonthly}
                  className="w-full"
                >
                  {loadingMonthly ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Carica Statistiche Mensili
                </Button>

                {/* Riepilogo mensile */}
                {monthlyStats?.summary && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">{monthlyStats.summary.monthName}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Utenti attivi:</span>
                        <span className="font-medium ml-2">{monthlyStats.summary.totalUsers}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Messaggi:</span>
                        <span className="font-medium ml-2">{monthlyStats.summary.totalMessages.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Conversazioni:</span>
                        <span className="font-medium ml-2">{monthlyStats.summary.totalConversations.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Costo totale:</span>
                        <span className="font-bold text-green-600 ml-2">{formatCurrency(monthlyStats.summary.totalCost)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filtri per trend */}
            <Card>
              <CardHeader>
                <CardTitle>Trend Mensili</CardTitle>
                <CardDescription>Visualizza l'andamento dei costi nel tempo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Numero di mesi</label>
                  <select
                    value={trendsMonths}
                    onChange={(e) => setTrendsMonths(parseInt(e.target.value))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={6}>Ultimi 6 mesi</option>
                    <option value={12}>Ultimi 12 mesi</option>
                    <option value={24}>Ultimi 24 mesi</option>
                  </select>
                </div>
                <Button
                  onClick={() => fetchMonthlyTrends(trendsMonths)}
                  disabled={loadingMonthly}
                  className="w-full"
                >
                  {loadingMonthly ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  )}
                  Carica Trend Mensili
                </Button>

                {/* Riepilogo trend */}
                {monthlyTrends?.summary && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Riepilogo Trend</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Costo medio mensile:</span>
                        <span className="font-medium">{formatCurrency(monthlyTrends.summary.averageMonthlyCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Messaggi medi mensili:</span>
                        <span className="font-medium">{Math.round(monthlyTrends.summary.averageMonthlyMessages).toLocaleString()}</span>
                      </div>
                      {monthlyTrends.summary.peakMonth && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mese di picco:</span>
                          <span className="font-medium">{monthlyTrends.summary.peakMonth.monthName}</span>
                        </div>
                      )}
                      {monthlyTrends.summary.growth && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Crescita costi:</span>
                            <span className={`font-medium ${monthlyTrends.summary.growth.costGrowth >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {monthlyTrends.summary.growth.costGrowth >= 0 ? '+' : ''}{monthlyTrends.summary.growth.costGrowth.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Crescita messaggi:</span>
                            <span className={`font-medium ${monthlyTrends.summary.growth.messageGrowth >= 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                              {monthlyTrends.summary.growth.messageGrowth >= 0 ? '+' : ''}{monthlyTrends.summary.growth.messageGrowth.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabella utenti per mese specifico */}
          {monthlyStats?.users && monthlyStats.users.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Dettaglio Utenti - {monthlyStats.summary.monthName}</CardTitle>
                <CardDescription>
                  Costi e volumi per ogni utente nel mese selezionato
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utente</TableHead>
                        <TableHead>Ristorante</TableHead>
                        <TableHead className="text-center">Menu<br/>(Marketing)</TableHead>
                        <TableHead className="text-center">Recensioni<br/>(Utility)</TableHead>
                        <TableHead className="text-center">Campagne<br/>(Marketing)</TableHead>
                        <TableHead className="text-center">Inbound<br/>(Service)</TableHead>
                        <TableHead className="text-right">Totale Mese</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyStats.users
                        .sort((a, b) => b.totalStats.totalCost - a.totalStats.totalCost)
                        .map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.userName}</div>
                              <div className="text-sm text-gray-500">{user.userEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>{user.restaurantName}</TableCell>
                          <TableCell className="text-center">
                            <div className="text-sm">
                              <div>{user.messageStats.menuMessages.messages} msg</div>
                              <div className="text-green-600 font-medium">
                                {formatCurrency(user.messageStats.menuMessages.cost)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="text-sm">
                              <div>{user.messageStats.reviewMessages.messages} msg</div>
                              <div className="text-blue-600 font-medium">
                                {formatCurrency(user.messageStats.reviewMessages.cost)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="text-sm">
                              <div>{user.messageStats.campaignMessages.messages} msg</div>
                              <div className="text-orange-600 font-medium">
                                {formatCurrency(user.messageStats.campaignMessages.cost)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="text-sm">
                              <div>{user.messageStats.inboundMessages.messages} msg</div>
                              <div className="text-purple-600 font-medium">
                                {formatCurrency(user.messageStats.inboundMessages.cost)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div>
                              <div className="font-medium">{user.totalStats.totalMessages} msg</div>
                              <div className="text-lg font-bold">
                                {formatCurrency(user.totalStats.totalCost)}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grafico trend mensili */}
          {monthlyTrends?.trends && monthlyTrends.trends.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trend Costi Mensili</CardTitle>
                  <CardDescription>Andamento dei costi nel tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyTrends.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="monthName" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                        labelFormatter={(label) => `Mese: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="totalCost" fill="#8884d8" name="Costo Totale" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Breakdown Costi per Tipo</CardTitle>
                  <CardDescription>Distribuzione dei costi per categoria nel tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyTrends.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="monthName" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Legend />
                      <Bar dataKey="costBreakdown.menu" stackId="a" fill="#8884d8" name="Menu" />
                      <Bar dataKey="costBreakdown.reviews" stackId="a" fill="#82ca9d" name="Recensioni" />
                      <Bar dataKey="costBreakdown.campaigns" stackId="a" fill="#ffc658" name="Campagne" />
                      <Bar dataKey="costBreakdown.inbound" stackId="a" fill="#ff7300" name="Inbound" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="email-test" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Singolo Utente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🧪 Test Email Campagna Settimanale
                </CardTitle>
                <CardDescription>
                  Testa il nuovo sistema di suggerimenti campagne intelligenti con Gemini AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Auto-carica utenti quando si apre questo tab */}
                {availableUsers.length === 0 && !loadingUsers && (
                  <div className="text-center py-4">
                    <Button onClick={fetchAvailableUsers} variant="outline">
                      Carica Lista Utenti
                    </Button>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Email destinatario</label>
                  <Input
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>

                                 <div>
                   <label className="block text-sm font-medium mb-2">Utente per analisi</label>
                   <div className="flex gap-2">
                     <Select value={selectedUser} onValueChange={(value) => {
                       console.log('🔍 Utente selezionato:', value);
                       setSelectedUser(value);
                     }}>
                       <SelectTrigger className="flex-1">
                         <SelectValue placeholder={`Seleziona utente... (${availableUsers.length} disponibili)`} />
                       </SelectTrigger>
                       <SelectContent>
                         {availableUsers.length > 0 ? (
                           availableUsers.map((user) => (
                             <SelectItem key={user.userId} value={user.userId}>
                               {user.restaurantName} ({user.userEmail})
                             </SelectItem>
                           ))
                         ) : (
                           <SelectItem value="no-users" disabled>
                             Nessun utente disponibile
                           </SelectItem>
                         )}
                       </SelectContent>
                     </Select>
                    <Button
                      onClick={fetchAvailableUsers}
                      disabled={loadingUsers}
                      variant="outline"
                      size="sm"
                    >
                      {loadingUsers ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleSendTestEmail}
                  disabled={sendingTestEmail || !testEmail || !selectedUser}
                  className="w-full"
                >
                  {sendingTestEmail ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    '🚀'
                  )}
                  Invia Email Test
                </Button>

                {testResult && (
                  <div className="mt-4">
                    <Textarea
                      value={testResult}
                      readOnly
                      className="min-h-[120px] font-mono text-sm"
                      placeholder="Risultato test apparirà qui..."
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trigger Globale */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📧 Trigger Globale
                </CardTitle>
                <CardDescription>
                  Invia email settimanali con suggerimenti a tutti gli utenti attivi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Attenzione:</strong> Questo invierà email reali a tutti gli utenti che hanno abilitato i suggerimenti settimanali.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Sistema:</strong> Utilizza Gemini AI per analizzare ogni ristorante
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Frequenza:</strong> Automatico ogni venerdì alle 11:00
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Filtri:</strong> Solo utenti attivi con preferenze email abilitate
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Anti-spam:</strong> Max 1 email ogni 6 giorni per ristorante
                  </p>
                </div>

                <Button
                  onClick={handleTriggerAllUsers}
                  disabled={sendingTestEmail}
                  variant="destructive"
                  className="w-full"
                >
                  {sendingTestEmail ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    '⚡'
                  )}
                  Trigger Email per Tutti gli Utenti
                </Button>

                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                  <strong>Nota tecnica:</strong> Il sistema analizza automaticamente:
                  <ul className="mt-1 space-y-1 ml-4">
                    <li>• Dati ristorante e performance</li>
                    <li>• Campagne precedenti (evita duplicati)</li>
                    <li>• Stagionalità e contesto temporale</li>
                    <li>• Genera suggerimenti specifici e actionable</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 