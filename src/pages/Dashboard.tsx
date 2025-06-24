
import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import SendTemplate from "@/components/SendTemplate";
import CreateTemplate from "@/components/CreateTemplate";
import TemplatesList from "@/components/TemplatesList";
import SentTemplates from "@/components/SentTemplates";
import Settings from "@/components/Settings";
import ApiLogs from "@/components/ApiLogs";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("send");

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
      case "settings":
        return <Settings />;
      case "logs":
        return <ApiLogs />;
      default:
        return <SendTemplate />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">WABA Control Panel Pro</h1>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
