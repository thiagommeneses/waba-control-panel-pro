
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { MoreHorizontal, Reply, Archive, Trash2, Flag, Eye } from "lucide-react";
import { ClientResponse } from "@/types/clientResponse";
import { useToast } from "@/components/ui/use-toast";

interface ClientResponseActionsProps {
  response: ClientResponse;
}

const ClientResponseActions = ({ response }: ClientResponseActionsProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const handleReply = () => {
    toast({
      title: "Responder",
      description: `Preparando resposta para ${response.phoneNumber}`,
    });
    // Implementar lógica de resposta
  };

  const handleArchive = () => {
    toast({
      title: "Arquivado",
      description: "Mensagem arquivada com sucesso",
    });
    // Implementar lógica de arquivamento
  };

  const handleDelete = () => {
    toast({
      title: "Excluído",
      description: "Mensagem excluída com sucesso",
      variant: "destructive",
    });
    // Implementar lógica de exclusão
  };

  const handleFlag = () => {
    toast({
      title: "Marcado",
      description: "Mensagem marcada para acompanhamento",
    });
    // Implementar lógica de marcação
  };

  return (
    <div className="flex gap-2">
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Eye className="w-3 h-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Mensagem</DialogTitle>
            <DialogDescription>
              Informações completas sobre a mensagem recebida
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Telefone:</label>
                <p className="text-sm font-mono">{response.phoneNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Cliente:</label>
                <p className="text-sm">{response.clientName || "Não informado"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tipo:</label>
                <p className="text-sm">{response.messageType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Data/Hora:</label>
                <p className="text-sm">{response.timestampReceived.toLocaleString()}</p>
              </div>
            </div>
            
            {response.content && (
              <div>
                <label className="text-sm font-medium text-gray-600">Conteúdo:</label>
                <p className="text-sm bg-gray-50 p-3 rounded">{response.content}</p>
              </div>
            )}
            
            {response.imageCaption && (
              <div>
                <label className="text-sm font-medium text-gray-600">Legenda da Imagem:</label>
                <p className="text-sm bg-gray-50 p-3 rounded">{response.imageCaption}</p>
              </div>
            )}
            
            {response.buttonPayload && (
              <div>
                <label className="text-sm font-medium text-gray-600">Payload do Botão:</label>
                <p className="text-sm bg-purple-50 p-3 rounded font-mono">{response.buttonPayload}</p>
              </div>
            )}
            
            {response.wamid && (
              <div>
                <label className="text-sm font-medium text-gray-600">WhatsApp Message ID:</label>
                <p className="text-xs bg-gray-50 p-3 rounded font-mono break-all">{response.wamid}</p>
              </div>
            )}
            
            {response.contextWamid && (
              <div>
                <label className="text-sm font-medium text-gray-600">Contexto (Resposta a):</label>
                <p className="text-xs bg-blue-50 p-3 rounded font-mono break-all">{response.contextWamid}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleReply}>
            <Reply className="w-4 h-4 mr-2" />
            Responder
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleFlag}>
            <Flag className="w-4 h-4 mr-2" />
            Marcar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleArchive}>
            <Archive className="w-4 h-4 mr-2" />
            Arquivar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ClientResponseActions;
