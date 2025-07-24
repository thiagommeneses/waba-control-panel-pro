# WABA Control Panel Pro

![WABA Control Panel Pro](https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&h=400&fit=crop&crop=center)

Um painel de controle profissional para gerenciar a API do WhatsApp Business, permitindo envio de templates, criação de templates personalizados, e gerenciamento completo de respostas de clientes.

## 🚀 Funcionalidades

### 📤 **Envio de Templates**
- Envio de templates aprovados do WhatsApp Business
- Suporte a parâmetros dinâmicos
- Validação de números de telefone
- Preview em tempo real das mensagens
- Histórico completo de mensagens enviadas

### 📝 **Criação de Templates**
- Interface intuitiva para criação de novos templates
- Suporte a diferentes tipos de cabeçalho (texto, imagem, vídeo, documento)
- Configuração de botões interativos (resposta rápida, URL, telefone)
- Validação automática antes do envio
- Sistema de aprovação integrado com Meta

### 💬 **Gerenciamento de Respostas**
- Visualização de todas as respostas dos clientes
- Suporte a diferentes tipos de mensagem (texto, imagem, botões)
- Sistema de filtros avançados
- Paginação eficiente
- Respostas via WhatsApp Web ou API

### 🔧 **Configurações Avançadas**
- Configuração completa da API do WhatsApp Business
- Gerenciamento de webhooks
- Logs detalhados de API
- Sistema de monitoramento em tempo real

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework de estilização
- **shadcn/ui** - Componentes de interface
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **TanStack Query** - Gerenciamento de estado server

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Edge Functions** - Serverless functions
- **Row Level Security** - Segurança de dados

### Bibliotecas Principais
- **@radix-ui** - Componentes primitivos acessíveis
- **lucide-react** - Ícones
- **date-fns** - Manipulação de datas
- **class-variance-authority** - Variantes de componentes
- **sonner** - Notificações toast

## 📋 Pré-requisitos

- **Node.js 18+**
- **npm ou yarn**
- **Conta no Supabase**
- **Conta no Meta for Developers**
- **WhatsApp Business API configurada**

## ⚙️ Configuração e Instalação

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd waba-control-panel-pro
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase

#### 3.1. Crie um projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e a chave anônima

#### 3.2. Configure o banco de dados
Execute as migrations SQL para criar as tabelas necessárias:

```sql
-- Tabela de configurações da API
CREATE TABLE api_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    waba_id TEXT NOT NULL,
    business_id TEXT NOT NULL,
    phone_number_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    api_version TEXT DEFAULT 'v23.0',
    request_timeout INTEGER DEFAULT 30000,
    webhook_url TEXT,
    webhook_secret TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de mensagens enviadas
CREATE TABLE sent_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    status TEXT NOT NULL,
    parameters JSONB,
    wamid TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de respostas dos clientes
CREATE TABLE client_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT NOT NULL,
    message_type TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    image_caption TEXT,
    button_payload TEXT,
    wamid TEXT,
    timestamp_received TIMESTAMPTZ NOT NULL,
    context_wamid TEXT,
    client_name TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de logs da API
CREATE TABLE api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint TEXT NOT NULL,
    request_method TEXT NOT NULL,
    request_body JSONB,
    response_status INTEGER,
    response_body JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.3. Configure as Edge Functions
Deploy as Edge Functions do Supabase:

```bash
# Instale a CLI do Supabase
npm install -g supabase

# Faça login
supabase login

# Conecte ao seu projeto
supabase link --project-ref SEU_PROJECT_REF

# Deploy das functions
supabase functions deploy whatsapp-webhook
```

### 4. Configure as variáveis de ambiente

Atualize o arquivo `src/integrations/supabase/client.ts` com suas credenciais:

```typescript
const SUPABASE_URL = "SUA_SUPABASE_URL";
const SUPABASE_PUBLISHABLE_KEY = "SUA_SUPABASE_ANON_KEY";
```

### 5. Configure o Meta for Developers

#### 5.1. Crie uma aplicação
1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Crie uma nova aplicação
3. Adicione o produto "WhatsApp Business"

#### 5.2. Configure o webhook
- **URL do Webhook**: `https://SUA_SUPABASE_URL/functions/v1/whatsapp-webhook`
- **Token de verificação**: `webhook_verify_token`
- **Campos de assinatura**: messages

### 6. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

## 📁 Estrutura do Projeto

```
src/
├── components/              # Componentes React
│   ├── ui/                 # Componentes de interface (shadcn/ui)
│   ├── templates/          # Componentes específicos de templates
│   ├── ApiLogs.tsx         # Logs da API
│   ├── AppSidebar.tsx      # Barra lateral principal
│   ├── ClientResponses.tsx # Gerenciamento de respostas
│   ├── CreateTemplate.tsx  # Criação de templates
│   ├── MessagePreview.tsx  # Preview de mensagens
│   ├── ReplyModal.tsx      # Modal de resposta
│   ├── SendTemplate.tsx    # Envio de templates
│   ├── SentTemplates.tsx   # Histórico de envios
│   └── Settings.tsx        # Configurações
├── hooks/                  # Hooks customizados
│   ├── templates/          # Hooks específicos de templates
│   └── useTemplateSubmission.ts
├── integrations/           # Integrações externas
│   └── supabase/          # Cliente Supabase
├── lib/                   # Utilitários
├── pages/                 # Páginas da aplicação
├── types/                 # Definições de tipos TypeScript
└── utils/                 # Funções utilitárias

supabase/
├── functions/             # Edge Functions
│   ├── whatsapp-webhook/  # Webhook do WhatsApp
│   └── download-whatsapp-image/ # Download de imagens
└── config.toml           # Configuração do Supabase
```

## 🔧 Como Usar

### 1. Configuração Inicial

Após a instalação, acesse a aba "Configurações" e preencha:
- **WABA ID**: ID da sua conta WhatsApp Business
- **Business ID**: ID do seu negócio
- **Phone Number ID**: ID do número de telefone
- **Access Token**: Token de acesso da API
- **Webhook URL**: URL do webhook (automaticamente configurada)

### 2. Enviando Templates

1. Acesse a aba "Enviar Template"
2. Selecione um template aprovado
3. Preencha os parâmetros necessários
4. Digite o número do destinatário
5. Visualize o preview e envie

### 3. Criando Novos Templates

1. Acesse a aba "Criar Template"
2. Preencha as informações básicas (nome, categoria, idioma)
3. Configure o conteúdo (cabeçalho, corpo, rodapé)
4. Adicione botões se necessário
5. Envie para aprovação

### 4. Gerenciando Respostas

1. Acesse a aba "Respostas dos Clientes"
2. Visualize todas as mensagens recebidas
3. Use filtros para encontrar mensagens específicas
4. Responda via WhatsApp Web ou API

## 🔗 API e Webhook

### Endpoints Disponíveis

#### Webhook do WhatsApp
- **URL**: `/functions/v1/whatsapp-webhook`
- **Método**: `GET` (verificação), `POST` (recebimento)
- **Autenticação**: Assinatura HMAC SHA-256

#### Download de Imagens
- **URL**: `/functions/v1/download-whatsapp-image`
- **Método**: `POST`
- **Parâmetros**: `imageId`, `accessToken`

### Estrutura do Webhook

O webhook recebe notificações do WhatsApp no seguinte formato:

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WABA_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "PHONE_NUMBER",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "contacts": [
              {
                "profile": {
                  "name": "CUSTOMER_NAME"
                },
                "wa_id": "CUSTOMER_PHONE"
              }
            ],
            "messages": [
              {
                "from": "CUSTOMER_PHONE",
                "id": "MESSAGE_ID",
                "timestamp": "TIMESTAMP",
                "type": "text",
                "text": {
                  "body": "MESSAGE_CONTENT"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

## 🚀 Deploy

### Deploy no Vercel

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Deploy no Netlify

1. Conecte seu repositório ao Netlify
2. Configure o comando de build: `npm run build`
3. Configure o diretório de publicação: `dist`

### Variáveis de Ambiente para Produção

```bash
# Supabase
VITE_SUPABASE_URL=sua_supabase_url
VITE_SUPABASE_ANON_KEY=sua_supabase_anon_key

# WhatsApp Business API
VITE_WHATSAPP_API_VERSION=v23.0
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Padrões de Código

- Use TypeScript para tipagem estática
- Siga as convenções do ESLint configurado
- Componentes devem ser funcionais com hooks
- Use Tailwind CSS para estilização
- Mantenha os componentes pequenos e focados

## 📊 Monitoramento e Logs

O sistema inclui monitoramento completo:

- **Logs de API**: Todas as requisições são registradas
- **Status de Templates**: Acompanhamento do status de aprovação
- **Webhooks**: Logs detalhados de recebimento
- **Erros**: Captura e exibição de erros em tempo real

## 🔒 Segurança

- Validação de assinatura HMAC para webhooks
- Sanitização de dados de entrada
- Proteção contra injeção SQL via Supabase RLS
- Tokens de acesso armazenados de forma segura

## 📱 Responsividade

O painel é totalmente responsivo e funciona em:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🆘 Suporte e Documentação

### Problemas Comuns

**Template não aprovado**: Verifique se o conteúdo segue as diretrizes do WhatsApp Business.

**Webhook não funciona**: Verifique se a URL está configurada corretamente no Meta for Developers.

**Erro de autenticação**: Verifique se o access token está válido e tem as permissões necessárias.

### Links Úteis

- [Documentação oficial do WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de aprovação de templates](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

Para suporte ou dúvidas:
- 📧 Email: thiagomm@icloud.com
- 💬 WhatsApp: +55 (62) 9****-**22
- 🌐 Website pt_br: [pixmeyou.com](https://pixmeyou.com)
- 🌐 Website en_us: [us.pixmeyou.com](https://us.pixmeyou.com)

---

Desenvolvido com ❤️ para facilitar o gerenciamento do WhatsApp Business API