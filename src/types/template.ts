
export interface Template {
  id: string;
  name: string;
  status: string;
  category: string;
  language: string;
  components: {
    type: string;
    format?: string;
    text?: string;
    buttons?: Array<{
      type: string;
      text: string;
    }>;
  }[];
}

export interface FormValues {
  phoneNumber: string;
  templateName: string;
  params?: string[];
}
