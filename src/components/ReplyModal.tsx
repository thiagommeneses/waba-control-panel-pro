
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  clientName?: string;
}

const ReplyModal = ({ isOpen, onClose, phoneNumber, clientName }: ReplyModalProps) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite uma mensagem antes de enviar.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Log início do envio
      await supabase.from('api_logs').insert({
        endpoint: 'CUSTOM_MESSAGE_SEND_START',
        request_method: 'INTERNAL',
        request_body: { 
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          messageLength: message.length,
          clientName 
        },
        response_status: 200,
        response_body: { message: 'Iniciando envio de mensagem personalizada' }
      });

      // Buscar configurações da API
      const { data: settings, error: settingsError } = await supabase
        .from('api_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (settingsError || !settings) {
        throw new Error('Configurações da API não encontradas');
      }

      const { phone_number_id: phoneNumberId, access_token: accessToken, api_version } = settings;
      
      if (!phoneNumberId || !accessToken) {
        throw new Error('Phone Number ID ou Access Token não configurados');
      }

      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      const endpoint = `https://graph.facebook.com/${api_version}/${phoneNumberId}/messages`;
      
      const requestBody = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhoneNumber,
        type: "text",
        text: {
          body: message
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      // Log da resposta da API
      await supabase.from('api_logs').insert({
        endpoint,
        request_method: 'POST',
        request_body: requestBody,
        response_status: response.status,
        response_body: data,
        error_message: data.error ? data.error.message : null
      });

      if (data.error) {
        throw new Error(data.error.message);
      }

      // Salvar mensagem enviada
      await supabase.from('sent_messages').insert({
        template_name: 'custom_message',
        phone_number: cleanPhoneNumber,
        status: 'SENT',
        wamid: data.messages?.[0]?.id,
        parameters: [{ text: message }]
      });

      // Log sucesso
      await supabase.from('api_logs').insert({
        endpoint: 'CUSTOM_MESSAGE_SEND_SUCCESS',
        request_method: 'INTERNAL',
        request_body: { 
          messageId: data.messages?.[0]?.id,
          phoneNumber: cleanPhoneNumber,
          clientName 
        },
        response_status: 200,
        response_body: { message: 'Mensagem personalizada enviada com sucesso' }
      });

      toast({
        title: "Mensagem enviada!",
        description: `Mensagem enviada para ${clientName || phoneNumber}`,
      });

      setMessage("");
      onClose();
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Log do erro
      await supabase.from('api_logs').insert({
        endpoint: 'CUSTOM_MESSAGE_SEND_ERROR',
        request_method: 'INTERNAL',
        request_body: { phoneNumber, clientName },
        response_status: 500,
        error_message: error.message
      });

      toast({
        variant: "destructive",
        title: "Erro ao enviar",
        description: error.message || "Não foi possível enviar a mensagem",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Mensagem</DialogTitle>
          <DialogDescription>
            Enviando para: {clientName || phoneNumber}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Mensagem:
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="min-h-[100px]"
              maxLength={4096}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/4096 caracteres
            </p>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSend} disabled={isLoading || !message.trim()}>
              {isLoading ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReplyModal;
