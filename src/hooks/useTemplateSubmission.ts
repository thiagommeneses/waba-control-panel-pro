
import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TemplateSubmissionResponse {
  success: boolean;
  templateId?: string;
  error?: string;
}

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

export const useTemplateSubmission = () => {
  const { toast } = useToast();
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'monitoring' | 'completed' | 'error'>('idle');
  const [templateId, setTemplateId] = useState<string | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Limpar polling ao desmontar componente
  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  // Iniciar polling quando o status mudar para monitoring
  useEffect(() => {
    if (submissionStatus === 'monitoring' && templateId) {
      console.log('Iniciando monitoramento automático do template:', templateId);
      
      // Log do início do monitoramento
      logApiCall(
        'SYSTEM_MONITORING_START',
        'INTERNAL',
        { templateId, action: 'start_monitoring' },
        200,
        { message: 'Monitoramento automático iniciado' }
      );

      // Primeira verificação após 5 segundos
      const firstCheck = setTimeout(() => {
        checkTemplateStatus();
      }, 5000);

      // Verificações periódicas a cada 30 segundos
      pollingInterval.current = setInterval(() => {
        checkTemplateStatus();
      }, 30000);

      return () => {
        clearTimeout(firstCheck);
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
      };
    }
  }, [submissionStatus, templateId]);

  const submitTemplate = async (template: any): Promise<TemplateSubmissionResponse> => {
    setSubmissionStatus('submitting');
    
    const endpoint = `https://graph.facebook.com/v23.0/{businessId}/message_templates`;
    
    try {
      // Log início da submissão
      await logApiCall(
        'TEMPLATE_SUBMISSION_START',
        'INTERNAL',
        { templateName: template.name, action: 'start_submission' },
        200,
        { message: 'Iniciando submissão de template' }
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
      
      const { business_id: businessId, access_token: accessToken } = settings;
      
      if (!businessId || !accessToken) {
        const errorMsg = 'Business ID ou Access Token não configurados.';
        await logApiCall(
          'API_CREDENTIALS_CHECK',
          'INTERNAL',
          { businessId: !!businessId, accessToken: !!accessToken },
          400,
          null,
          errorMsg
        );
        throw new Error(errorMsg);
      }

      const finalEndpoint = `https://graph.facebook.com/v23.0/${businessId}/message_templates`;
      const requestBody = {
        name: template.name,
        category: template.category,
        language: template.language,
        components: template.components
      };

      const response = await fetch(finalEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      // Log da resposta da API
      await logApiCall(
        finalEndpoint,
        'POST',
        requestBody,
        response.status,
        data,
        data.error ? data.error.message : null
      );

      if (data.error) {
        setSubmissionStatus('error');
        toast({
          variant: "destructive",
          title: "Erro na submissão",
          description: data.error.message,
        });
        throw new Error(data.error.message);
      }

      setTemplateId(data.id);
      setSubmissionStatus('monitoring');
      
      toast({
        title: "Template enviado para aprovação!",
        description: `Template "${template.name}" foi enviado. Monitorando status automaticamente...`,
      });

      // Log sucesso da submissão
      await logApiCall(
        'TEMPLATE_SUBMISSION_SUCCESS',
        'INTERNAL',
        { templateId: data.id, templateName: template.name },
        200,
        { message: 'Template enviado com sucesso, iniciando monitoramento' }
      );

      return { success: true, templateId: data.id };

    } catch (error: any) {
      setSubmissionStatus('error');
      
      // Log do erro
      await logApiCall(
        endpoint,
        'POST',
        { templateName: template.name },
        500,
        null,
        error.message
      );
      
      return { 
        success: false, 
        error: error.message || 'Erro ao enviar template' 
      };
    }
  };

  const checkTemplateStatus = async () => {
    if (!templateId) return;

    try {
      console.log('Verificando status do template:', templateId);

      // Get API settings from Supabase
      const { data: settings, error: settingsError } = await supabase
        .from('api_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (settingsError) {
        console.error('Erro ao buscar configurações:', settingsError);
        await logApiCall(
          'TEMPLATE_STATUS_CHECK_ERROR',
          'GET',
          { templateId },
          500,
          null,
          'Erro ao buscar configurações para verificar status'
        );
        return;
      }
      
      const { access_token: accessToken } = settings;
      const endpoint = `https://graph.facebook.com/v23.0/${templateId}`;
      
      const response = await fetch(`${endpoint}?access_token=${accessToken}`);
      const data = await response.json();

      // Log da verificação de status
      await logApiCall(
        endpoint,
        'GET',
        { templateId, action: 'status_check' },
        response.status,
        data,
        data.error ? data.error.message : null
      );

      console.log('Status do template:', data.status);

      if (data.status === 'APPROVED') {
        setSubmissionStatus('completed');
        
        // Parar o polling
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }

        // Log da aprovação
        await logApiCall(
          'TEMPLATE_APPROVED',
          'INTERNAL',
          { templateId, templateName: data.name },
          200,
          { message: 'Template aprovado com sucesso' }
        );

        toast({
          title: "🎉 Template aprovado!",
          description: `Seu template "${data.name}" foi aprovado e está pronto para uso.`,
          duration: 10000,
        });
        
      } else if (data.status === 'REJECTED') {
        setSubmissionStatus('error');
        
        // Parar o polling
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }

        // Log da rejeição
        await logApiCall(
          'TEMPLATE_REJECTED',
          'INTERNAL',
          { templateId, templateName: data.name, rejectionReason: data.rejection_reason },
          400,
          data,
          `Template rejeitado: ${data.rejection_reason || 'Motivo não especificado'}`
        );

        toast({
          variant: "destructive",
          title: "❌ Template rejeitado",
          description: data.rejection_reason || "O template foi rejeitado pela Meta.",
          duration: 10000,
        });
        
      } else if (data.status === 'PENDING') {
        // Log status pendente
        await logApiCall(
          'TEMPLATE_STATUS_PENDING',
          'INTERNAL',
          { templateId, templateName: data.name },
          200,
          { message: 'Template ainda pendente de aprovação' }
        );
        
        console.log('Template ainda pendente, continuando monitoramento...');
      }

      return data.status;
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      
      await logApiCall(
        'TEMPLATE_STATUS_CHECK_ERROR',
        'GET',
        { templateId },
        500,
        null,
        `Erro ao verificar status: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  };

  const stopMonitoring = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
    setSubmissionStatus('idle');
    setTemplateId(null);
    
    // Log parada do monitoramento
    logApiCall(
      'SYSTEM_MONITORING_STOP',
      'INTERNAL',
      { templateId, action: 'stop_monitoring' },
      200,
      { message: 'Monitoramento interrompido pelo usuário' }
    );
  };

  return {
    submissionStatus,
    templateId,
    submitTemplate,
    checkTemplateStatus,
    stopMonitoring
  };
};
