
import React from "react";
import { 
  MessageSquare, 
  PenSquare, 
  Clock, 
  Settings as SettingsIcon,
  Phone,
  ClipboardCheck,
  Users,
  Activity,
  List,
  MessageCircle,
  ChevronRight,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AppSidebar({ activeTab, setActiveTab }: AppSidebarProps) {
  const { isAdmin } = useAuth();
  const templateItems = [
    {
      id: "send",
      label: "Enviar Template",
      icon: MessageSquare,
      description: "Envie mensagens usando templates"
    },
    {
      id: "create",
      label: "Criar Template",
      icon: PenSquare,
      description: "Crie novos templates personalizados"
    },
    {
      id: "templates",
      label: "Lista de Templates",
      icon: List,
      description: "Gerencie seus templates"
    }
  ];

  const historyItems = [
    {
      id: "history",
      label: "Templates Enviados",
      icon: Clock,
      description: "Histórico de envios"
    },
    {
      id: "responses",
      label: "Respostas dos Clientes",
      icon: MessageCircle,
      description: "Mensagens recebidas",
      badge: "2"
    }
  ];

  const systemItems = [
    {
      id: "logs",
      label: "Logs da API",
      icon: Activity,
      description: "Monitor de sistema"
    },
    {
      id: "settings",
      label: "Configurações",
      icon: SettingsIcon,
      description: "Configurar sistema"
    }
  ];

  return (
    <Sidebar variant="inset" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">WABA Pro</span>
            <span className="text-xs text-muted-foreground">Control Panel</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Templates</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {templateItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => setActiveTab(item.id)}
                    isActive={activeTab === item.id}
                    tooltip={item.description}
                    className="group relative"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                    {activeTab === item.id && (
                      <ChevronRight className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Histórico & Respostas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {historyItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => setActiveTab(item.id)}
                    isActive={activeTab === item.id}
                    tooltip={item.description}
                    className="group relative"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto h-5 w-5 flex items-center justify-center text-xs p-0">
                        {item.badge}
                      </Badge>
                    )}
                    {activeTab === item.id && !item.badge && (
                      <ChevronRight className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sistema (Admin)
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {systemItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      onClick={() => setActiveTab(item.id)}
                      isActive={activeTab === item.id}
                      tooltip={item.description}
                      className="group relative"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.label}</span>
                      {activeTab === item.id && (
                        <ChevronRight className="ml-auto h-4 w-4 text-primary" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-2">
          <div className="rounded-lg bg-sidebar-accent/20 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-sidebar-foreground">Status da API</span>
            </div>
            <div className="text-xs text-sidebar-foreground/70">
              Conectado e ativo
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-sidebar-foreground truncate">Meta Business</div>
              <div className="text-xs text-sidebar-foreground/70">Empresa</div>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
