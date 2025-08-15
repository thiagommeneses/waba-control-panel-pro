-- Corrigir políticas RLS para api_settings
-- Permitir que usuários autenticados vejam e atualizem configurações
-- (mantendo restrições de admin apenas para operações críticas)

-- Remover política restritiva atual
DROP POLICY IF EXISTS "Admin can manage api_settings" ON public.api_settings;

-- Criar políticas mais permissivas para configurações básicas
CREATE POLICY "Authenticated users can view api_settings" 
ON public.api_settings 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert api_settings" 
ON public.api_settings 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update api_settings" 
ON public.api_settings 
FOR UPDATE 
TO authenticated 
USING (true);

-- Apenas admins podem deletar configurações
CREATE POLICY "Admin can delete api_settings" 
ON public.api_settings 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Corrigir função de busca de configurações para evitar erro de "múltiplas linhas"
-- Criar função para obter a configuração mais recente
CREATE OR REPLACE FUNCTION public.get_latest_api_settings()
RETURNS public.api_settings
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.api_settings 
  ORDER BY updated_at DESC 
  LIMIT 1;
$$;