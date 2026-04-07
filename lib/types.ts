export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: "user" | "admin" | "owner" | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role?: "user" | "admin" | "owner" | null;
        };
        Update: Partial<{
          name: string;
          email: string;
          role: "user" | "admin" | "owner" | null;
        }>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number | null;
          size_sq_yd: number | null;
          status: string | null;
          address: string | null;
          landmark: string | null;
          map_embed_url: string | null;
          city: string | null;
          district: string | null;
          amenities: string[];
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price?: number | null;
          size_sq_yd?: number | null;
          status?: string | null;
          address?: string | null;
          landmark?: string | null;
          map_embed_url?: string | null;
          city?: string | null;
          district?: string | null;
          amenities?: string[];
        };
        Update: Partial<{
          name: string;
          description: string | null;
          price: number | null;
          size_sq_yd: number | null;
          status: string | null;
          address: string | null;
          landmark: string | null;
          map_embed_url: string | null;
          city: string | null;
          district: string | null;
          amenities: string[];
        }>;
        Relationships: [];
      };
      project_images: {
        Row: {
          id: string;
          project_id: string | null;
          image_path: string;
          order_index: number | null;
          alt_text: string | null;
          is_cover: boolean | null;
        };
        Insert: {
          project_id?: string | null;
          image_path: string;
          order_index?: number | null;
          alt_text?: string | null;
          is_cover?: boolean | null;
        };
        Update: Partial<{
          project_id: string | null;
          image_path: string;
          order_index: number | null;
          alt_text: string | null;
          is_cover: boolean | null;
        }>;
        Relationships: [];
      };
      pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          seo_title?: string | null;
          seo_description?: string | null;
        };
        Update: Partial<{
          slug: string;
          title: string;
          seo_title: string | null;
          seo_description: string | null;
        }>;
        Relationships: [];
      };
      sections: {
        Row: {
          id: string;
          page_id: string | null;
          type: string;
          data_source_type: string | null;
          order_index: number;
          is_visible: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          page_id?: string | null;
          type: string;
          data_source_type?: string | null;
          order_index: number;
          is_visible?: boolean | null;
        };
        Update: Partial<{
          page_id: string | null;
          type: string;
          data_source_type: string | null;
          order_index: number;
          is_visible: boolean | null;
        }>;
        Relationships: [];
      };
      section_content: {
        Row: {
          id: string;
          section_id: string | null;
          order: number | null;
          project: string | null;
          content?: Json;
        };
        Insert: {
          section_id?: string | null;
          order?: number | null;
          project?: string | null;
          content?: Json;
        };
        Update: Partial<{
          section_id?: string | null;
          order: number | null;
          project: string | null;
          content: Json;
        }>;
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          name: string | null;
          phone: string | null;
          email: string | null;
          message: string | null;
          project_id: string | null;
          created_at: string | null;
        };
        Insert: {
          name?: string | null;
          phone?: string | null;
          email?: string | null;
          message?: string | null;
          project_id?: string | null;
        };
        Update: Partial<{
          name: string | null;
          phone: string | null;
          email: string | null;
          message: string | null;
          project_id: string | null;
        }>;
        Relationships: [];
      };
      logs: {
        Row: {
          id: string;
          event: string | null;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: {
          event?: string | null;
          metadata?: Json | null;
        };
        Update: Partial<{
          event: string | null;
          metadata: Json | null;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_my_role: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      is_owner: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
};

export type SectionKey =
  | "home_hero"
  | "home_why_us"
  | "home_lead_banner"
  | "home_contact"
  | "projects_list"
  | "about_overview"
  | "contact_cta";

export type SectionPayload = {
  [key in SectionKey]?: Json;
};
