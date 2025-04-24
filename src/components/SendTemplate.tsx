
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessagePreview } from "./MessagePreview";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

const formSchema = z.object({
  phoneNumber: z.string().min(10, "Número de telefone inválido").max(15),
  templateName: z.string().min(1, "Selecione um template"),
  language: z.string().min(1, "Selecione um idioma"),
  params: z.array(z.string().optional()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Tipo para os templates da API
interface Template {
  id: string;
  name: string;
  status: string;
  category: string;
  language: string;
  components: {
    type: string;
    format?: string;
    text?: string;
    buttons?: Array<{
      type: string;
      text: string;
    }>;
  }[];
}

const SendTemplate = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Templates fallback se não conseguir carregar da API
  const fallbackTemplates = [
    {
      id: "1",
      name: "boas_vindas",
      status: "APPROVED",
      category: "MARKETING",
      language: "pt_BR",
      components: [
        {
          type: "HEADER",
          format: "TEXT",
          text: "Olá! Boas-vindas à nossa plataforma"
        },
        {
          type: "BODY",
          text: "Olá {{1}}, obrigado por se juntar a nós! Estamos felizes em ter você como cliente. Se precisar de ajuda, é só nos contatar."
        },
        {
          type: "FOOTER",
          text: "Atendimento disponível de segunda a sexta"
        },
        {
          type: "BUTTONS",
          buttons: [
            {
              type: "QUICK_REPLY",
              text: "Ver produtos"
            }
          ]
        }
      ]
    },
    {
      id: "2",
      name: "confirmacao_agendamento",
      status: "APPROVED",
      category: "UTILITY",
      language: "pt_BR",
      components: [
        {
          type: "HEADER",
          format: "TEXT",
          text: "Confirmação de Agendamento"
        },
        {
          type: "BODY",
          text: "Olá {{1}}, sua consulta foi agendada para {{2}} às {{3}}. Por favor, confirme sua presença respondendo esta mensagem."
        },
        {
          type: "FOOTER",
          text: "Cancelamentos devem ser feitos com 24h de antecedência"
        }
      ]
    }
  ];

  const languages = [
    { value: "pt_BR", label: "Português (Brasil)" },
    { value: "en_US", label: "English (US)" },
    { value: "es_ES", label: "Español" },
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
      templateName: "",
      language: "pt_BR",
      params: [],
    },
  });

  // Função para buscar templates da API
  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    setError(null);
    
    try {
      const settingsJson = localStorage.getItem('wabaSettings');
      
      if (!settingsJson) {
        throw new Error("Configurações não encontradas. Por favor, configure as credenciais da API primeiro.");
      }
      
      const settings = JSON.parse(settingsJson);
      const { wabaId, accessToken } = settings;
      
      if (!wabaId || !accessToken) {
        throw new Error("WABA ID ou Access Token não configurados.");
      }
      
      // Chamada para a API da Meta
      const response = await fetch(
        `https://graph.facebook.com/v22.0/${wabaId}/message_templates?access_token=${accessToken}`
      );
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "Erro ao buscar templates");
      }
      
      if (data.data && Array.isArray(data.data)) {
        setTemplates(data.data);
        console.log("Templates carregados:", data.data);
      } else {
        throw new Error("Formato de resposta inválido");
      }
    } catch (error) {
      console.error("Erro ao buscar templates:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido ao carregar templates");
      // Usar templates fallback em caso de erro
      setTemplates(fallbackTemplates);
      
      toast({
        variant: "destructive",
        title: "Erro ao carregar templates",
        description: error instanceof Error ? error.message : "Verifique suas configurações e tente novamente.",
      });
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Carregar templates quando o componente montar
  useEffect(() => {
    fetchTemplates();
  }, []);

  const onTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.name === templateId);
    setSelectedTemplate(template || null);
    
    // Reset params array based on template variables
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
      // Obter configurações salvas
      const settingsJson = localStorage.getItem('wabaSettings');
      
      if (!settingsJson) {
        throw new Error("Configurações não encontradas. Por favor, configure as credenciais da API primeiro.");
      }
      
      const settings = JSON.parse(settingsJson);
      const { phoneNumberId, accessToken } = settings;
      
      if (!phoneNumberId || !accessToken) {
        throw new Error("Phone Number ID ou Access Token não configurados.");
      }
      
      console.log("Enviando template:", values);
      
      // Em uma implementação real, faria a chamada para a API aqui
      // Exemplo:
      // const response = await fetch(
      //   `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      //   {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       messaging_product: "whatsapp",
      //       to: values.phoneNumber,
      //       type: "template",
      //       template: { 
      //         name: values.templateName,
      //         language: { code: values.language },
      //         components: values.params ? [
      //           { type: "body", parameters: values.params.map(p => ({ type: "text", text: p })) }
      //         ] : []
      //       }
      //     })
      //   }
      // );
      
      // Simulando envio da requisição
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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Enviar Template</CardTitle>
          <CardDescription>
            Selecione um template e preencha os parâmetros para enviar uma mensagem
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro ao carregar templates</AlertTitle>
              <AlertDescription>
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchTemplates}
                  disabled={isLoadingTemplates}
                  className="mt-2"
                >
                  {isLoadingTemplates ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    "Tentar novamente"
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Telefone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: 5511999999999" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="templateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        onTemplateSelect(value);
                      }}
                      value={field.value}
                      disabled={isLoadingTemplates}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingTemplates ? "Carregando..." : "Selecione um template"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingTemplates ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Carregando templates...</span>
                          </div>
                        ) : templates.map((template) => (
                          <SelectItem 
                            key={template.id} 
                            value={template.name}
                          >
                            {template.name} ({template.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idioma</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o idioma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem 
                            key={language.value} 
                            value={language.value}
                          >
                            {language.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedTemplate && form.watch("params") && (
                <div className="space-y-4">
                  <div className="text-sm font-medium">Parâmetros</div>
                  {form.watch("params")?.map((_, index) => (
                    <FormField
                      key={`param-${index}`}
                      control={form.control}
                      name={`params.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parâmetro {index + 1}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={`Valor para {{${index + 1}}}`} 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Mensagem"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <MessagePreview 
        template={selectedTemplate} 
        params={form.watch("params") || []} 
      />
    </div>
  );
};

export default SendTemplate;
