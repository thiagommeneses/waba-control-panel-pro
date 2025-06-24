
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClientResponse } from "@/types/clientResponse";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, RefreshCw } from "lucide-react";
import ClientResponsesFilters from "./ClientResponsesFilters";
import ClientResponsesTable from "./ClientResponsesTable";
import ClientResponsesPagination from "./ClientResponsesPagination";

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
    refetchInterval: 30000,
  });

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
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma resposta encontrada</p>
            </div>
          ) : (
            <>
              <ClientResponsesTable responses={paginatedResponses} />
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
