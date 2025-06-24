
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock, RefreshCw, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const ApiLogs = () => {
  const { toast } = useToast();
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["api-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      return data;
    },
    refetchInterval: autoRefresh ? 5000 : false, // Atualiza a cada 5 segundos se autoRefresh estiver ativo
  });

  // Configurar real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('api-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'api_logs'
        },
        () => {
          refetch();
          toast({
            title: "Novo log registrado",
            description: "Um novo evento foi registrado no sistema",
            duration: 3000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, toast]);

  const clearLogs = async () => {
    try {
      const { error } = await supabase.from('api_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      
      toast({
        title: "Logs limpos",
        description: "Todos os logs foram removidos com sucesso",
      });
      
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao limpar logs",
        description: "Não foi possível limpar os logs",
      });
    }
  };

  const getStatusIcon = (status?: number, errorMessage?: string) => {
    if (errorMessage) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (!status) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    if (status >= 200 && status < 300) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (status?: number, errorMessage?: string) => {
    if (errorMessage) {
      return <Badge variant="destructive">Erro</Badge>;
    }
    if (!status) {
      return <Badge variant="secondary">Pendente</Badge>;
    }
    if (status >= 200 && status < 300) {
      return <Badge variant="secondary">Sucesso</Badge>;
    }
    return <Badge variant="destructive">{status}</Badge>;
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      'GET': 'bg-blue-100 text-blue-800',
      'POST': 'bg-green-100 text-green-800',
      'PUT': 'bg-yellow-100 text-yellow-800',
      'DELETE': 'bg-red-100 text-red-800',
      'INTERNAL': 'bg-purple-100 text-purple-800'
    };
    
    return (
      <Badge className={colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {method}
      </Badge>
    );
  };

  const getLogTypeDescription = (endpoint: string, method: string) => {
    if (endpoint.includes('TEMPLATE_SUBMISSION')) return 'Submissão de Template';
    if (endpoint.includes('TEMPLATE_APPROVED')) return 'Template Aprovado';
    if (endpoint.includes('TEMPLATE_REJECTED')) return 'Template Rejeitado';
    if (endpoint.includes('TEMPLATE_STATUS')) return 'Verificação de Status';
    if (endpoint.includes('MESSAGE_SEND')) return 'Envio de Mensagem';
    if (endpoint.includes('MONITORING')) return 'Sistema de Monitoramento';
    if (endpoint.includes('message_templates')) return 'API de Templates';
    if (endpoint.includes('messages')) return 'API de Mensagens';
    if (endpoint.includes('SUPABASE')) return 'Configurações do Sistema';
    return 'Ação do Sistema';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Logs da API</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Carregando logs...
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = {
    total: logs?.length || 0,
    success: logs?.filter(log => (log.response_status && log.response_status >= 200 && log.response_status < 300) || (!log.error_message && log.request_method === 'INTERNAL')).length || 0,
    errors: logs?.filter(log => log.error_message || (log.response_status && log.response_status >= 400)).length || 0,
    pending: logs?.filter(log => !log.response_status && !log.error_message && log.request_method !== 'INTERNAL').length || 0
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Logs da API</CardTitle>
              <CardDescription>
                Monitoramento completo de todas as ações do sistema em tempo real
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearLogs}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Logs
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Sucessos</p>
                <p className="text-2xl font-bold text-green-600">{stats.success}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Erros</p>
                <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-500 mr-2" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Logs */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.response_status, log.error_message)}
                        {getStatusBadge(log.response_status, log.error_message)}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate">
                        {getLogTypeDescription(log.endpoint, log.request_method)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getMethodBadge(log.request_method)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <div className="max-w-[300px] truncate">
                        {log.endpoint}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.error_message ? (
                        <div className="flex items-center text-red-500 max-w-[200px] truncate">
                          <AlertCircle className="mr-1 h-4 w-4" />
                          {log.error_message}
                        </div>
                      ) : log.response_status ? (
                        <div className="flex items-center text-green-500">
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Sucesso
                        </div>
                      ) : (
                        <div className="flex items-center text-yellow-500">
                          <Clock className="mr-1 h-4 w-4" />
                          Processando
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Log</DialogTitle>
                            <DialogDescription>
                              {getLogTypeDescription(log.endpoint, log.request_method)} - {new Date(log.created_at).toLocaleString("pt-BR")}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold">Informações Gerais</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><strong>Endpoint:</strong> {log.endpoint}</div>
                                <div><strong>Método:</strong> {log.request_method}</div>
                                <div><strong>Status:</strong> {log.response_status || 'N/A'}</div>
                                <div><strong>Data:</strong> {new Date(log.created_at).toLocaleString("pt-BR")}</div>
                              </div>
                            </div>
                            
                            {log.request_body && (
                              <div>
                                <h4 className="font-semibold">Request Body</h4>
                                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                                  {JSON.stringify(log.request_body, null, 2)}
                                </pre>
                              </div>
                            )}
                            
                            {log.response_body && (
                              <div>
                                <h4 className="font-semibold">Response Body</h4>
                                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                                  {JSON.stringify(log.response_body, null, 2)}
                                </pre>
                              </div>
                            )}
                            
                            {log.error_message && (
                              <div>
                                <h4 className="font-semibold text-red-600">Erro</h4>
                                <p className="text-sm text-red-600">{log.error_message}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiLogs;
