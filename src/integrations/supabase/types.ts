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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          record_id: string
          resource: string
          subject_user_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          record_id: string
          resource: string
          subject_user_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          record_id?: string
          resource?: string
          subject_user_id?: string | null
        }
        Relationships: []
      }
      admin_operations: {
        Row: {
          created_at: string
          description: string
          frequency: string | null
          id: string
          kind: string
          last_completed_at: string | null
          notes: string
          responsible: string
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string
          frequency?: string | null
          id: string
          kind: string
          last_completed_at?: string | null
          notes?: string
          responsible?: string
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          frequency?: string | null
          id?: string
          kind?: string
          last_completed_at?: string | null
          notes?: string
          responsible?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      app_usage_logs: {
        Row: {
          created_at: string
          event_kind: string
          id: string
          module: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_kind: string
          id?: string
          module: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_kind?: string
          id?: string
          module?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_user_activity: {
        Row: {
          created_at: string
          last_active_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          last_active_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          last_active_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          date: string
          end_time: string | null
          google_calendar_id: string | null
          google_event_id: string | null
          id: string
          last_synced_at: string | null
          linked_show_id: string | null
          local: string | null
          notes: string | null
          playlist_id: string | null
          realizado: boolean
          start_time: string
          sync_status: string
          tipo: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time?: string | null
          google_calendar_id?: string | null
          google_event_id?: string | null
          id?: string
          last_synced_at?: string | null
          linked_show_id?: string | null
          local?: string | null
          notes?: string | null
          playlist_id?: string | null
          realizado?: boolean
          start_time: string
          sync_status?: string
          tipo?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string | null
          google_calendar_id?: string | null
          google_event_id?: string | null
          id?: string
          last_synced_at?: string | null
          linked_show_id?: string | null
          local?: string | null
          notes?: string | null
          playlist_id?: string | null
          realizado?: boolean
          start_time?: string
          sync_status?: string
          tipo?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_linked_show_id_fkey"
            columns: ["linked_show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          categoria: string
          created_at: string
          data: string
          descricao: string
          id: string
          origin: string | null
          show_id: string | null
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria?: string
          created_at?: string
          data?: string
          descricao: string
          id?: string
          origin?: string | null
          show_id?: string | null
          updated_at?: string
          user_id: string
          valor?: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          origin?: string | null
          show_id?: string | null
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "expenses_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_goal_transactions: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          tipo: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          tipo: string
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          tipo?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_goal_transactions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "financial_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_goals: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string
          id: string
          nome: string
          periodo: string
          saldo_ajuste: number
          updated_at: string
          user_id: string
          valor_meta: number
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          nome: string
          periodo?: string
          saldo_ajuste?: number
          updated_at?: string
          user_id: string
          valor_meta?: number
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          nome?: string
          periodo?: string
          saldo_ajuste?: number
          updated_at?: string
          user_id?: string
          valor_meta?: number
        }
        Relationships: []
      }
      fixed_expenses: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string
          dia_vencimento: number
          id: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao: string
          dia_vencimento?: number
          id?: string
          updated_at?: string
          user_id: string
          valor?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string
          dia_vencimento?: number
          id?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      incomes: {
        Row: {
          categoria: string | null
          created_at: string
          data: string
          descricao: string
          id: string
          source: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          data?: string
          descricao: string
          id?: string
          source?: string
          updated_at?: string
          user_id: string
          valor?: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          source?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          created_at: string
          delivery_status: string
          error: string | null
          event_id: string | null
          event_type: string
          id: string
          message_body: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_status?: string
          error?: string | null
          event_id?: string | null
          event_type?: string
          id?: string
          message_body?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_status?: string
          error?: string | null
          event_id?: string | null
          event_type?: string
          id?: string
          message_body?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          enable_whatsapp: boolean
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          enable_whatsapp?: boolean
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          enable_whatsapp?: boolean
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      piggy_bank_transactions: {
        Row: {
          created_at: string
          data: string
          id: string
          piggy_bank_id: string
          tipo: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          data?: string
          id?: string
          piggy_bank_id: string
          tipo: string
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          piggy_bank_id?: string
          tipo?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "piggy_bank_transactions_piggy_bank_id_fkey"
            columns: ["piggy_bank_id"]
            isOneToOne: false
            referencedRelation: "piggy_banks"
            referencedColumns: ["id"]
          },
        ]
      }
      piggy_banks: {
        Row: {
          created_at: string
          id: string
          nome: string
          objetivo: number | null
          updated_at: string
          user_id: string
          valor_atual: number
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          objetivo?: number | null
          updated_at?: string
          user_id: string
          valor_atual?: number
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          objetivo?: number | null
          updated_at?: string
          user_id?: string
          valor_atual?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cidade: string | null
          created_at: string
          email: string | null
          estado: string | null
          genero_musical: string | null
          google_calendar_enabled: boolean
          google_calendar_status: string
          google_connected_at: string | null
          id: string
          name: string
          onboarding_completed: boolean
          plan: string | null
          tipo_musico: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          cidade?: string | null
          created_at?: string
          email?: string | null
          estado?: string | null
          genero_musical?: string | null
          google_calendar_enabled?: boolean
          google_calendar_status?: string
          google_connected_at?: string | null
          id?: string
          name?: string
          onboarding_completed?: boolean
          plan?: string | null
          tipo_musico?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          cidade?: string | null
          created_at?: string
          email?: string | null
          estado?: string | null
          genero_musical?: string | null
          google_calendar_enabled?: boolean
          google_calendar_status?: string
          google_connected_at?: string | null
          id?: string
          name?: string
          onboarding_completed?: boolean
          plan?: string | null
          tipo_musico?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          cronograma: string | null
          description: string | null
          id: string
          name: string
          referencias: string | null
          roteiro: string | null
          saved_value: number
          total_value: number
          updated_at: string
          user_id: string
          weekly_deposit: number | null
        }
        Insert: {
          created_at?: string
          cronograma?: string | null
          description?: string | null
          id?: string
          name: string
          referencias?: string | null
          roteiro?: string | null
          saved_value?: number
          total_value?: number
          updated_at?: string
          user_id: string
          weekly_deposit?: number | null
        }
        Update: {
          created_at?: string
          cronograma?: string | null
          description?: string | null
          id?: string
          name?: string
          referencias?: string | null
          roteiro?: string | null
          saved_value?: number
          total_value?: number
          updated_at?: string
          user_id?: string
          weekly_deposit?: number | null
        }
        Relationships: []
      }
      setlist_songs: {
        Row: {
          created_at: string
          id: string
          posicao: number
          setlist_id: string
          song_id: string
          tom_escolhido: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          posicao?: number
          setlist_id: string
          song_id: string
          tom_escolhido?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          posicao?: number
          setlist_id?: string
          song_id?: string
          tom_escolhido?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "setlist_songs_setlist_id_fkey"
            columns: ["setlist_id"]
            isOneToOne: false
            referencedRelation: "setlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setlist_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      setlists: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shows: {
        Row: {
          address: string | null
          cache: number
          cash_tracking: boolean
          combustivel: number
          consumacao: number
          contractor: string | null
          created_at: string
          date: string
          deduct_team: boolean
          deposit_amount: number
          deposit_date: string | null
          deposit_received: boolean
          end_time: string | null
          equipamentos: number
          id: string
          km_rodados: number
          local: string
          notes: string | null
          num_musicos: number
          outros_custos: number
          pagamento_musicos: number
          pedagio: number
          realizado: boolean
          roupas: number
          settled: boolean
          settlement_date: string | null
          team_payment_date: string | null
          time: string | null
          tipo: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          cache?: number
          cash_tracking?: boolean
          combustivel?: number
          consumacao?: number
          contractor?: string | null
          created_at?: string
          date: string
          deduct_team?: boolean
          deposit_amount?: number
          deposit_date?: string | null
          deposit_received?: boolean
          end_time?: string | null
          equipamentos?: number
          id?: string
          km_rodados?: number
          local: string
          notes?: string | null
          num_musicos?: number
          outros_custos?: number
          pagamento_musicos?: number
          pedagio?: number
          realizado?: boolean
          roupas?: number
          settled?: boolean
          settlement_date?: string | null
          team_payment_date?: string | null
          time?: string | null
          tipo?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          cache?: number
          cash_tracking?: boolean
          combustivel?: number
          consumacao?: number
          contractor?: string | null
          created_at?: string
          date?: string
          deduct_team?: boolean
          deposit_amount?: number
          deposit_date?: string | null
          deposit_received?: boolean
          end_time?: string | null
          equipamentos?: number
          id?: string
          km_rodados?: number
          local?: string
          notes?: string | null
          num_musicos?: number
          outros_custos?: number
          pagamento_musicos?: number
          pedagio?: number
          realizado?: boolean
          roupas?: number
          settled?: boolean
          settlement_date?: string | null
          team_payment_date?: string | null
          time?: string | null
          tipo?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      songs: {
        Row: {
          artist: string | null
          cifra_club_link: string | null
          created_at: string
          how_you_play: string | null
          id: string
          notes: string | null
          title: string
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          artist?: string | null
          cifra_club_link?: string | null
          created_at?: string
          how_you_play?: string | null
          id?: string
          notes?: string | null
          title: string
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          artist?: string | null
          cifra_club_link?: string | null
          created_at?: string
          how_you_play?: string | null
          id?: string
          notes?: string | null
          title?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_activity_page: {
        Args: { p_offset?: number }
        Returns: {
          last_active_at: string
          user_id: string
        }[]
      }
      admin_module_usage: {
        Args: { p_since: string }
        Returns: {
          accesses: number
          module: string
          users_count: number
        }[]
      }
      admin_usage_logs_page: {
        Args: { p_offset?: number }
        Returns: {
          created_at: string
          event_kind: string
          id: string
          module: string
          user_id: string
        }[]
      }
      delete_financial_goal: { Args: { p_goal_id: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      move_financial_goal: {
        Args: { p_goal_id: string; p_tipo: string; p_valor: number }
        Returns: number
      }
      move_piggy_bank: {
        Args: { p_bank_id: string; p_tipo: string; p_valor: number }
        Returns: number
      }
      record_app_usage: {
        Args: { p_event_kind?: string; p_module?: string }
        Returns: undefined
      }
      reset_user_data: { Args: { p_email: string }; Returns: undefined }
    }
    Enums: {
      app_role: "owner" | "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin", "user"],
    },
  },
} as const
