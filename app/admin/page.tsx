'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Users, 
  MessageSquare, 
  DollarSign, 
  TrendingUp,
  RefreshCw,
  Eye,
  LogOut
} from 'lucide-react';

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

interface TemplateStats {
  templateId: string;
  templateName: string;
  templateType: string;
  conversationType: string;
  restaurantName: string;
  userId: string;
  language: string;
  status: string;
  usageCount: number;
  estimatedCost: number;
  costPerMessage: number;
}

interface TemplateStatsResponse {
  templates: TemplateStats[];
  summary: {
    totalTemplates: number;
    totalUsage: number;
    totalEstimatedCost: number;
    byType: {
      MEDIA: number;
      CALL_TO_ACTION: number;
      REVIEW: number;
    };
    byConversationType: {
      utility: number;
      service: number;
      marketing: number;
    };
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<UserStats[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [templateStats, setTemplateStats] = useState<TemplateStatsResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Controlla se c'è un token salvato
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      fetchUsersStats();
      fetchTemplateStats();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
        fetchUsersStats();
        fetchTemplateStats();
      } else {
        setError(data.message || 'Errore nel login');
      }
    } catch (err) {
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/users-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setSummary(data.data.summary);
      } else {
        setError(data.message || 'Errore nel caricamento dati');
      }
    } catch (err) {
      setError('Errore nel caricamento dati');
    }
  };

  const fetchTemplateStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/template-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setTemplateStats(data.data);
      } else {
        console.error('Errore nel caricamento statistiche template:', data.message);
      }
    } catch (err) {
      console.error('Errore nel caricamento statistiche template:', err);
    }
  };

  const handleRefreshStats = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/refresh-stats', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        await fetchUsersStats();
        await fetchTemplateStats();
        alert('Statistiche aggiornate con successo!');
      } else {
        setError(data.message || 'Errore nell\'aggiornamento');
      }
    } catch (err) {
      setError('Errore nell\'aggiornamento');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setUsers([]);
    setSummary(null);
    setTemplateStats(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 3,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  // Prepara dati per i grafici
  const chartData = users.slice(0, 10).map(user => ({
    name: user.restaurantName,
    costo: user.totalStats.totalCost,
    messaggi: user.totalStats.totalMessages,
  }));

  const pieData = [
    { name: 'Menu', value: users.reduce((sum, u) => sum + u.messageStats.menuMessages.cost, 0) },
    { name: 'Recensioni', value: users.reduce((sum, u) => sum + u.messageStats.reviewMessages.cost, 0) },
    { name: 'Campagne', value: users.reduce((sum, u) => sum + u.messageStats.campaignMessages.cost, 0) },
    { name: 'Inbound', value: users.reduce((sum, u) => sum + u.messageStats.inboundMessages.cost, 0) },
  ].filter(item => item.value > 0);

  // Prepara dati per i grafici dei tipi di conversazione
  const conversationTypeData = templateStats ? [
    { name: 'Utility ($0.035/msg)', value: templateStats.summary.byConversationType.utility, color: '#0088FE' },
    { name: 'Service ($0.005/msg)', value: templateStats.summary.byConversationType.service, color: '#00C49F' },
    { name: 'Marketing ($0.0741/msg)', value: templateStats.summary.byConversationType.marketing, color: '#FF8042' },
  ].filter(item => item.value > 0) : [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Accesso...' : 'Accedi'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <div className="flex gap-2">
            <Button
              onClick={handleRefreshStats}
              disabled={refreshing}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Aggiorna Statistiche
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Utenti Totali</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Messaggi Totali</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.totalMessages}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Conversazioni</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.totalConversations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Costo Totale</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalCost)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="table" className="space-y-6">
          <TabsList>
            <TabsTrigger value="table">Tabella Utenti</TabsTrigger>
            <TabsTrigger value="charts">Grafici</TabsTrigger>
            <TabsTrigger value="templates">Template & Costi</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Statistiche Utenti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utente</TableHead>
                        <TableHead>Ristorante</TableHead>
                        <TableHead>Registrato</TableHead>
                        <TableHead>Menu (Utility)</TableHead>
                        <TableHead>Recensioni (Service)</TableHead>
                        <TableHead>Campagne (Marketing)</TableHead>
                        <TableHead>Inbound (Service)</TableHead>
                        <TableHead>Totale</TableHead>
                        <TableHead>Costo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.userName}</p>
                              <p className="text-sm text-gray-500">{user.userEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>{user.restaurantName}</TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell>
                            <div>
                              <Badge variant="secondary">
                                {user.messageStats.menuMessages.messages}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatCurrency(user.messageStats.menuMessages.cost)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge variant="secondary">
                                {user.messageStats.reviewMessages.messages}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatCurrency(user.messageStats.reviewMessages.cost)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge variant="secondary">
                                {user.messageStats.campaignMessages.messages}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatCurrency(user.messageStats.campaignMessages.cost)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge variant="secondary">
                                {user.messageStats.inboundMessages.messages}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatCurrency(user.messageStats.inboundMessages.cost)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {user.totalStats.totalMessages}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-red-600">
                              {formatCurrency(user.totalStats.totalCost)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Utenti per Costo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [
                        name === 'costo' ? formatCurrency(Number(value)) : value,
                        name === 'costo' ? 'Costo' : 'Messaggi'
                      ]} />
                      <Bar dataKey="costo" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuzione Costi per Tipo</CardTitle>
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
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            {templateStats && (
              <div className="space-y-6">
                {/* Summary Cards per Template */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Template Totali</p>
                        <p className="text-2xl font-bold text-blue-600">{templateStats.summary.totalTemplates}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Utilizzi Totali</p>
                        <p className="text-2xl font-bold text-green-600">{templateStats.summary.totalUsage}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Costo Stimato</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(templateStats.summary.totalEstimatedCost)}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Costo Medio/Msg</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {formatCurrency(templateStats.summary.totalEstimatedCost / Math.max(templateStats.summary.totalUsage, 1))}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Grafico Costi per Tipo di Conversazione */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Costi per Tipo di Conversazione</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={conversationTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {conversationTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Prezzi per Tipo di Conversazione</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                          <span className="font-medium">Utility</span>
                          <span className="text-blue-600 font-bold">$0.035/messaggio</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                          <span className="font-medium">Service</span>
                          <span className="text-green-600 font-bold">$0.005/messaggio</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                          <span className="font-medium">Marketing</span>
                          <span className="text-orange-600 font-bold">$0.0741/messaggio</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                          <span className="font-medium">Authentication</span>
                          <span className="text-purple-600 font-bold">$0.0428/messaggio</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabella Template */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dettagli Template</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome Template</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Conversazione</TableHead>
                            <TableHead>Ristorante</TableHead>
                            <TableHead>Lingua</TableHead>
                            <TableHead>Utilizzi</TableHead>
                            <TableHead>Costo/Msg</TableHead>
                            <TableHead>Costo Totale</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {templateStats.templates.map((template) => (
                            <TableRow key={template.templateId}>
                              <TableCell className="font-medium">{template.templateName}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{template.templateType}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="secondary"
                                  className={
                                    template.conversationType === 'utility' ? 'bg-blue-100 text-blue-800' :
                                    template.conversationType === 'service' ? 'bg-green-100 text-green-800' :
                                    template.conversationType === 'marketing' ? 'bg-orange-100 text-orange-800' :
                                    'bg-purple-100 text-purple-800'
                                  }
                                >
                                  {template.conversationType}
                                </Badge>
                              </TableCell>
                              <TableCell>{template.restaurantName}</TableCell>
                              <TableCell>{template.language.toUpperCase()}</TableCell>
                              <TableCell>{template.usageCount}</TableCell>
                              <TableCell>{formatCurrency(template.costPerMessage)}</TableCell>
                              <TableCell className="font-medium text-red-600">
                                {formatCurrency(template.estimatedCost)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
} 