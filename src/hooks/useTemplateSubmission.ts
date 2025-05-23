
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface TemplateSubmissionResponse {
  success: boolean;
  templateId?: string;
  error?: string;
}

export const useTemplateSubmission = () => {
  const { toast } = useToast();
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'monitoring' | 'completed' | 'error'>('idle');
  const [templateId, setTemplateId] = useState<string | null>(null);

  const submitTemplate = async (template: any): Promise<TemplateSubmissionResponse> => {
    setSubmissionStatus('submitting');
    
    try {
      const accessToken = localStorage.getItem('meta_access_token');
      const businessId = localStorage.getItem('meta_business_id');
      
      if (!accessToken || !businessId) {
        throw new Error('Credenciais da API não configuradas');
      }

      const response = await fetch(`https://graph.facebook.com/v22.0/${businessId}/message_templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: template.name,
          category: template.category,
          language: template.language,
          components: template.components
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      setTemplateId(data.id);
      setSubmissionStatus('monitoring');
      return { success: true, templateId: data.id };

    } catch (error: any) {
      setSubmissionStatus('error');
      return { 
        success: false, 
        error: error.message || 'Erro ao enviar template' 
      };
    }
  };

  const checkTemplateStatus = async () => {
    if (!templateId) return;

    try {
      const accessToken = localStorage.getItem('meta_access_token');
      const response = await fetch(`https://graph.facebook.com/v22.0/${templateId}?access_token=${accessToken}`);
      const data = await response.json();

      if (data.status === 'APPROVED') {
        setSubmissionStatus('completed');
        toast({
          title: "Template aprovado!",
          description: "Seu template foi aprovado e está pronto para uso.",
        });
      } else if (data.status === 'REJECTED') {
        setSubmissionStatus('error');
        toast({
          variant: "destructive",
          title: "Template rejeitado",
          description: data.rejection_reason || "O template foi rejeitado pela Meta.",
        });
      }

      return data.status;
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  return {
    submissionStatus,
    templateId,
    submitTemplate,
    checkTemplateStatus
  };
};
