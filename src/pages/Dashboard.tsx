
import React, { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import SendTemplate from "@/components/SendTemplate";
import CreateTemplate from "@/components/CreateTemplate";
import TemplatesList from "@/components/TemplatesList";
import SentTemplates from "@/components/SentTemplates";
import ClientResponses from "@/components/ClientResponses";
import Settings from "@/components/Settings";
import ApiLogs from "@/components/ApiLogs";
import UserHeader from "@/components/UserHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("send");
  const { isAdmin } = useAuth();

  const getPageTitle = () => {
    switch (activeTab) {
      case "send":
        return "Enviar Template";
      case "create":
        return "Criar Template";
      case "templates":
        return "Lista de Templates";
      case "history":
        return "Templates Enviados";
      case "responses":
        return "Respostas dos Clientes";
      case "settings":
        return "Configurações";
      case "logs":
        return "Logs da API";
      default:
        return "Dashboard";
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "send":
        return <SendTemplate />;
      case "create":
        return <CreateTemplate />;
      case "templates":
        return <TemplatesList />;
      case "history":
        return <SentTemplates />;
      case "responses":
        return <ClientResponses />;
      case "settings":
        return (
          <ProtectedRoute adminOnly>
            <Settings />
          </ProtectedRoute>
        );
      case "logs":
        return (
          <ProtectedRoute adminOnly>
            <ApiLogs />
          </ProtectedRoute>
        );
      default:
        return <SendTemplate />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarInset>
          <UserHeader />
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">
                    WABA Control Panel Pro
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getPageTitle()}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-6">
              {renderContent()}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
