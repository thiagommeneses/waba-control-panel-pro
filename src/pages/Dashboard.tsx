
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/Sidebar";
import SendTemplate from "@/components/SendTemplate";
import CreateTemplate from "@/components/CreateTemplate";
import SentTemplates from "@/components/SentTemplates";
import Settings from "@/components/Settings";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("send");

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">WABA Control Panel Pro</h1>
          
          <Tabs
            defaultValue="send"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full mb-6">
              <TabsTrigger value="send">Enviar Template</TabsTrigger>
              <TabsTrigger value="create">Criar Template</TabsTrigger>
              <TabsTrigger value="history">Templates Enviados</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="send">
              <SendTemplate />
            </TabsContent>
            
            <TabsContent value="create">
              <CreateTemplate />
            </TabsContent>
            
            <TabsContent value="history">
              <SentTemplates />
            </TabsContent>
            
            <TabsContent value="settings">
              <Settings />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
