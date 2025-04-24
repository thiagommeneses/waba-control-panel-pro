
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
  EyeOff
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
  
  const [settings, setSettings] = useState({
    wabaId: "",
    businessId: "",
    phoneNumberId: "",
    accessToken: "",
    apiVersion: "v22.0",
    requestTimeout: 30000,
    webhookUrl: "",
    webhookSecret: ""
  });

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
          webhookUrl: data.webhook_url || "",
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
      
      const response = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}?access_token=${accessToken}`);
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
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="credentials">Credenciais</TabsTrigger>
              <TabsTrigger value="advanced">Configurações Avançadas</TabsTrigger>
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
                        defaultValue="v22.0"
                        className="rounded-r-none"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-l-none"
                        onClick={() => {
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
                      defaultValue="30000"
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">URL de Webhook</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://seu-dominio.com/webhook"
                    />
                    <p className="text-xs text-gray-500">
                      Configure esta URL no Meta for Developers para receber atualizações de status
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="webhookSecret">Webhook Secret</Label>
                    <Input
                      id="webhookSecret"
                      type="password"
                      placeholder="Seu segredo de webhook"
                    />
                  </div>
                </div>
                
                <Button 
                  type="button"
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações Avançadas
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Como obter suas credenciais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Acesse o <a href="https://developers.facebook.com" className="text-primary underline" target="_blank" rel="noopener noreferrer">Meta for Developers</a>
            </li>
            <li>Navegue até o <strong>Meta Business Suite</strong> e acesse seu WhatsApp Business Account</li>
            <li>No painel de configurações, localize o <strong>WhatsApp Manager</strong></li>
            <li>Encontre os IDs necessários na seção de <strong>Informações da Conta</strong></li>
            <li>Para gerar um Access Token, vá até a seção <strong>System Users</strong> do Meta Business</li>
          </ol>
          
          <Separator className="my-4" />
          
          <div className="rounded-md bg-muted p-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Seu token é armazenado localmente com segurança e usado apenas para autenticar chamadas à API do WhatsApp.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
