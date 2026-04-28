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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      "info_workout.days_in_week_values": {
        Row: {
          description: string
          is_default: boolean
          order: number
          title: string
          uuid: string
          values: Database["public"]["Enums"]["DaysInWeek"][]
        }
        Insert: {
          description?: string
          is_default?: boolean
          order: number
          title?: string
          uuid?: string
          values: Database["public"]["Enums"]["DaysInWeek"][]
        }
        Update: {
          description?: string
          is_default?: boolean
          order?: number
          title?: string
          uuid?: string
          values?: Database["public"]["Enums"]["DaysInWeek"][]
        }
        Relationships: []
      }
      "info_workout.equipament": {
        Row: {
          order: number
          title: string
          uuid: string
        }
        Insert: {
          order: number
          title: string
          uuid?: string
        }
        Update: {
          order?: number
          title?: string
          uuid?: string
        }
        Relationships: []
      }
      "info_workout.gender": {
        Row: {
          image_url: string
          is_default: boolean
          order: number
          title: string
          uuid: string
        }
        Insert: {
          image_url?: string
          is_default?: boolean
          order?: number
          title?: string
          uuid?: string
        }
        Update: {
          image_url?: string
          is_default?: boolean
          order?: number
          title?: string
          uuid?: string
        }
        Relationships: []
      }
      "info_workout.level": {
        Row: {
          description: string
          is_default: boolean
          level_enum: Database["public"]["Enums"]["Level"]
          order: number
          title: string
          uuid: string
        }
        Insert: {
          description?: string
          is_default?: boolean
          level_enum?: Database["public"]["Enums"]["Level"]
          order?: number
          title?: string
          uuid?: string
        }
        Update: {
          description?: string
          is_default?: boolean
          level_enum?: Database["public"]["Enums"]["Level"]
          order?: number
          title?: string
          uuid?: string
        }
        Relationships: []
      }
      "info_workout.muscle_values": {
        Row: {
          order: number
          title: string
          uuid: string
          values: Database["public"]["Enums"]["Muscle"][]
        }
        Insert: {
          order: number
          title: string
          uuid?: string
          values: Database["public"]["Enums"]["Muscle"][]
        }
        Update: {
          order?: number
          title?: string
          uuid?: string
          values?: Database["public"]["Enums"]["Muscle"][]
        }
        Relationships: []
      }
      "info_workout.objective": {
        Row: {
          is_default: boolean
          order: number
          title: string
          uuid: string
        }
        Insert: {
          is_default?: boolean
          order?: number
          title?: string
          uuid?: string
        }
        Update: {
          is_default?: boolean
          order?: number
          title?: string
          uuid?: string
        }
        Relationships: []
      }
      "info_workout.session_duration_values": {
        Row: {
          is_default: boolean
          order: number
          title: string
          uuid: string
          value: number
        }
        Insert: {
          is_default: boolean
          order: number
          title: string
          uuid?: string
          value: number
        }
        Update: {
          is_default?: boolean
          order?: number
          title?: string
          uuid?: string
          value?: number
        }
        Relationships: []
      }
      onboarding_web_leads: {
        Row: {
          created_at: string | null
          email: string
          equipament_like: string[] | null
          equipament_unlike: string[] | null
          gender_id: string | null
          height: number | null
          id: string
          level_id: string | null
          limitation: string | null
          muscle_focused: Database["public"]["Enums"]["Muscle"][] | null
          name: string
          objective_id: string[] | null
          session_duration: number | null
          source: string | null
          training_days: Database["public"]["Enums"]["DaysInWeek"][] | null
          weight: number | null
          year_birth: number | null
        }
        Insert: {
          created_at?: string | null
          email: string
          equipament_like?: string[] | null
          equipament_unlike?: string[] | null
          gender_id?: string | null
          height?: number | null
          id?: string
          level_id?: string | null
          limitation?: string | null
          muscle_focused?: Database["public"]["Enums"]["Muscle"][] | null
          name: string
          objective_id?: string[] | null
          session_duration?: number | null
          source?: string | null
          training_days?: Database["public"]["Enums"]["DaysInWeek"][] | null
          weight?: number | null
          year_birth?: number | null
        }
        Update: {
          created_at?: string | null
          email?: string
          equipament_like?: string[] | null
          equipament_unlike?: string[] | null
          gender_id?: string | null
          height?: number | null
          id?: string
          level_id?: string | null
          limitation?: string | null
          muscle_focused?: Database["public"]["Enums"]["Muscle"][] | null
          name?: string
          objective_id?: string[] | null
          session_duration?: number | null
          source?: string | null
          training_days?: Database["public"]["Enums"]["DaysInWeek"][] | null
          weight?: number | null
          year_birth?: number | null
        }
        Relationships: []
      }
      revenuecat_events: {
        Row: {
          app_user_id: string
          cancel_reason: string | null
          created_at: string | null
          entitlement_ids: string[] | null
          event_id: string
          event_timestamp: string
          event_type: string
          expiration_at: string | null
          expiration_reason: string | null
          id: string
          original_app_user_id: string | null
          original_transaction_id: string | null
          product_id: string | null
          purchased_at: string | null
          raw_payload: Json
          store: string
          transaction_id: string | null
        }
        Insert: {
          app_user_id: string
          cancel_reason?: string | null
          created_at?: string | null
          entitlement_ids?: string[] | null
          event_id: string
          event_timestamp: string
          event_type: string
          expiration_at?: string | null
          expiration_reason?: string | null
          id?: string
          original_app_user_id?: string | null
          original_transaction_id?: string | null
          product_id?: string | null
          purchased_at?: string | null
          raw_payload: Json
          store: string
          transaction_id?: string | null
        }
        Update: {
          app_user_id?: string
          cancel_reason?: string | null
          created_at?: string | null
          entitlement_ids?: string[] | null
          event_id?: string
          event_timestamp?: string
          event_type?: string
          expiration_at?: string | null
          expiration_reason?: string | null
          id?: string
          original_app_user_id?: string | null
          original_transaction_id?: string | null
          product_id?: string | null
          purchased_at?: string | null
          raw_payload?: Json
          store?: string
          transaction_id?: string | null
        }
        Relationships: []
      }
      user: {
        Row: {
          deleted_at: string | null
          email: string | null
          id: string
          image_profile: string | null
          name: string | null
          phone: string | null
          terms_agree: boolean
        }
        Insert: {
          deleted_at?: string | null
          email?: string | null
          id?: string
          image_profile?: string | null
          name?: string | null
          phone?: string | null
          terms_agree?: boolean
        }
        Update: {
          deleted_at?: string | null
          email?: string | null
          id?: string
          image_profile?: string | null
          name?: string | null
          phone?: string | null
          terms_agree?: boolean
        }
        Relationships: []
      }
      user_role: {
        Row: {
          role: Database["public"]["Enums"]["UserRole"]
          user_uuid: string
        }
        Insert: {
          role: Database["public"]["Enums"]["UserRole"]
          user_uuid?: string
        }
        Update: {
          role?: Database["public"]["Enums"]["UserRole"]
          user_uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_role_user_uuid_fkey"
            columns: ["user_uuid"]
            isOneToOne: true
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          entitlement_id: string | null
          expiration_at: string | null
          id: string
          is_active: boolean
          last_event_at: string | null
          last_event_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          entitlement_id?: string | null
          expiration_at?: string | null
          id?: string
          is_active?: boolean
          last_event_at?: string | null
          last_event_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          entitlement_id?: string | null
          expiration_at?: string | null
          id?: string
          is_active?: boolean
          last_event_at?: string | null
          last_event_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      "user.info_workout": {
        Row: {
          days_in_week: Database["public"]["Enums"]["DaysInWeek"][]
          equipament_like: string[]
          equipament_unlike: string[]
          exercise_like: string[]
          exercise_unlike: string[]
          gender_id: string | null
          height: number
          level_id: string
          limitation: string | null
          muscle_focused: Database["public"]["Enums"]["Muscle"][]
          objective_id: string[]
          session_duration: number
          training_status: Database["public"]["Enums"]["TrainingStatus"]
          user_id: string
          weight: number
          year_birth: number
        }
        Insert: {
          days_in_week: Database["public"]["Enums"]["DaysInWeek"][]
          equipament_like: string[]
          equipament_unlike: string[]
          exercise_like: string[]
          exercise_unlike: string[]
          gender_id?: string | null
          height: number
          level_id: string
          limitation?: string | null
          muscle_focused: Database["public"]["Enums"]["Muscle"][]
          objective_id: string[]
          session_duration: number
          training_status?: Database["public"]["Enums"]["TrainingStatus"]
          user_id?: string
          weight: number
          year_birth: number
        }
        Update: {
          days_in_week?: Database["public"]["Enums"]["DaysInWeek"][]
          equipament_like?: string[]
          equipament_unlike?: string[]
          exercise_like?: string[]
          exercise_unlike?: string[]
          gender_id?: string | null
          height?: number
          level_id?: string
          limitation?: string | null
          muscle_focused?: Database["public"]["Enums"]["Muscle"][]
          objective_id?: string[]
          session_duration?: number
          training_status?: Database["public"]["Enums"]["TrainingStatus"]
          user_id?: string
          weight?: number
          year_birth?: number
        }
        Relationships: [
          {
            foreignKeyName: "user.info_workout_gender_id_fkey"
            columns: ["gender_id"]
            isOneToOne: false
            referencedRelation: "info_workout.gender"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "user.info_workout_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "info_workout.level"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "user.info_workout_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      "workout.exercise": {
        Row: {
          description: string | null
          image_url: string | null
          level_uuid: string[] | null
          methods_support_uuid: string[]
          muscle: Database["public"]["Enums"]["Muscle"]
          name: string
          repetition_type: Database["public"]["Enums"]["RepetitionType"]
          uuid: string
          video_url: string | null
        }
        Insert: {
          description?: string | null
          image_url?: string | null
          level_uuid?: string[] | null
          methods_support_uuid: string[]
          muscle: Database["public"]["Enums"]["Muscle"]
          name: string
          repetition_type: Database["public"]["Enums"]["RepetitionType"]
          uuid?: string
          video_url?: string | null
        }
        Update: {
          description?: string | null
          image_url?: string | null
          level_uuid?: string[] | null
          methods_support_uuid?: string[]
          muscle?: Database["public"]["Enums"]["Muscle"]
          name?: string
          repetition_type?: Database["public"]["Enums"]["RepetitionType"]
          uuid?: string
          video_url?: string | null
        }
        Relationships: []
      }
      "workout.exercise.user_weight": {
        Row: {
          created_at: string
          exercise_uuid: string
          input_unit: Database["public"]["Enums"]["WeightType"]
          is_deleted: boolean
          updated_at: string
          user_uuid: string
          uuid: string
          weight_kilograms: number
          weight_pounds: number
        }
        Insert: {
          created_at?: string
          exercise_uuid: string
          input_unit: Database["public"]["Enums"]["WeightType"]
          is_deleted?: boolean
          updated_at?: string
          user_uuid: string
          uuid?: string
          weight_kilograms: number
          weight_pounds: number
        }
        Update: {
          created_at?: string
          exercise_uuid?: string
          input_unit?: Database["public"]["Enums"]["WeightType"]
          is_deleted?: boolean
          updated_at?: string
          user_uuid?: string
          uuid?: string
          weight_kilograms?: number
          weight_pounds?: number
        }
        Relationships: []
      }
      "workout.method": {
        Row: {
          description: string | null
          level_uuid: string[] | null
          name: string
          objective_uuid: string[] | null
          uuid: string
          video_url: string | null
        }
        Insert: {
          description?: string | null
          level_uuid?: string[] | null
          name: string
          objective_uuid?: string[] | null
          uuid?: string
          video_url?: string | null
        }
        Update: {
          description?: string | null
          level_uuid?: string[] | null
          name?: string
          objective_uuid?: string[] | null
          uuid?: string
          video_url?: string | null
        }
        Relationships: []
      }
      "workout.periodization": {
        Row: {
          level_uuid: string
          uuid: string
        }
        Insert: {
          level_uuid: string
          uuid?: string
        }
        Update: {
          level_uuid?: string
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout.periodization_level_uuid_fkey"
            columns: ["level_uuid"]
            isOneToOne: false
            referencedRelation: "info_workout.level"
            referencedColumns: ["uuid"]
          },
        ]
      }
      "workout.periodization.details": {
        Row: {
          max_repetitions: number
          min_repetitions: number
          order: number
          periodization_uuid: string
          uuid: string
        }
        Insert: {
          max_repetitions: number
          min_repetitions: number
          order: number
          periodization_uuid: string
          uuid?: string
        }
        Update: {
          max_repetitions?: number
          min_repetitions?: number
          order?: number
          periodization_uuid?: string
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout.periodization.details_periodization_uuid_fkey"
            columns: ["periodization_uuid"]
            isOneToOne: false
            referencedRelation: "workout.periodization"
            referencedColumns: ["uuid"]
          },
        ]
      }
      "workout.training": {
        Row: {
          created_at: string
          date_end: string
          date_start: string
          level_uuid: string | null
          periodization_uuid: string
          sessions_per_week: number | null
          user_uuid: string
          uuid: string
        }
        Insert: {
          created_at?: string
          date_end: string
          date_start: string
          level_uuid?: string | null
          periodization_uuid: string
          sessions_per_week?: number | null
          user_uuid: string
          uuid?: string
        }
        Update: {
          created_at?: string
          date_end?: string
          date_start?: string
          level_uuid?: string | null
          periodization_uuid?: string
          sessions_per_week?: number | null
          user_uuid?: string
          uuid?: string
        }
        Relationships: []
      }
      "workout.training.division": {
        Row: {
          description: string | null
          duration: number | null
          name: string | null
          order: number
          user_uuid: string
          uuid: string
          workout_uuid: string
        }
        Insert: {
          description?: string | null
          duration?: number | null
          name?: string | null
          order: number
          user_uuid: string
          uuid?: string
          workout_uuid: string
        }
        Update: {
          description?: string | null
          duration?: number | null
          name?: string | null
          order?: number
          user_uuid?: string
          uuid?: string
          workout_uuid?: string
        }
        Relationships: []
      }
      "workout.training.division.exercise": {
        Row: {
          division_uuid: string
          exercise_uuid: string
          method_uuid: string | null
          order: number
          sets: number
          user_uuid: string
          uuid: string
        }
        Insert: {
          division_uuid: string
          exercise_uuid: string
          method_uuid?: string | null
          order: number
          sets?: number
          user_uuid: string
          uuid?: string
        }
        Update: {
          division_uuid?: string
          exercise_uuid?: string
          method_uuid?: string | null
          order?: number
          sets?: number
          user_uuid?: string
          uuid?: string
        }
        Relationships: []
      }
    }
    Views: {
      "api.exercise": {
        Row: {
          description: string | null
          image_url: string | null
          levels: string[] | null
          muscle: Database["public"]["Enums"]["Muscle"] | null
          name: string | null
          repetition_type: Database["public"]["Enums"]["RepetitionType"] | null
          uuid: string | null
          video_url: string | null
        }
        Relationships: []
      }
      "api.method": {
        Row: {
          description: string | null
          name: string | null
          uuid: string | null
          video_url: string | null
        }
        Relationships: []
      }
      "api.training": {
        Row: {
          created_at: string | null
          date_end: string | null
          date_start: string | null
          divisions: Json | null
          level: string | null
          periodization: Json | null
          sessions_per_week: number | null
          user_uuid: string | null
          uuid: string | null
        }
        Relationships: []
      }
      "backend.user_info_workout": {
        Row: {
          equipments_liked: Json | null
          equipments_unliked: Json | null
          exercises_liked: Json | null
          exercises_unliked: Json | null
          gender_data: Json | null
          info_workout_data: Json | null
          level_data: Json | null
          objectives: Json | null
          user_id: string | null
        }
        Relationships: []
      }
      "backend.user_workout_with_subscription": {
        Row: {
          is_subscription_active: boolean | null
          user_uuid: string | null
          workout_date_end: string | null
          workout_uuid: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_status: { Args: { p_user_id: string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      DaysInWeek:
        | "SUNDAY"
        | "MONDAY"
        | "TUESDAY"
        | "WEDNESDAY"
        | "THURSDAY"
        | "FRIDAY"
        | "SATURDAY"
      Level: "BEGINNER" | "INTERMEDIARY" | "ADVANCED"
      Muscle:
        | "ABDOMEN"
        | "BACK"
        | "BICEPS"
        | "CALF"
        | "CHEST"
        | "FOREARM"
        | "GLUTES"
        | "LOWER_BACK"
        | "OTHER"
        | "POSTERIOR_THIGH"
        | "QUADRICEPS"
        | "SHOULDER"
        | "TRAPEZIUS"
        | "TRICEPS"
      RepetitionType: "PERIODIZATION" | "ISOMETRIC"
      TrainingStatus: "PENDENT" | "GENERATING" | "COMPLETED"
      UserRole: "USER" | "ADMIN"
      WeightType: "KILOGRAM" | "POUND"
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

export const Constants = {
  public: {
    Enums: {
      DaysInWeek: [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ],
      Level: ["BEGINNER", "INTERMEDIARY", "ADVANCED"],
      Muscle: [
        "ABDOMEN",
        "BACK",
        "BICEPS",
        "CALF",
        "CHEST",
        "FOREARM",
        "GLUTES",
        "LOWER_BACK",
        "OTHER",
        "POSTERIOR_THIGH",
        "QUADRICEPS",
        "SHOULDER",
        "TRAPEZIUS",
        "TRICEPS",
      ],
      RepetitionType: ["PERIODIZATION", "ISOMETRIC"],
      TrainingStatus: ["PENDENT", "GENERATING", "COMPLETED"],
      UserRole: ["USER", "ADMIN"],
      WeightType: ["KILOGRAM", "POUND"],
    },
  },
} as const
