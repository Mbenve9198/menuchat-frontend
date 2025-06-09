'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usersStats, setUsersStats] = useState<UserStats[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
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
        setUsersStats(responseData.users || []);
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
    { name: 'Menu (Utility)', value: usersStats.reduce((sum, user) => sum + user.messageStats.menuMessages.cost, 0), color: '#8884d8' },
    { name: 'Recensioni (Service)', value: usersStats.reduce((sum, user) => sum + user.messageStats.reviewMessages.cost, 0), color: '#82ca9d' },
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
                        <TableHead className="text-center">Menu<br/>(Utility)</TableHead>
                        <TableHead className="text-center">Recensioni<br/>(Service)</TableHead>
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
      </Tabs>
    </div>
  );
} 