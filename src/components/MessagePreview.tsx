
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

interface MessagePreviewProps {
  template: any;
  params: string[];
}

export const MessagePreview: React.FC<MessagePreviewProps> = ({ template, params }) => {
  if (!template) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pré-visualização</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
          <p className="text-gray-500">Selecione um template para visualizar</p>
        </CardContent>
      </Card>
    );
  }

  const replaceParams = (text: string): string => {
    return text.replace(/\{\{(\d+)\}\}/g, (match, index) => {
      const paramIndex = parseInt(index) - 1;
      return params[paramIndex] || match;
    });
  };

  const getHeader = () => {
    const headerComponent = template.components.find((c: any) => c.type === "HEADER");
    if (!headerComponent) return null;
    
    return (
      <div className="font-medium text-lg mb-1">
        {headerComponent.format === "TEXT" && replaceParams(headerComponent.text)}
        {headerComponent.format === "IMAGE" && (
          <div className="mb-2">
            <div className="w-full h-32 bg-gray-200 rounded-md flex items-center justify-center mb-1">
              <span className="text-gray-500 text-sm">Imagem do cabeçalho</span>
            </div>
            {headerComponent.text && <p>{replaceParams(headerComponent.text)}</p>}
          </div>
        )}
        {headerComponent.format === "VIDEO" && (
          <div className="mb-2">
            <div className="w-full h-32 bg-gray-800 rounded-md flex items-center justify-center mb-1">
              <span className="text-gray-300 text-sm">Vídeo do cabeçalho</span>
            </div>
            {headerComponent.text && <p>{replaceParams(headerComponent.text)}</p>}
          </div>
        )}
        {headerComponent.format === "DOCUMENT" && (
          <div className="mb-2">
            <div className="w-full h-16 bg-gray-200 rounded-md flex items-center justify-center mb-1">
              <span className="text-gray-500 text-sm">Documento do cabeçalho</span>
            </div>
            {headerComponent.text && <p>{replaceParams(headerComponent.text)}</p>}
          </div>
        )}
      </div>
    );
  };

  const getBody = () => {
    const bodyComponent = template.components.find((c: any) => c.type === "BODY");
    if (!bodyComponent) return null;
    
    return (
      <div className="mb-2 whitespace-pre-line">
        {replaceParams(bodyComponent.text)}
      </div>
    );
  };

  const getFooter = () => {
    const footerComponent = template.components.find((c: any) => c.type === "FOOTER");
    if (!footerComponent) return null;
    
    return (
      <div className="text-gray-500 text-xs mt-1">
        {replaceParams(footerComponent.text)}
      </div>
    );
  };

  const getButtons = () => {
    const buttonComponent = template.components.find((c: any) => c.type === "BUTTONS");
    if (!buttonComponent || !buttonComponent.buttons) return null;
    
    return (
      <div className="mt-3 space-y-2">
        {buttonComponent.buttons.map((button: any, index: number) => (
          <div 
            key={index}
            className="border border-gray-300 rounded-md p-2 text-center text-sm font-medium text-green-600"
          >
            {button.text}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pré-visualização</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="whatsapp-chat rounded-md p-4 h-[400px] overflow-y-auto">
          <div className="flex justify-end mb-4">
            <div className="whatsapp-bubble">
              {getHeader()}
              {getBody()}
              {getFooter()}
              {getButtons()}
              <div className="text-right text-xs text-gray-500 mt-1">
                12:34 ✓✓
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <div><strong>Nome:</strong> {template.name}</div>
          <div><strong>Categoria:</strong> {template.category}</div>
          <div><strong>Status:</strong> {template.status}</div>
          <div><strong>Idioma:</strong> {template.language}</div>
        </div>
      </CardContent>
    </Card>
  );
};
