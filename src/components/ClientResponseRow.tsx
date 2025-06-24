
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, ExternalLink, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClientResponse } from "@/types/clientResponse";
import { getMessageTypeBadge } from "@/utils/clientResponseUtils";

interface ClientResponseRowProps {
  response: ClientResponse;
}

const ClientResponseRow = ({ response }: ClientResponseRowProps) => {
  return (
    <TableRow>
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
  );
};

export default ClientResponseRow;
