
import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClientResponse } from "@/types/clientResponse";
import ClientResponseRow from "./ClientResponseRow";

interface ClientResponsesTableProps {
  responses: ClientResponse[];
}

const ClientResponsesTable = ({ responses }: ClientResponsesTableProps) => {
  return (
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
          {responses.map((response) => (
            <ClientResponseRow key={response.id} response={response} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientResponsesTable;
