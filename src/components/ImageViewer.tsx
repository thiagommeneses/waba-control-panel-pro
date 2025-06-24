
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Image as ImageIcon, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImageViewerProps {
  imageUrl: string;
  imageCaption?: string;
}

const ImageViewer = ({ imageUrl, imageCaption }: ImageViewerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [proxyImageUrl, setProxyImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const downloadImage = async () => {
    try {
      setIsLoading(true);
      
      // Chama a edge function para fazer proxy da imagem
      const { data, error } = await supabase.functions.invoke('download-whatsapp-image', {
        body: { imageUrl }
      });

      if (error) {
        console.error('Erro ao baixar imagem:', error);
        toast({
          variant: "destructive",
          title: "Erro ao baixar imagem",
          description: "Não foi possível baixar a imagem. Tente novamente.",
        });
        return;
      }

      if (data.imageData) {
        // Converte base64 para blob e faz download
        const byteCharacters = atob(data.imageData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: data.contentType || 'image/jpeg' });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `whatsapp-image-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Guarda a URL do proxy para visualização
        setProxyImageUrl(url);

        toast({
          title: "Imagem baixada",
          description: "A imagem foi baixada com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao processar a imagem.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-600">Imagem do WhatsApp</span>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={downloadImage}
          disabled={isLoading}
          className="text-xs"
        >
          <Download className="w-3 h-3 mr-1" />
          {isLoading ? "Baixando..." : "Baixar"}
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              <ExternalLink className="w-3 h-3 mr-1" />
              Ver Original
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Imagem original do WhatsApp (pode requerer autenticação)
                </p>
                {proxyImageUrl ? (
                  <img 
                    src={proxyImageUrl} 
                    alt="Imagem do WhatsApp" 
                    className="max-w-full max-h-96 mx-auto rounded"
                  />
                ) : (
                  <div className="bg-gray-100 p-8 rounded text-center">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-4">
                      Clique em "Baixar" primeiro para visualizar a imagem
                    </p>
                    <Button onClick={downloadImage} disabled={isLoading}>
                      {isLoading ? "Carregando..." : "Carregar Imagem"}
                    </Button>
                  </div>
                )}
              </div>
              {imageCaption && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm">
                    <span className="font-medium">Legenda:</span> {imageCaption}
                  </p>
                </div>
              )}
              <div className="text-xs text-gray-400 break-all">
                <span className="font-medium">URL:</span> {imageUrl}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {imageCaption && (
        <p className="text-sm text-gray-600">
          <span className="font-medium">Legenda:</span> {imageCaption}
        </p>
      )}
    </div>
  );
};

export default ImageViewer;
