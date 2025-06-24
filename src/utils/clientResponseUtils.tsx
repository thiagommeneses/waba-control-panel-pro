
import { MessageSquare, Image as ImageIcon, Mouse } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const getMessageTypeIcon = (type: string) => {
  switch (type) {
    case 'text':
      return <MessageSquare className="w-4 h-4" />;
    case 'image':
      return <ImageIcon className="w-4 h-4" />;
    case 'button_reply':
    case 'interactive':
      return <Mouse className="w-4 h-4" />;
    default:
      return <MessageSquare className="w-4 h-4" />;
  }
};

export const getMessageTypeBadge = (type: string) => {
  const colors = {
    text: "bg-blue-100 text-blue-800",
    image: "bg-green-100 text-green-800",
    button_reply: "bg-purple-100 text-purple-800",
    interactive: "bg-orange-100 text-orange-800"
  };

  const labels = {
    text: "Texto",
    image: "Imagem",
    button_reply: "Botão",
    interactive: "Interativo"
  };

  return (
    <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
      {getMessageTypeIcon(type)}
      <span className="ml-1">{labels[type as keyof typeof labels] || type}</span>
    </Badge>
  );
};
