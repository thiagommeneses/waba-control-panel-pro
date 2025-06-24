
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClientResponse } from "@/types/clientResponse";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import ClientResponsesFilters from "./ClientResponsesFilters";
import ClientResponsesTable from "./ClientResponsesTable";
import ClientResponsesPagination from "./ClientResponsesPagination";

const ClientResponses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const { toast } = useToast();

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
    refetchInterval: 30000,
  });

  const handleManualRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Atualizado",
        description: "Lista de respostas atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a lista de respostas.",
      });
    }
  };

  const handleUpdate = () => {
    refetch();
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
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <div className="text-red-600">
              Erro ao carregar respostas dos clientes: {error.message}
            </div>
            <Button onClick={handleManualRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Respostas dos Clientes
              </CardTitle>
              <CardDescription>
                Visualize todas as respostas recebidas dos clientes: textos, imagens, cliques em botões e interações.
              </CardDescription>
            </div>
            <Button onClick={handleManualRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ClientResponsesFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            onRefetch={() => refetch()}
          />

          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p>Carregando respostas...</p>
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <div>
                <p className="text-gray-500 mb-2">Nenhuma resposta encontrada</p>
                <p className="text-sm text-gray-400">
                  Certifique-se de que o webhook está configurado corretamente no Meta for Developers
                </p>
              </div>
              <Button onClick={handleManualRefresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Verificar novamente
              </Button>
            </div>
          ) : (
            <>
              <ClientResponsesTable responses={paginatedResponses} onUpdate={handleUpdate} />
              <ClientResponsesPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalResponses={responses.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientResponses;
