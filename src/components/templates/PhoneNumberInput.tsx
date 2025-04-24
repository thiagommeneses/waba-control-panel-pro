
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { FormValues } from "@/types/template";

interface PhoneNumberInputProps {
  control: Control<FormValues>;
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="phoneNumber"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Número de Telefone</FormLabel>
          <FormControl>
            <Input 
              placeholder="Ex: 5511999999999" 
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
