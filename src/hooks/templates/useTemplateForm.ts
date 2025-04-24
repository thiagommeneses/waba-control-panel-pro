
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Template } from "@/types/template";

const formSchema = z.object({
  phoneNumber: z.string().min(10, "Número de telefone inválido").max(15),
  templateName: z.string().min(1, "Selecione um template"),
  language: z.string().min(1, "Selecione um idioma"),
  params: z.array(z.string().optional()).optional(),
});

export type FormValues = z.infer<typeof formSchema>;

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
      const settingsJson = localStorage.getItem('wabaSettings');
      
      if (!settingsJson) {
        throw new Error("Configurações não encontradas. Por favor, configure as credenciais da API primeiro.");
      }
      
      const settings = JSON.parse(settingsJson);
      const { phoneNumberId, accessToken } = settings;
      
      if (!phoneNumberId || !accessToken) {
        throw new Error("Phone Number ID ou Access Token não configurados.");
      }
      
      // Simulando envio da requisição por enquanto
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Mensagem enviada com sucesso!",
        description: `Template ${values.templateName} enviado para ${values.phoneNumber}`,
      });
      
      form.reset();
      setSelectedTemplate(null);
    } catch (error) {
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
