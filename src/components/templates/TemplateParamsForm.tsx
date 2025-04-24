
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { FormValues, Template } from "@/types/template";

interface TemplateParamsFormProps {
  control: Control<FormValues>;
  template: Template | null;
  params: string[];
}

export const TemplateParamsForm: React.FC<TemplateParamsFormProps> = ({
  control,
  template,
  params,
}) => {
  if (!template) return null;

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Parâmetros</div>
      {params?.map((_, index) => (
        <FormField
          key={`param-${index}`}
          control={control}
          name={`params.${index}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parâmetro {index + 1}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={`Valor para {{${index + 1}}}`} 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
};
