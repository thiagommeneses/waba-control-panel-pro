
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Template } from "@/types/template";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  phoneNumber: z.string().min(10, "Número de telefone deve ter pelo menos 10 dígitos"),
  templateName: z.string().min(1, "Selecione um template"),
  params: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

const logApiCall = async (
  endpoint: string,
  method: string,
  requestBody?: any,
  responseStatus?: number,
  responseBody?: any,
  errorMessage?: string
) => {
  try {
    await supabase.from('api_logs').insert({
      endpoint,
      request_method: method,
      request_body: requestBody,
      response_status: responseStatus,
      response_body: responseBody,
      error_message: errorMessage
    });
  } catch (error) {
    console.error('Erro ao salvar log:', error);
  }
};

export const useTemplateForm = (templates: Template[]) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
      templateName: "",
      params: [],
    },
  });

  const onTemplateSelect = (templateName: string) => {
    const template = templates.find(t => t.name === templateName);
    setSelectedTemplate(template || null);
    
    if (template) {
      // Log seleção de template
      logApiCall(
        'TEMPLATE_SELECTION',
        'INTERNAL',
        { templateName, templateId: template.id },
        200,
        { message: 'Template selecionado para envio' }
      );
      
      // Reset params when template changes
      const bodyComponent = template.components?.find(c => c.type === 'BODY');
      const paramCount = bodyComponent?.text?.match(/\{\{(\d+)\}\}/g)?.length || 0;
      form.setValue("params", Array(paramCount).fill(""));
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedTemplate) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um template antes de enviar",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Log início do envio
      await logApiCall(
        'MESSAGE_SEND_START',
        'INTERNAL',
        { 
          phoneNumber: data.phoneNumber, 
          templateName: data.templateName,
          paramCount: data.params?.length || 0
        },
        200,
        { message: 'Iniciando envio de mensagem' }
      );

      // Get API settings from Supabase
      const { data: settings, error: settingsError } = await supabase
        .from('api_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (settingsError) {
        const errorMsg = 'Configurações da API não encontradas. Por favor, configure as credenciais da API primeiro.';
        await logApiCall(
          'SUPABASE_API_SETTINGS',
          'GET',
          null,
          500,
          null,
          errorMsg
        );
        throw new Error(errorMsg);
      }
      
      const { phone_number_id: phoneNumberId, access_token: accessToken, api_version } = settings;
      
      if (!phoneNumberId || !accessToken) {
        const errorMsg = 'Phone Number ID ou Access Token não configurados.';
        await logApiCall(
          'API_CREDENTIALS_CHECK',
          'INTERNAL',
          { phoneNumberId: !!phoneNumberId, accessToken: !!accessToken },
          400,
          null,
          errorMsg
        );
        throw new Error(errorMsg);
      }

      // Build components array
      const components: any[] = [];
      
      // Add body component with parameters if template has placeholders
      const bodyComponent = selectedTemplate.components?.find(c => c.type === 'BODY');
      if (bodyComponent && data.params && data.params.length > 0) {
        components.push({
          type: "body",
          parameters: data.params.map(param => ({
            type: "text",
            text: param
          }))
        });
      }

      // Add button components if template has buttons
      const buttonComponent = selectedTemplate.components?.find(c => c.type === 'BUTTONS');
      if (buttonComponent?.buttons) {
        buttonComponent.buttons.forEach((button, index) => {
          if (button.type === 'FLOW') {
            components.push({
              type: "button",
              sub_type: "flow",
              index: index,
              parameters: [
                {
                  type: "text",
                  text: button.text
                }
              ]
            });
          }
        });
      }

      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: data.phoneNumber,
        type: "template",
        template: {
          name: selectedTemplate.name,
          language: {
            code: selectedTemplate.language,
            policy: "deterministic"
          },
          components: components
        }
      };

      const endpoint = `https://graph.facebook.com/${api_version || 'v22.0'}/${phoneNumberId}/messages`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      // Log da resposta
      await logApiCall(
        endpoint,
        'POST',
        payload,
        response.status,
        result,
        result.error ? result.error.message : null
      );

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Log sucesso
      await logApiCall(
        'MESSAGE_SEND_SUCCESS',
        'INTERNAL',
        { 
          messageId: result.messages?.[0]?.id,
          phoneNumber: data.phoneNumber,
          templateName: data.templateName
        },
        200,
        { message: 'Mensagem enviada com sucesso' }
      );

      toast({
        title: "Mensagem enviada!",
        description: `Mensagem enviada com sucesso para ${data.phoneNumber}`,
      });

      // Reset form
      form.reset();
      setSelectedTemplate(null);

    } catch (error: any) {
      // Log erro
      await logApiCall(
        'MESSAGE_SEND_ERROR',
        'POST',
        { phoneNumber: data.phoneNumber, templateName: data.templateName },
        500,
        null,
        error.message || 'Erro ao enviar mensagem'
      );

      toast({
        variant: "destructive",
        title: "Erro ao enviar mensagem",
        description: error.message || "Erro desconhecido",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    selectedTemplate,
    onTemplateSelect,
    onSubmit,
  };
};
