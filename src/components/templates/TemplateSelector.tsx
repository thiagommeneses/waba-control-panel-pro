
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { Template } from "@/types/template";
import { Loader2 } from "lucide-react";

interface FormValues {
  phoneNumber: string;
  templateName: string;
  params?: string[];
}

interface TemplateSelectorProps {
  control: Control<FormValues>;
  templates: Template[];
  isLoading: boolean;
  onTemplateSelect: (templateId: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  control,
  templates,
  isLoading,
  onTemplateSelect,
}) => {
  // Filtrar templates rejeitados
  const approvedTemplates = templates.filter(template => template.status !== 'REJECTED');

  return (
    <FormField
      control={control}
      name="templateName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Template</FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value);
              onTemplateSelect(value);
            }}
            value={field.value}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione um template"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Carregando templates...</span>
                </div>
              ) : approvedTemplates.map((template) => (
                <SelectItem 
                  key={template.id} 
                  value={template.name}
                >
                  {template.name} ({template.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
