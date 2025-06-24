
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClientResponse } from "@/types/clientResponse";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Mouse, 
  Search,
  RefreshCw,
  Phone,
  Calendar,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ClientResponses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fetchClientResponses = async (): Promise<ClientResponse[]> => {
    console.log("Fetching client responses...");
    
    let query = supabase
      .from("client_responses")
      .select("*")
      .order("timestamp_received", { ascending: false });

    if (filterType !== "all") {
      query = query.eq("message_type", filterType);
    }

    if (searchTerm) {
      query = query.or(`phone_number.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching client responses:", error);
      throw error;
    }

    console.log("Client responses fetched:", data?.length || 0);

    return (data || []).map(response => ({
      id: response.id,
      phoneNumber: response.phone_number,
      messageType: response.message_type as ClientResponse['messageType'],
      content: response.content,
      imageUrl: response.image_url,
      imageCaption: response.image_caption,
      buttonPayload: response.button_payload,
      wamid: response.wamid,
      timestampReceived: new Date(response.timestamp_received),
      contextWamid: response.context_wamid,
      clientName: response.client_name,
      metadata: response.metadata
    }));
  };

  const { data: responses = [], isLoading, error, refetch } = useQuery({
    queryKey: ['clientResponses', searchTerm, filterType],
    queryFn: fetchClientResponses,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <MessageSquare className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'button_reply':
      case 'interactive':
        return <Mouse className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getMessageTypeBadge = (type: string) => {
    const colors = {
      text: "bg-blue-100 text-blue-800",
      image: "bg-green-100 text-green-800",
      button_reply: "bg-purple-100 text-purple-800",
      interactive: "bg-orange-100 text-orange-800"
    };

    const labels = {
      text: "Texto",
      image: "Imagem",
      button_reply: "Botão",
      interactive: "Interativo"
    };

    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {getMessageTypeIcon(type)}
        <span className="ml-1">{labels[type as keyof typeof labels] || type}</span>
      </Badge>
    );
  };

  const paginatedResponses = responses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(responses.length / itemsPerPage);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Erro ao carregar respostas dos clientes: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Respostas dos Clientes
          </CardTitle>
          <CardDescription>
            Visualize todas as respostas recebidas dos clientes: textos, imagens, cliques em botões e interações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por telefone, nome ou conteúdo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="image">Imagem</SelectItem>
                <SelectItem value="button_reply">Botão</SelectItem>
                <SelectItem value="interactive">Interativo</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => refetch()} variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p>Carregando respostas...</p>
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma resposta encontrada</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">Tipo</TableHead>
                      <TableHead className="w-40">Cliente</TableHead>
                      <TableHead>Conteúdo</TableHead>
                      <TableHead className="w-48">Data/Hora</TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedResponses.map((response) => (
                      <TableRow key={response.id}>
                        <TableCell>
                          {getMessageTypeBadge(response.messageType)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="text-sm font-mono">
                                {response.phoneNumber}
                              </span>
                            </div>
                            {response.clientName && (
                              <div className="text-sm text-gray-600">
                                {response.clientName}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2 max-w-md">
                            {response.messageType === 'text' && response.content && (
                              <p className="text-sm">{response.content}</p>
                            )}
                            {response.messageType === 'image' && (
                              <div className="space-y-2">
                                {response.imageUrl && (
                                  <div className="flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-green-600" />
                                    <a 
                                      href={response.imageUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                      Ver imagem
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                )}
                                {response.imageCaption && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Legenda:</span> {response.imageCaption}
                                  </p>
                                )}
                              </div>
                            )}
                            {(response.messageType === 'button_reply' || response.messageType === 'interactive') && (
                              <div className="space-y-1">
                                {response.content && (
                                  <p className="text-sm">
                                    <span className="font-medium">Texto:</span> {response.content}
                                  </p>
                                )}
                                {response.buttonPayload && (
                                  <p className="text-sm text-purple-600">
                                    <span className="font-medium">Payload:</span> {response.buttonPayload}
                                  </p>
                                )}
                              </div>
                            )}
                            {response.wamid && (
                              <p className="text-xs text-gray-400 font-mono">
                                ID: {response.wamid}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {format(response.timestampReceived, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="h-8">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, responses.length)} de {responses.length} respostas
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <span className="flex items-center px-3 text-sm">
                      {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientResponses;
