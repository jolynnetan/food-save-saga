export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      calorie_entries: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          emoji: string
          fat: number
          id: string
          logged_date: string
          meal_time: string
          name: string
          protein: number
          user_id: string
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string
          emoji?: string
          fat?: number
          id?: string
          logged_date?: string
          meal_time?: string
          name: string
          protein?: number
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          emoji?: string
          fat?: number
          id?: string
          logged_date?: string
          meal_time?: string
          name?: string
          protein?: number
          user_id?: string
        }
        Relationships: []
      }
      donation_points: {
        Row: {
          address: string
          contact_info: string | null
          created_at: string
          current_stock_level: string | null
          description: string | null
          emoji: string | null
          id: string
          lat: number
          lng: number
          name: string
          ngo_name: string
          operating_hours: string | null
          updated_at: string
        }
        Insert: {
          address: string
          contact_info?: string | null
          created_at?: string
          current_stock_level?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          lat: number
          lng: number
          name: string
          ngo_name: string
          operating_hours?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          contact_info?: string | null
          created_at?: string
          current_stock_level?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          lat?: number
          lng?: number
          name?: string
          ngo_name?: string
          operating_hours?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      food_collections: {
        Row: {
          collected_at: string
          donation_point_id: string
          id: string
          items_collected: string | null
          user_id: string
        }
        Insert: {
          collected_at?: string
          donation_point_id: string
          id?: string
          items_collected?: string | null
          user_id: string
        }
        Update: {
          collected_at?: string
          donation_point_id?: string
          id?: string
          items_collected?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_collections_donation_point_id_fkey"
            columns: ["donation_point_id"]
            isOneToOne: false
            referencedRelation: "donation_points"
            referencedColumns: ["id"]
          },
        ]
      }
      food_drops: {
        Row: {
          claimed_by: string | null
          created_at: string
          description: string
          emoji: string
          expires_at: string
          id: string
          lat: number
          lng: number
          posted_by_name: string
          status: string
          title: string
          user_id: string
        }
        Insert: {
          claimed_by?: string | null
          created_at?: string
          description?: string
          emoji?: string
          expires_at: string
          id?: string
          lat: number
          lng: number
          posted_by_name?: string
          status?: string
          title: string
          user_id: string
        }
        Update: {
          claimed_by?: string | null
          created_at?: string
          description?: string
          emoji?: string
          expires_at?: string
          id?: string
          lat?: number
          lng?: number
          posted_by_name?: string
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      food_tracker_entries: {
        Row: {
          amount: string
          created_at: string
          emoji: string
          id: string
          logged_date: string
          name: string
          status: string
          user_id: string
        }
        Insert: {
          amount?: string
          created_at?: string
          emoji?: string
          id?: string
          logged_date?: string
          name: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: string
          created_at?: string
          emoji?: string
          id?: string
          logged_date?: string
          name?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      pantry_items: {
        Row: {
          created_at: string
          emoji: string
          expiry_date: string
          id: string
          name: string
          notified: boolean
          quantity: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          expiry_date: string
          id?: string
          name: string
          notified?: boolean
          quantity?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          expiry_date?: string
          id?: string
          name?: string
          notified?: boolean
          quantity?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          cuisine_preferences: string[] | null
          dietary_preferences: string[] | null
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          cuisine_preferences?: string[] | null
          dietary_preferences?: string[] | null
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          cuisine_preferences?: string[] | null
          dietary_preferences?: string[] | null
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      restock_logs: {
        Row: {
          created_at: string
          donation_point_id: string
          id: string
          items_donated: string | null
          lat: number | null
          lng: number | null
          notes: string | null
          photo_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          donation_point_id: string
          id?: string
          items_donated?: string | null
          lat?: number | null
          lng?: number | null
          notes?: string | null
          photo_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          donation_point_id?: string
          id?: string
          items_donated?: string | null
          lat?: number | null
          lng?: number | null
          notes?: string | null
          photo_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restock_logs_donation_point_id_fkey"
            columns: ["donation_point_id"]
            isOneToOne: false
            referencedRelation: "donation_points"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_results: {
        Row: {
          created_at: string
          fresh_count: number
          id: string
          image_url: string | null
          items: Json
          leftovers_count: number
          recipe_suggestions: Json
          total_calories: number
          user_id: string
          waste_reduction_tips: Json
        }
        Insert: {
          created_at?: string
          fresh_count?: number
          id?: string
          image_url?: string | null
          items?: Json
          leftovers_count?: number
          recipe_suggestions?: Json
          total_calories?: number
          user_id: string
          waste_reduction_tips?: Json
        }
        Update: {
          created_at?: string
          fresh_count?: number
          id?: string
          image_url?: string | null
          items?: Json
          leftovers_count?: number
          recipe_suggestions?: Json
          total_calories?: number
          user_id?: string
          waste_reduction_tips?: Json
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          calories: number | null
          can_repeat: boolean
          created_at: string
          detail: string
          emoji: string
          id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          calories?: number | null
          can_repeat?: boolean
          created_at?: string
          detail?: string
          emoji?: string
          id?: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          calories?: number | null
          can_repeat?: boolean
          created_at?: string
          detail?: string
          emoji?: string
          id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_recipes: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          cuisine: string
          diet: string[]
          emoji: string
          fat: number
          id: string
          ingredients: Json
          name: string
          protein: number
          servings: number
          steps: string[]
          time: string
          user_id: string
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string
          cuisine?: string
          diet?: string[]
          emoji?: string
          fat?: number
          id?: string
          ingredients?: Json
          name: string
          protein?: number
          servings?: number
          steps?: string[]
          time?: string
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          cuisine?: string
          diet?: string[]
          emoji?: string
          fat?: number
          id?: string
          ingredients?: Json
          name?: string
          protein?: number
          servings?: number
          steps?: string[]
          time?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_food_drop: { Args: { drop_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
