
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Reply, Archive, Trash2, Flag, Eye } from "lucide-react";
import { ClientResponse } from "@/types/clientResponse";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ClientResponseActionsProps {
  response: ClientResponse;
  onUpdate?: () => void;
}

const ClientResponseActions = ({ response, onUpdate }: ClientResponseActionsProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleReply = () => {
    // Abrir WhatsApp Web com o número do cliente
    const phoneNumber = response.phoneNumber.replace(/\D/g, '');
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp Aberto",
      description: `Redirecionado para conversa com ${response.phoneNumber}`,
    });
  };

  const handleArchive = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('client_responses')
        .update({ 
          metadata: { 
            ...response.metadata,
            archived: true,
            archived_at: new Date().toISOString()
          }
        })
        .eq('id', response.id);

      if (error) throw error;

      toast({
        title: "Arquivado",
        description: "Mensagem arquivada com sucesso",
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao arquivar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível arquivar a mensagem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowArchiveDialog(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('client_responses')
        .delete()
        .eq('id', response.id);

      if (error) throw error;

      toast({
        title: "Excluído",
        description: "Mensagem excluída com sucesso",
        variant: "destructive",
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a mensagem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleFlag = async () => {
    setIsLoading(true);
    try {
      const isCurrentlyFlagged = response.metadata?.flagged === true;
      
      const { error } = await supabase
        .from('client_responses')
        .update({ 
          metadata: { 
            ...response.metadata,
            flagged: !isCurrentlyFlagged,
            flagged_at: !isCurrentlyFlagged ? new Date().toISOString() : null
          }
        })
        .eq('id', response.id);

      if (error) throw error;

      toast({
        title: isCurrentlyFlagged ? "Desmarcado" : "Marcado",
        description: isCurrentlyFlagged 
          ? "Mensagem desmarcada" 
          : "Mensagem marcada para acompanhamento",
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao marcar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a mensagem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFlagged = response.metadata?.flagged === true;
  const isArchived = response.metadata?.archived === true;

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

            {(isFlagged || isArchived) && (
              <div>
                <label className="text-sm font-medium text-gray-600">Status:</label>
                <div className="flex gap-2 mt-1">
                  {isFlagged && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      Marcado
                    </span>
                  )}
                  {isArchived && (
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      Arquivado
                    </span>
                  )}
                </div>
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
          <DropdownMenuItem onClick={handleFlag} disabled={isLoading}>
            <Flag className={`w-4 h-4 mr-2 ${isFlagged ? 'text-orange-600' : ''}`} />
            {isFlagged ? 'Desmarcar' : 'Marcar'}
          </DropdownMenuItem>
          
          <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={isArchived}>
                <Archive className="w-4 h-4 mr-2" />
                Arquivar
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Arquivar mensagem</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja arquivar esta mensagem? Ela ficará oculta da visualização principal.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleArchive} disabled={isLoading}>
                  {isLoading ? "Arquivando..." : "Arquivar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir mensagem</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete} 
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ClientResponseActions;
