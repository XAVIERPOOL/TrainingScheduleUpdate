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
      attendance: {
        Row: {
          id: string
          method: string | null
          officer_id: string | null
          recorded_at: string | null
          recorded_by: string | null
          training_id: string | null
        }
        Insert: {
          id?: string
          method?: string | null
          officer_id?: string | null
          recorded_at?: string | null
          recorded_by?: string | null
          training_id?: string | null
        }
        Update: {
          id?: string
          method?: string | null
          officer_id?: string | null
          recorded_at?: string | null
          recorded_by?: string | null
          training_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_no: string
          created_at: string | null
          id: string
          issue_date: string
          officer_id: string | null
          training_id: string | null
        }
        Insert: {
          certificate_no: string
          created_at?: string | null
          id?: string
          issue_date?: string
          officer_id?: string | null
          training_id?: string | null
        }
        Update: {
          certificate_no?: string
          created_at?: string | null
          id?: string
          issue_date?: string
          officer_id?: string | null
          training_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      missing_requirements: {
        Row: {
          assigned_at: string | null
          id: string
          officer_id: string | null
          training_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          officer_id?: string | null
          training_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          id?: string
          officer_id?: string | null
          training_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missing_requirements_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missing_requirements_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      officer_compliance: {
        Row: {
          created_at: string | null
          id: string
          officer_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          officer_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          officer_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "officer_compliance_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cooperative: string | null
          created_at: string | null
          full_name: string
          id: string
          position: string | null
          role: string
          updated_at: string | null
          user_id_display: string | null
          username: string
        }
        Insert: {
          cooperative?: string | null
          created_at?: string | null
          full_name: string
          id: string
          position?: string | null
          role: string
          updated_at?: string | null
          user_id_display?: string | null
          username: string
        }
        Update: {
          cooperative?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          position?: string | null
          role?: string
          updated_at?: string | null
          user_id_display?: string | null
          username?: string
        }
        Relationships: []
      }
      training_registrations: {
        Row: {
          id: string
          officer_id: string
          registered_at: string
          training_id: string
        }
        Insert: {
          id?: string
          officer_id: string
          registered_at?: string
          training_id: string
        }
        Update: {
          id?: string
          officer_id?: string
          registered_at?: string
          training_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_registrations_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_registrations_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      TrainingComplianceApp: {
        Row: {
          Adress: string
          Age: string
          created_at: string
          id: number
        }
        Insert: {
          Adress: string
          Age: string
          created_at?: string
          id?: number
        }
        Update: {
          Adress?: string
          Age?: string
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      trainings: {
        Row: {
          capacity: number
          created_at: string | null
          date: string
          id: string
          speaker: string
          status: string
          time: string | null
          title: string
          topic: string
          training_id: string
          updated_at: string | null
          venue: string
        }
        Insert: {
          capacity: number
          created_at?: string | null
          date: string
          id?: string
          speaker: string
          status?: string
          time?: string | null
          title: string
          topic: string
          training_id: string
          updated_at?: string | null
          venue: string
        }
        Update: {
          capacity?: number
          created_at?: string | null
          date?: string
          id?: string
          speaker?: string
          status?: string
          time?: string | null
          title?: string
          topic?: string
          training_id?: string
          updated_at?: string | null
          venue?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      enroll_officer_in_training: {
        Args: { p_training_id: string; p_officer_id: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
