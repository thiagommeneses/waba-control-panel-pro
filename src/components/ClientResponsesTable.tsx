
import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClientResponse } from "@/types/clientResponse";
import ClientResponseRow from "./ClientResponseRow";

interface ClientResponsesTableProps {
  responses: ClientResponse[];
  onUpdate?: () => void;
}

const ClientResponsesTable = ({ responses, onUpdate }: ClientResponsesTableProps) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Tipo</TableHead>
            <TableHead className="w-[200px]">Cliente</TableHead>
            <TableHead>Conteúdo</TableHead>
            <TableHead className="w-[180px]">Data/Hora</TableHead>
            <TableHead className="w-[120px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses.map((response) => (
            <ClientResponseRow 
              key={response.id} 
              response={response} 
              onUpdate={onUpdate}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientResponsesTable;
