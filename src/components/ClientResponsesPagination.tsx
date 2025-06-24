
import React from "react";
import { Button } from "@/components/ui/button";

interface ClientResponsesPaginationProps {
  currentPage: number;
  totalPages: number;
  totalResponses: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const ClientResponsesPagination = ({
  currentPage,
  totalPages,
  totalResponses,
  itemsPerPage,
  onPageChange
}: ClientResponsesPaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-gray-600">
        Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalResponses)} de {totalResponses} respostas
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
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
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
};

export default ClientResponsesPagination;
