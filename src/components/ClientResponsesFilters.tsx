
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw } from "lucide-react";

interface ClientResponsesFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  onRefetch: () => void;
}

const ClientResponsesFilters = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  onRefetch
}: ClientResponsesFiltersProps) => {
  return (
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
      <Button onClick={onRefetch} variant="outline" size="icon">
        <RefreshCw className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default ClientResponsesFilters;
