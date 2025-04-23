
import React, { useState } from "react";
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
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  phoneNumber: z.string().min(10, "Número de telefone inválido").max(15),
  templateName: z.string().min(1, "Selecione um template"),
  language: z.string().min(1, "Selecione um idioma"),
  params: z.array(z.string().optional()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SendTemplate = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
  // Dados de exemplo - em uma aplicação real, estes viriam da API
  const templates = [
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

  const onTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.name === templateId);
    setSelectedTemplate(template);
    
    // Reset params array based on template variables
    if (template) {
      const bodyComponent = template.components.find(c => c.type === "BODY");
      if (bodyComponent) {
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
      // Simulando envio da requisição
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Enviando template:", values);
      
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
        description: "Ocorreu um problema ao enviar sua mensagem. Tente novamente.",
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
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templates.map((template) => (
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
