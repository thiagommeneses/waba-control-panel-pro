
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Phone, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClientResponse } from "@/types/clientResponse";
import { getMessageTypeBadge } from "@/utils/clientResponseUtils";
import ClientResponseActions from "./ClientResponseActions";
import ImageViewer from "./ImageViewer";

interface ClientResponseRowProps {
  response: ClientResponse;
  onUpdate?: () => void;
}

const ClientResponseRow = ({ response, onUpdate }: ClientResponseRowProps) => {
  // Helper function to safely get metadata as object
  const getMetadata = () => {
    if (response.metadata && typeof response.metadata === 'object' && response.metadata !== null && !Array.isArray(response.metadata)) {
      return response.metadata as Record<string, any>;
    }
    return {};
  };

  const metadata = getMetadata();
  const isFlagged = metadata.flagged === true;
  const isArchived = metadata.archived === true;

  return (
    <TableRow className={`${isArchived ? 'opacity-60' : ''} ${isFlagged ? 'bg-orange-50' : ''}`}>
      <TableCell>
        <div className="flex items-center gap-2">
          {getMessageTypeBadge(response.messageType)}
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
          {response.messageType === 'image' && response.imageUrl && (
            <ImageViewer 
              imageUrl={response.imageUrl} 
              imageCaption={response.imageCaption}
            />
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
        <ClientResponseActions response={response} onUpdate={onUpdate} />
      </TableCell>
    </TableRow>
  );
};

export default ClientResponseRow;
