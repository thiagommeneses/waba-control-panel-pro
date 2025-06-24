
import React from "react";
import { 
  MessageSquare, 
  PenSquare, 
  Clock, 
  Settings as SettingsIcon,
  ChevronRight,
  Phone,
  ClipboardCheck,
  Users,
  Activity,
  List,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    {
      id: "send",
      label: "Enviar Template",
      icon: <MessageSquare size={20} />,
    },
    {
      id: "create",
      label: "Criar Template",
      icon: <PenSquare size={20} />,
    },
    {
      id: "templates",
      label: "Lista de Templates",
      icon: <List size={20} />,
    },
    {
      id: "history",
      label: "Templates Enviados",
      icon: <Clock size={20} />,
    },
    {
      id: "responses",
      label: "Respostas dos Clientes",
      icon: <MessageCircle size={20} />,
    },
    {
      id: "logs",
      label: "Logs da API",
      icon: <Activity size={20} />,
    },
    {
      id: "settings",
      label: "Configurações",
      icon: <SettingsIcon size={20} />,
    },
  ];

  return (
    <div className="w-16 md:w-64 bg-sidebar text-sidebar-foreground flex flex-col h-screen border-r">
      <div className="p-4 border-b border-sidebar-border">
        <div className="hidden md:flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <MessageSquare size={18} />
          </div>
          <span className="font-bold text-lg">WABA Pro</span>
        </div>
        <div className="md:hidden flex justify-center">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <MessageSquare size={18} />
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-2 md:p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center py-2 px-2 md:px-4 rounded-md transition-colors",
              activeTab === item.id 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80"
            )}
          >
            <span className="mr-0 md:mr-3">{item.icon}</span>
            <span className="hidden md:inline">{item.label}</span>
            {activeTab === item.id && (
              <ChevronRight size={16} className="ml-auto hidden md:block" />
            )}
          </button>
        ))}
      </nav>
      
      <div className="hidden md:block p-4 bg-sidebar-accent/20 mb-2 mx-2 rounded-md">
        <div className="text-xs text-sidebar-foreground/70 mb-2">
          Status da API
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
          <span className="text-sm">Ativo</span>
        </div>
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className="hidden md:flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent/50 flex items-center justify-center">
            <Users size={16} />
          </div>
          <div>
            <div className="text-xs text-sidebar-foreground/80">Empresa</div>
            <div className="text-sm font-medium">Meta Business</div>
          </div>
        </div>
        <div className="md:hidden flex justify-center">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent/50 flex items-center justify-center">
            <Users size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
