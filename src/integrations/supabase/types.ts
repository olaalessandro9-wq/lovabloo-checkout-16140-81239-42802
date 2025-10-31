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
      affiliates: {
        Row: {
          active: boolean | null
          code: string
          commission_percentage: number
          created_at: string | null
          email: string
          id: string
          name: string
          product_id: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          commission_percentage: number
          created_at?: string | null
          email: string
          id?: string
          name: string
          product_id?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          commission_percentage?: number
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliates_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliates_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_order_bump_products"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_components: {
        Row: {
          component_order: number
          content: Json
          created_at: string | null
          id: string
          row_id: string
          type: string
        }
        Insert: {
          component_order: number
          content?: Json
          created_at?: string | null
          id?: string
          row_id: string
          type: string
        }
        Update: {
          component_order?: number
          content?: Json
          created_at?: string | null
          id?: string
          row_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_components_row_id_fkey"
            columns: ["row_id"]
            isOneToOne: false
            referencedRelation: "checkout_rows"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_links: {
        Row: {
          checkout_id: string
          created_at: string | null
          id: string
          link_id: string
        }
        Insert: {
          checkout_id: string
          created_at?: string | null
          id?: string
          link_id: string
        }
        Update: {
          checkout_id?: string
          created_at?: string | null
          id?: string
          link_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_links_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_links_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: true
            referencedRelation: "payment_links"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_rows: {
        Row: {
          checkout_id: string
          created_at: string | null
          id: string
          layout: string
          row_order: number
        }
        Insert: {
          checkout_id: string
          created_at?: string | null
          id?: string
          layout: string
          row_order: number
        }
        Update: {
          checkout_id?: string
          created_at?: string | null
          id?: string
          layout?: string
          row_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "checkout_rows_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkouts"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_sessions: {
        Row: {
          id: string
          last_seen_at: string
          order_id: string | null
          started_at: string
          status: string
          vendor_id: string
        }
        Insert: {
          id?: string
          last_seen_at?: string
          order_id?: string | null
          started_at?: string
          status?: string
          vendor_id: string
        }
        Update: {
          id?: string
          last_seen_at?: string
          order_id?: string | null
          started_at?: string
          status?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_sessions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_visits: {
        Row: {
          checkout_id: string
          id: string
          ip_address: string | null
          referrer: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visited_at: string
        }
        Insert: {
          checkout_id: string
          id?: string
          ip_address?: string | null
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visited_at?: string
        }
        Update: {
          checkout_id?: string
          id?: string
          ip_address?: string | null
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_visits_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkouts"
            referencedColumns: ["id"]
          },
        ]
      }
      checkouts: {
        Row: {
          background_color: string | null
          bottom_components: Json | null
          button_color: string | null
          button_text_color: string | null
          components: Json | null
          created_at: string | null
          design: Json | null
          font: string | null
          form_background_color: string | null
          id: string
          is_default: boolean
          name: string
          primary_color: string | null
          product_id: string | null
          secondary_color: string | null
          selected_payment_color: string | null
          seller_name: string | null
          slug: string | null
          text_color: string | null
          top_components: Json | null
          updated_at: string | null
          visits_count: number
        }
        Insert: {
          background_color?: string | null
          bottom_components?: Json | null
          button_color?: string | null
          button_text_color?: string | null
          components?: Json | null
          created_at?: string | null
          design?: Json | null
          font?: string | null
          form_background_color?: string | null
          id?: string
          is_default?: boolean
          name: string
          primary_color?: string | null
          product_id?: string | null
          secondary_color?: string | null
          selected_payment_color?: string | null
          seller_name?: string | null
          slug?: string | null
          text_color?: string | null
          top_components?: Json | null
          updated_at?: string | null
          visits_count?: number
        }
        Update: {
          background_color?: string | null
          bottom_components?: Json | null
          button_color?: string | null
          button_text_color?: string | null
          components?: Json | null
          created_at?: string | null
          design?: Json | null
          font?: string | null
          form_background_color?: string | null
          id?: string
          is_default?: boolean
          name?: string
          primary_color?: string | null
          product_id?: string | null
          secondary_color?: string | null
          selected_payment_color?: string | null
          seller_name?: string | null
          slug?: string | null
          text_color?: string | null
          top_components?: Json | null
          updated_at?: string | null
          visits_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "checkouts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkouts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_order_bump_products"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_products: {
        Row: {
          coupon_id: string | null
          id: string
          product_id: string | null
        }
        Insert: {
          coupon_id?: string | null
          id?: string
          product_id?: string | null
        }
        Update: {
          coupon_id?: string | null
          id?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_products_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_order_bump_products"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          max_uses: number | null
          uses_count: number | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          uses_count?: number | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          uses_count?: number | null
        }
        Relationships: []
      }
      downsells: {
        Row: {
          active: boolean | null
          checkout_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          name: string
          price: number
        }
        Insert: {
          active?: boolean | null
          checkout_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name: string
          price: number
        }
        Update: {
          active?: boolean | null
          checkout_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "downsells_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkouts"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          price: number
          product_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          price: number
          product_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          price?: number
          product_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_order_bump_products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_bumps: {
        Row: {
          active: boolean | null
          call_to_action: string | null
          checkout_id: string
          created_at: string | null
          custom_description: string | null
          custom_title: string | null
          discount_enabled: boolean | null
          discount_price: number | null
          id: string
          offer_id: string | null
          position: number
          product_id: string
          show_image: boolean | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          call_to_action?: string | null
          checkout_id: string
          created_at?: string | null
          custom_description?: string | null
          custom_title?: string | null
          discount_enabled?: boolean | null
          discount_price?: number | null
          id?: string
          offer_id?: string | null
          position?: number
          product_id: string
          show_image?: boolean | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          call_to_action?: string | null
          checkout_id?: string
          created_at?: string | null
          custom_description?: string | null
          custom_title?: string | null
          discount_enabled?: boolean | null
          discount_price?: number | null
          id?: string
          offer_id?: string | null
          position?: number
          product_id?: string
          show_image?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_bumps_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_bumps_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_bumps_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "v_offers_normalized"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_bumps_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_bumps_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_order_bump_products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events: {
        Row: {
          created_at: string
          data: Json | null
          gateway_event_id: string | null
          id: string
          occurred_at: string
          order_id: string
          type: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          gateway_event_id?: string | null
          id?: string
          occurred_at: string
          order_id: string
          type: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          gateway_event_id?: string | null
          id?: string
          occurred_at?: string
          order_id?: string
          type?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          gateway: string
          gateway_payment_id: string | null
          id: string
          payment_method: string | null
          product_id: string
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          gateway: string
          gateway_payment_id?: string | null
          id?: string
          payment_method?: string | null
          product_id: string
          status: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          gateway?: string
          gateway_payment_id?: string | null
          id?: string
          payment_method?: string | null
          product_id?: string
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_order_bump_products"
            referencedColumns: ["id"]
          },
        ]
      }
      outbound_webhooks: {
        Row: {
          active: boolean
          created_at: string
          events: string[]
          id: string
          secret: string
          updated_at: string
          url: string
          vendor_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          events: string[]
          id?: string
          secret: string
          updated_at?: string
          url: string
          vendor_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          events?: string[]
          id?: string
          secret?: string
          updated_at?: string
          url?: string
          vendor_id?: string
        }
        Relationships: []
      }
      payment_links: {
        Row: {
          created_at: string | null
          id: string
          offer_id: string
          slug: string
          status: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          offer_id: string
          slug: string
          status?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          offer_id?: string
          slug?: string
          status?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_links_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_links_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "v_offers_normalized"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          status: string | null
          support_email: string | null
          support_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          status?: string | null
          support_email?: string | null
          support_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          status?: string | null
          support_email?: string | null
          support_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cpf_cnpj: string | null
          created_at: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          cpf_cnpj?: string | null
          created_at?: string | null
          id: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          cpf_cnpj?: string | null
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      upsells: {
        Row: {
          active: boolean | null
          checkout_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          name: string
          price: number
        }
        Insert: {
          active?: boolean | null
          checkout_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name: string
          price: number
        }
        Update: {
          active?: boolean | null
          checkout_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "upsells_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkouts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_integrations: {
        Row: {
          active: boolean
          config: Json
          created_at: string
          id: string
          integration_type: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          active?: boolean
          config?: Json
          created_at?: string
          id?: string
          integration_type: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          active?: boolean
          config?: Json
          created_at?: string
          id?: string
          integration_type?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          attempts: number
          created_at: string
          event_type: string
          id: string
          last_attempt_at: string | null
          next_retry_at: string | null
          order_id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          status: string
          webhook_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          event_type: string
          id?: string
          last_attempt_at?: string | null
          next_retry_at?: string | null
          order_id: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          status: string
          webhook_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          event_type?: string
          id?: string
          last_attempt_at?: string | null
          next_retry_at?: string | null
          order_id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          status?: string
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "outbound_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_offers_normalized: {
        Row: {
          created_at: string | null
          id: string | null
          price: number | null
          product_id: string | null
          product_name: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_order_bump_products"
            referencedColumns: ["id"]
          },
        ]
      }
      v_order_bump_products: {
        Row: {
          id: string | null
          image_url: string | null
          name: string | null
          price: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          image_url?: string | null
          name?: string | null
          price?: never
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          image_url?: string | null
          name?: string | null
          price?: never
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      attach_offer_to_checkout_smart: {
        Args: { p_checkout_id: string; p_offer_id: string }
        Returns: Json
      }
      clone_checkout_deep: {
        Args: { dst_checkout_id: string; src_checkout_id: string }
        Returns: undefined
      }
      clone_checkout_deep_v5: {
        Args: { p_dst: string; p_src: string }
        Returns: undefined
      }
      clone_checkout_layout: {
        Args: { p_source_checkout_id: string; p_target_checkout_id: string }
        Returns: undefined
      }
      create_payment_link_for_offer: {
        Args: { p_offer_id: string; p_slug?: string }
        Returns: string
      }
      duplicate_checkout_shallow: {
        Args: { p_source_checkout_id: string }
        Returns: string
      }
      generate_checkout_slug: { Args: never; Returns: string }
      generate_link_slug: {
        Args: { offer_name: string; offer_price: number }
        Returns: string
      }
      generate_unique_payment_slug: {
        Args: { p_offer_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_checkout_visits: {
        Args: { checkout_id: string }
        Returns: undefined
      }
      slugify: { Args: { txt: string }; Returns: string }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
