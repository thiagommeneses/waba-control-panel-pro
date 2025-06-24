import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  Check, 
  Copy, 
  Key, 
  Lock, 
  AlertTriangle, 
  Save,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Webhook
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenVisible, setIsTokenVisible] = useState(false);
  const [isSecretVisible, setIsSecretVisible] = useState(false);
  
  const [settings, setSettings] = useState({
    wabaId: "",
    businessId: "",
    phoneNumberId: "",
    accessToken: "",
    apiVersion: "v23.0",
    requestTimeout: 30000,
    webhookUrl: "",
    webhookSecret: ""
  });

  const webhookUrl = "https://rgmvgftedjnhrlbprxkp.supabase.co/functions/v1/whatsapp-webhook";

  useEffect(() => {
    // Carregar configurações do banco de dados
    const loadSettings = async () => {
      const { data, error } = await supabase
        .from('api_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Erro ao carregar configurações:', error);
        return;
      }

      if (data) {
        setSettings({
          wabaId: data.waba_id,
          businessId: data.business_id,
          phoneNumberId: data.phone_number_id,
          accessToken: data.access_token,
          apiVersion: data.api_version,
          requestTimeout: data.request_timeout,
          webhookUrl: data.webhook_url || webhookUrl,
          webhookSecret: data.webhook_secret || ""
        });
      }
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('api_settings')
        .upsert({
          waba_id: settings.wabaId,
          business_id: settings.businessId,
          phone_number_id: settings.phoneNumberId,
          access_token: settings.accessToken,
          api_version: settings.apiVersion,
          request_timeout: settings.requestTimeout,
          webhook_url: settings.webhookUrl,
          webhook_secret: settings.webhookSecret
        })
        .select()
        .single();

      if (error) throw error;
      
      // Também salvar no localStorage para compatibilidade com o código existente
      localStorage.setItem('wabaSettings', JSON.stringify(settings));
      
      toast({
        title: "Configurações salvas",
        description: "As credenciais foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Copiado para a área de transferência!",
    });
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    
    try {
      // Fazer uma chamada real para a API do WhatsApp
      const phoneNumberId = settings.phoneNumberId;
      const accessToken = settings.accessToken;
      
      const response = await fetch(`https://graph.facebook.com/v23.0/${phoneNumberId}?access_token=${accessToken}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      toast({
        title: "Conexão bem-sucedida",
        description: "As credenciais estão corretas e a API está respondendo.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha na conexão",
        description: error instanceof Error ? error.message : "Não foi possível conectar à API do WhatsApp. Verifique suas credenciais.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved settings from localStorage on component mount
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('wabaSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Erro ao carregar configurações salvas:", e);
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações da API WhatsApp Business</CardTitle>
          <CardDescription>
            Configure suas credenciais para integração com a API do WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="credentials" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="credentials">Credenciais</TabsTrigger>
              <TabsTrigger value="webhook">Webhook</TabsTrigger>
              <TabsTrigger value="advanced">Avançadas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="credentials">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Atenção</AlertTitle>
                  <AlertDescription>
                    Estas são credenciais sensíveis de API. Não compartilhe estas informações.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="wabaId">WhatsApp Business Account ID</Label>
                    <div className="flex">
                      <Input
                        id="wabaId"
                        placeholder="Seu WABA ID"
                        value={settings.wabaId}
                        onChange={(e) => handleInputChange("wabaId", e.target.value)}
                        className="rounded-r-none"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-l-none"
                        onClick={() => handleCopy(settings.wabaId)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="businessId">Business ID</Label>
                    <div className="flex">
                      <Input
                        id="businessId"
                        placeholder="Seu Business ID"
                        value={settings.businessId}
                        onChange={(e) => handleInputChange("businessId", e.target.value)}
                        className="rounded-r-none"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-l-none"
                        onClick={() => handleCopy(settings.businessId)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                    <div className="flex">
                      <Input
                        id="phoneNumberId"
                        placeholder="Seu Phone Number ID"
                        value={settings.phoneNumberId}
                        onChange={(e) => handleInputChange("phoneNumberId", e.target.value)}
                        className="rounded-r-none"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-l-none"
                        onClick={() => handleCopy(settings.phoneNumberId)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="accessToken">Access Token</Label>
                    <div className="flex">
                      <Input
                        id="accessToken"
                        type={isTokenVisible ? "text" : "password"}
                        placeholder="Seu Access Token"
                        value={settings.accessToken}
                        onChange={(e) => handleInputChange("accessToken", e.target.value)}
                        className="font-mono rounded-r-none"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-none border-r-0"
                        onClick={() => setIsTokenVisible(!isTokenVisible)}
                      >
                        {isTokenVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-l-none"
                        onClick={() => handleCopy(settings.accessToken)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      O token deve ter permissões para gerenciar templates e enviar mensagens.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="sm:flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Configurações
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={isLoading}
                    className="sm:flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        Testar Conexão
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="webhook">
              <div className="space-y-6">
                <Alert>
                  <Webhook className="h-4 w-4" />
                  <AlertTitle>Configuração do Webhook</AlertTitle>
                  <AlertDescription>
                    Configure estas informações no Meta for Developers para receber respostas dos clientes automaticamente.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="webhookUrl">URL do Webhook</Label>
                    <div className="flex">
                      <Input
                        id="webhookUrl"
                        value={webhookUrl}
                        readOnly
                        className="bg-gray-50 rounded-r-none font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-l-none"
                        onClick={() => handleCopy(webhookUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Use esta URL no campo "Callback URL" do Meta for Developers
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="verifyToken">Verify Token</Label>
                    <div className="flex">
                      <Input
                        id="verifyToken"
                        value="webhook_verify_token"
                        readOnly
                        className="bg-gray-50 rounded-r-none font-mono"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-l-none"
                        onClick={() => handleCopy("webhook_verify_token")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Use este token no campo "Verify Token" do Meta for Developers
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="webhookSecret">Webhook Secret</Label>
                    <div className="flex">
                      <Input
                        id="webhookSecret"
                        type={isSecretVisible ? "text" : "password"}
                        placeholder="Digite um segredo para validar o webhook"
                        value={settings.webhookSecret}
                        onChange={(e) => handleInputChange("webhookSecret", e.target.value)}
                        className="rounded-r-none"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-none border-r-0"
                        onClick={() => setIsSecretVisible(!isSecretVisible)}
                      >
                        {isSecretVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-l-none"
                        onClick={() => handleCopy(settings.webhookSecret)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Crie um segredo forte para validar as requisições do Meta
                    </p>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Eventos para Configurar</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    No Meta for Developers, configure estes campos de webhook:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>messages</strong> - Para receber mensagens dos clientes</li>
                      <li><strong>message_deliveries</strong> - Para status de entrega</li>
                      <li><strong>message_reads</strong> - Para confirmações de leitura</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Button onClick={handleSaveSettings} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Configurações de Webhook
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced">
              <div className="space-y-6">
                <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Configurações Avançadas</AlertTitle>
                  <AlertDescription>
                    Estas configurações são para usuários avançados. Altere apenas se souber o que está fazendo.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiVersion">Versão da API</Label>
                    <div className="flex">
                      <Input
                        id="apiVersion"
                        value={settings.apiVersion}
                        onChange={(e) => handleInputChange("apiVersion", e.target.value)}
                        className="rounded-r-none"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-l-none"
                        onClick={() => {
                          handleInputChange("apiVersion", "v23.0");
                          toast({
                            description: "Versão da API restaurada para o padrão.",
                          });
                        }}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="requestTimeout">Timeout de Requisição (ms)</Label>
                    <Input
                      id="requestTimeout"
                      type="number"
                      value={settings.requestTimeout}
                      onChange={(e) => handleInputChange("requestTimeout", e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleSaveSettings}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Configurações Avançadas
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Como configurar o webhook</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-3 text-sm">
            <li>
              Acesse o <a href="https://developers.facebook.com" className="text-primary underline" target="_blank" rel="noopener noreferrer">Meta for Developers</a>
            </li>
            <li>Vá para sua aplicação WhatsApp Business e acesse <strong>WhatsApp &gt; Configuration</strong></li>
            <li>Na seção <strong>Webhooks</strong>, clique em <strong>Configure webhooks</strong></li>
            <li>Cole a <strong>URL do Webhook</strong> da aba Webhook acima</li>
            <li>Cole o <strong>Verify Token</strong> da aba Webhook</li>
            <li>Configure os campos de webhook: <strong>messages</strong>, <strong>message_deliveries</strong>, <strong>message_reads</strong></li>
            <li>Salve e verifique que o webhook foi verificado com sucesso</li>
            <li>Configure e salve o <strong>Webhook Secret</strong> na aba Webhook para maior segurança</li>
          </ol>
          
          <Separator className="my-4" />
          
          <div className="rounded-md bg-muted p-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                O webhook receberá automaticamente todas as respostas dos clientes e as armazenará na base de dados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
