export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_logs: {
        Row: {
          created_at: string
          endpoint: string
          error_message: string | null
          id: string
          request_body: Json | null
          request_method: string
          response_body: Json | null
          response_status: number | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          error_message?: string | null
          id?: string
          request_body?: Json | null
          request_method: string
          response_body?: Json | null
          response_status?: number | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          error_message?: string | null
          id?: string
          request_body?: Json | null
          request_method?: string
          response_body?: Json | null
          response_status?: number | null
        }
        Relationships: []
      }
      api_settings: {
        Row: {
          access_token: string
          api_version: string | null
          business_id: string
          created_at: string
          id: string
          phone_number_id: string
          request_timeout: number | null
          updated_at: string
          waba_id: string
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          access_token: string
          api_version?: string | null
          business_id: string
          created_at?: string
          id?: string
          phone_number_id: string
          request_timeout?: number | null
          updated_at?: string
          waba_id: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          access_token?: string
          api_version?: string | null
          business_id?: string
          created_at?: string
          id?: string
          phone_number_id?: string
          request_timeout?: number | null
          updated_at?: string
          waba_id?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      client_responses: {
        Row: {
          button_payload: string | null
          client_name: string | null
          content: string | null
          context_wamid: string | null
          created_at: string
          id: string
          image_caption: string | null
          image_url: string | null
          message_type: string
          metadata: Json | null
          phone_number: string
          timestamp_received: string
          updated_at: string
          wamid: string | null
        }
        Insert: {
          button_payload?: string | null
          client_name?: string | null
          content?: string | null
          context_wamid?: string | null
          created_at?: string
          id?: string
          image_caption?: string | null
          image_url?: string | null
          message_type: string
          metadata?: Json | null
          phone_number: string
          timestamp_received?: string
          updated_at?: string
          wamid?: string | null
        }
        Update: {
          button_payload?: string | null
          client_name?: string | null
          content?: string | null
          context_wamid?: string | null
          created_at?: string
          id?: string
          image_caption?: string | null
          image_url?: string | null
          message_type?: string
          metadata?: Json | null
          phone_number?: string
          timestamp_received?: string
          updated_at?: string
          wamid?: string | null
        }
        Relationships: []
      }
      sent_messages: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          parameters: Json | null
          phone_number: string
          status: string
          template_name: string
          updated_at: string
          wamid: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          parameters?: Json | null
          phone_number: string
          status?: string
          template_name: string
          updated_at?: string
          wamid?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          parameters?: Json | null
          phone_number?: string
          status?: string
          template_name?: string
          updated_at?: string
          wamid?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
