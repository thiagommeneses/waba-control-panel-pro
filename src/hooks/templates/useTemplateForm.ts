
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { FormValues, Template } from "@/types/template";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  phoneNumber: z.string().min(10, "Número de telefone inválido").max(15),
  templateName: z.string().min(1, "Selecione um template"),
  language: z.string().min(1, "Selecione um idioma"),
  params: z.array(z.string().optional()).optional(),
});

export const useTemplateForm = (templates: Template[]) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
      templateName: "",
      language: "pt_BR",
      params: [],
    },
  });

  const onTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.name === templateId);
    setSelectedTemplate(template || null);
    
    if (template) {
      const bodyComponent = template.components.find(c => c.type === "BODY");
      if (bodyComponent && bodyComponent.text) {
        const text = bodyComponent.text;
        const paramMatches = Array.from(text.matchAll(/\{\{(\d+)\}\}/g));
        const paramsCount = paramMatches.length;
        form.setValue("params", Array(paramsCount).fill(""));
      }
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      // Get API settings from Supabase
      const { data: settings, error: settingsError } = await supabase
        .from('api_settings')
        .select('*')
        .limit(1)
        .single();
        
      if (settingsError) {
        throw new Error("Erro ao carregar configurações da API. Por favor, verifique as configurações.");
      }
      
      const { phone_number_id: phoneNumberId, access_token: accessToken } = settings;
      
      if (!phoneNumberId || !accessToken) {
        throw new Error("Phone Number ID ou Access Token não configurados.");
      }

      // Prepare parameters array from form values
      const parameters = values.params?.map(param => ({
        type: "text",
        text: param
      })) || [];

      // Format components based on selected template
      const components = [];
      
      // Add body component with parameters
      if (parameters.length > 0) {
        components.push({
          type: "body",
          parameters: parameters
        });
      }
      
      // Check if template has buttons and add them if needed
      if (selectedTemplate?.components.find(c => c.type === "BUTTONS")) {
        selectedTemplate.components.find(c => c.type === "BUTTONS")?.buttons?.forEach((button, index) => {
          if (button.type === "FLOW") {
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

      // API endpoint
      const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

      // Request body based on the Python example format
      const requestBody = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: values.phoneNumber,
        type: "template",
        template: {
          name: values.templateName,
          language: {
            code: values.language,
            policy: "deterministic"
          },
          components: components
        }
      };

      // Log the API call to the database
      const { data: logEntry, error: logError } = await supabase
        .from('api_logs')
        .insert({
          endpoint: url,
          request_method: 'POST',
          request_body: requestBody
        })
        .select()
        .single();

      // Send the request to the WhatsApp API
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      });
      
      const responseData = await response.json();
      
      // Update the log with the response
      await supabase
        .from('api_logs')
        .update({
          response_status: response.status,
          response_body: responseData,
          error_message: !response.ok ? responseData.error?.message : null
        })
        .eq('id', logEntry.id);
      
      if (!response.ok) {
        throw new Error(responseData.error?.message || "Erro ao enviar mensagem");
      }
      
      toast({
        title: "Mensagem enviada com sucesso!",
        description: `Template ${values.templateName} enviado para ${values.phoneNumber}`,
      });
      
      form.reset();
      setSelectedTemplate(null);
    } catch (error) {
      console.error("Erro ao enviar template:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar mensagem",
        description: error instanceof Error ? error.message : "Ocorreu um problema ao enviar sua mensagem. Tente novamente.",
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
