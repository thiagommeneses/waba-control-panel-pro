
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessagePreview } from "./MessagePreview";
import { Check, Info, Loader2, Plus, Trash2, UploadCloud } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(1, "Nome obrigatório")
    .regex(/^[a-z0-9_]+$/, "Apenas letras minúsculas, números e underscore"),
  category: z.string().min(1, "Categoria obrigatória"),
  language: z.string().min(1, "Idioma obrigatório"),
  headerType: z.string().optional(),
  headerText: z.string().optional(),
  bodyText: z.string().min(1, "Texto do corpo obrigatório"),
  footerText: z.string().optional(),
  hasButtons: z.boolean().default(false),
  buttons: z.array(
    z.object({
      type: z.string(),
      text: z.string().min(1, "Texto do botão obrigatório")
    })
  ).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateTemplate = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [previewParams, setPreviewParams] = useState<string[]>([]);
  
  const categories = [
    { value: "MARKETING", label: "Marketing" },
    { value: "UTILITY", label: "Utilidade" },
    { value: "AUTHENTICATION", label: "Autenticação" },
  ];

  const headerTypes = [
    { value: "NONE", label: "Sem cabeçalho" },
    { value: "TEXT", label: "Texto" },
    { value: "IMAGE", label: "Imagem" },
    { value: "VIDEO", label: "Vídeo" },
    { value: "DOCUMENT", label: "Documento" },
  ];

  const buttonTypes = [
    { value: "QUICK_REPLY", label: "Resposta Rápida" },
    { value: "URL", label: "Link URL" },
    { value: "PHONE_NUMBER", label: "Número de Telefone" },
  ];

  const languages = [
    { value: "pt_BR", label: "Português (Brasil)" },
    { value: "en_US", label: "English (US)" },
    { value: "es_ES", label: "Español" },
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      language: "pt_BR",
      headerType: "NONE",
      headerText: "",
      bodyText: "",
      footerText: "",
      hasButtons: false,
      buttons: [{ type: "QUICK_REPLY", text: "" }],
    },
  });

  const watchHeaderType = form.watch("headerType");
  const watchBodyText = form.watch("bodyText");
  const watchHasButtons = form.watch("hasButtons");
  const watchButtons = form.watch("buttons");

  const updatePreview = () => {
    const values = form.getValues();
    
    // Extract parameters from body text
    const paramMatches = Array.from((values.bodyText || "").matchAll(/\{\{(\d+)\}\}/g));
    const paramsCount = paramMatches.length;
    const exampleParams = Array(paramsCount).fill("Exemplo");
    
    setPreviewParams(exampleParams);
    
    // Create template object for preview
    const components = [];
    
    if (values.headerType && values.headerType !== "NONE") {
      components.push({
        type: "HEADER",
        format: values.headerType,
        text: values.headerText || ""
      });
    }
    
    if (values.bodyText) {
      components.push({
        type: "BODY",
        text: values.bodyText
      });
    }
    
    if (values.footerText) {
      components.push({
        type: "FOOTER",
        text: values.footerText
      });
    }
    
    if (values.hasButtons && values.buttons && values.buttons.length > 0) {
      components.push({
        type: "BUTTONS",
        buttons: values.buttons.map(button => ({
          type: button.type,
          text: button.text
        }))
      });
    }
    
    setPreviewTemplate({
      name: values.name || "novo_template",
      status: "PENDING",
      category: values.category || "UTILITY",
      language: values.language || "pt_BR",
      components
    });
  };

  // Update preview whenever form values change
  React.useEffect(() => {
    updatePreview();
  }, [watchBodyText, watchHeaderType, watchHasButtons, watchButtons, form]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      // Simulando envio da requisição
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Criando template:", values);
      
      toast({
        title: "Template enviado para aprovação!",
        description: `Template ${values.name} foi enviado para aprovação.`,
      });
      
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar template",
        description: "Ocorreu um problema ao enviar seu template. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addButton = () => {
    const currentButtons = form.getValues().buttons || [];
    if (currentButtons.length < 3) {
      form.setValue("buttons", [
        ...currentButtons,
        { type: "QUICK_REPLY", text: "" }
      ]);
    } else {
      toast({
        description: "O máximo de botões permitido é 3.",
      });
    }
  };

  const removeButton = (index: number) => {
    const currentButtons = form.getValues().buttons || [];
    form.setValue("buttons", currentButtons.filter((_, i) => i !== index));
  };

  const uploadHeader = (type: string) => {
    toast({
      title: "Upload de arquivo",
      description: "Funcionalidade de upload será implementada em breve.",
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Criar Template</CardTitle>
            <CardDescription>
              Crie um novo template para aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="basic">Básico</TabsTrigger>
                    <TabsTrigger value="content">Conteúdo</TabsTrigger>
                    <TabsTrigger value="buttons">Botões</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Template</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="nome_do_template" 
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Use apenas letras minúsculas, números e underscore
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem 
                                  key={category.value} 
                                  value={category.value}
                                >
                                  {category.label}
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
                  </TabsContent>
                  
                  <TabsContent value="content" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="headerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Cabeçalho</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de cabeçalho" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {headerTypes.map((type) => (
                                <SelectItem 
                                  key={type.value} 
                                  value={type.value}
                                >
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {watchHeaderType && watchHeaderType !== "NONE" && (
                      <>
                        {watchHeaderType === "TEXT" ? (
                          <FormField
                            control={form.control}
                            name="headerText"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Texto do Cabeçalho</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Texto do cabeçalho" 
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <div className="space-y-2">
                            <Label>Upload de {watchHeaderType.toLowerCase()}</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                              <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500 mb-2">
                                Clique para fazer upload
                              </p>
                              <Button 
                                variant="outline" 
                                onClick={() => uploadHeader(watchHeaderType)}
                                type="button"
                              >
                                Selecionar arquivo
                              </Button>
                            </div>
                            {watchHeaderType !== "DOCUMENT" && (
                              <FormField
                                control={form.control}
                                name="headerText"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Legenda (opcional)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="Legenda do cabeçalho" 
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>
                        )}
                      </>
                    )}
                    
                    <FormField
                      control={form.control}
                      name="bodyText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Corpo da Mensagem</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Corpo da mensagem. Use {{1}}, {{2}}, etc. para variáveis." 
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Use {{1}}, {{2}} para parâmetros que serão preenchidos depois
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="footerText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rodapé (opcional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Texto do rodapé" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="buttons" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="hasButtons"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Adicionar Botões</FormLabel>
                            <FormDescription>
                              Inclua botões de ação no template
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {watchHasButtons && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Botões</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addButton}
                            disabled={watchButtons?.length >= 3}
                            type="button"
                          >
                            <Plus className="mr-1 h-4 w-4" /> Adicionar
                          </Button>
                        </div>
                        
                        {watchButtons?.map((_, index) => (
                          <div key={index} className="space-y-3 p-3 border rounded-md">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">Botão {index + 1}</h4>
                              {index > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeButton(index)}
                                  type="button"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                            
                            <FormField
                              control={form.control}
                              name={`buttons.${index}.type`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {buttonTypes.map((type) => (
                                        <SelectItem 
                                          key={type.value} 
                                          value={type.value}
                                        >
                                          {type.label}
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
                              name={`buttons.${index}.text`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Texto</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Texto do botão" 
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                
                <div className="pt-4">
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
                      "Enviar Template para Aprovação"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Observações sobre aprovação</h4>
                <p className="text-sm text-amber-700 mt-1">
                  O processo de aprovação do template pode levar até 48 horas. 
                  Templates que violam as diretrizes do WhatsApp podem ser rejeitados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <MessagePreview 
        template={previewTemplate} 
        params={previewParams} 
      />
    </div>
  );
};

export default CreateTemplate;
