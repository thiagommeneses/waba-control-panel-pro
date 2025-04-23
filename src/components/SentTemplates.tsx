
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DownloadCloud, 
  Filter, 
  MoreHorizontal, 
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Dados de exemplo para mensagens enviadas
const sentMessages = [
  {
    id: "msg1",
    templateName: "boas_vindas",
    phoneNumber: "5511999998888",
    status: "DELIVERED",
    timestamp: new Date(2025, 3, 20, 14, 30),
    params: ["João Silva"]
  },
  {
    id: "msg2",
    templateName: "confirmacao_agendamento",
    phoneNumber: "5511999997777",
    status: "DELIVERED",
    timestamp: new Date(2025, 3, 20, 13, 45),
    params: ["Maria Oliveira", "22/04/2025", "14:00"]
  },
  {
    id: "msg3",
    templateName: "boas_vindas",
    phoneNumber: "5511999996666",
    status: "FAILED",
    timestamp: new Date(2025, 3, 20, 12, 15),
    params: ["Pedro Santos"]
  },
  {
    id: "msg4",
    templateName: "confirmacao_agendamento",
    phoneNumber: "5511999995555",
    status: "SENT",
    timestamp: new Date(2025, 3, 20, 11, 30),
    params: ["Ana Costa", "21/04/2025", "10:30"]
  },
  {
    id: "msg5",
    templateName: "boas_vindas",
    phoneNumber: "5511999994444",
    status: "DELIVERED",
    timestamp: new Date(2025, 3, 19, 16, 20),
    params: ["Carlos Ferreira"]
  },
  {
    id: "msg6",
    templateName: "confirmacao_agendamento",
    phoneNumber: "5511999993333",
    status: "READ",
    timestamp: new Date(2025, 3, 19, 15, 10),
    params: ["Julia Mendes", "20/04/2025", "16:45"]
  },
  {
    id: "msg7",
    templateName: "boas_vindas",
    phoneNumber: "5511999992222",
    status: "DELIVERED",
    timestamp: new Date(2025, 3, 19, 14, 50),
    params: ["Roberto Alves"]
  },
];

const SentTemplates = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Entregue</Badge>;
      case "READ":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Lido</Badge>;
      case "SENT":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Enviado</Badge>;
      case "FAILED":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Falha</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith("55")) {
      // Format Brazilian phone number: 5511999998888 -> +55 (11) 99999-8888
      const countryCode = phone.substring(0, 2);
      const areaCode = phone.substring(2, 4);
      const firstPart = phone.substring(4, 9);
      const secondPart = phone.substring(9);
      return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
    }
    return phone;
  };

  const handleExport = () => {
    toast({
      title: "Exportação iniciada",
      description: "O arquivo CSV será gerado e baixado automaticamente.",
    });
    
    setTimeout(() => {
      toast({
        title: "Exportação concluída",
        description: "O arquivo foi baixado com sucesso.",
      });
    }, 1500);
  };

  const handleReset = () => {
    setSearchTerm("");
    toast({
      description: "Filtros limpos com sucesso.",
    });
  };

  // Filtragem básica por template ou número de telefone
  const filteredMessages = sentMessages.filter((msg) => 
    msg.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.phoneNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Templates Enviados</CardTitle>
              <CardDescription>
                Histórico de mensagens enviadas pela API WhatsApp
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleExport}
            >
              <DownloadCloud className="h-4 w-4" /> 
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por template ou telefone"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              {searchTerm && (
                <Button variant="ghost" onClick={handleReset}>
                  Limpar
                </Button>
              )}
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableCaption>
                Total de {filteredMessages.length} mensagens
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Parâmetros</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell className="font-medium">
                      {message.templateName}
                    </TableCell>
                    <TableCell>
                      {formatPhoneNumber(message.phoneNumber)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(message.status)}
                    </TableCell>
                    <TableCell>
                      {format(message.timestamp, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600 text-sm">
                        {message.params.join(", ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Reenviar</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredMessages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      Nenhuma mensagem encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SentTemplates;
