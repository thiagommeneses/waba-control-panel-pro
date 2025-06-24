
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { MessagePreview } from "./MessagePreview";
import { PhoneNumberInput } from "./templates/PhoneNumberInput";
import { TemplateSelector } from "./templates/TemplateSelector";
import { TemplateParamsForm } from "./templates/TemplateParamsForm";
import { useTemplateForm } from "@/hooks/templates/useTemplateForm";
import { Template } from "@/types/template";
import { supabase } from "@/integrations/supabase/client";

const SendTemplate = () => {
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    form,
    isLoading,
    selectedTemplate,
    onTemplateSelect,
    onSubmit
  } = useTemplateForm(templates);

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    setError(null);
    
    try {
      // Get API settings from Supabase
      const { data: settings, error: settingsError } = await supabase
        .from('api_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (settingsError) {
        throw new Error("Configurações da API não encontradas. Por favor, configure as credenciais da API primeiro.");
      }
      
      const { waba_id: wabaId, access_token: accessToken } = settings;
      
      if (!wabaId || !accessToken) {
        throw new Error("WABA ID ou Access Token não configurados.");
      }
      
      const response = await fetch(
        `https://graph.facebook.com/v23.0/${wabaId}/message_templates?access_token=${accessToken}`
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
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

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
              <PhoneNumberInput control={form.control} />
              
              <TemplateSelector 
                control={form.control}
                templates={templates}
                isLoading={isLoadingTemplates}
                onTemplateSelect={onTemplateSelect}
              />
              
              <TemplateParamsForm 
                control={form.control}
                template={selectedTemplate}
                params={form.watch("params") || []}
              />
              
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
