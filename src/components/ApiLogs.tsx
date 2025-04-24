
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const ApiLogs = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["api-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Carregando logs...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Logs da API</h2>
      <ScrollArea className="h-[600px] w-full rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {new Date(log.created_at).toLocaleString("pt-BR")}
                </TableCell>
                <TableCell>{log.endpoint}</TableCell>
                <TableCell>
                  <Badge variant={log.request_method === "GET" ? "secondary" : "default"}>
                    {log.request_method}
                  </Badge>
                </TableCell>
                <TableCell>
                  {log.response_status ? (
                    <Badge variant={log.response_status < 400 ? "secondary" : "destructive"}>
                      {log.response_status}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {log.error_message ? (
                    <div className="flex items-center text-red-500">
                      <AlertCircle className="mr-1 h-4 w-4" />
                      {log.error_message}
                    </div>
                  ) : (
                    <div className="flex items-center text-green-500">
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Sucesso
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default ApiLogs;
