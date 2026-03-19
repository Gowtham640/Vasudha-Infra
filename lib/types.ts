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
      };
      projects: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number | null;
          status: string | null;
          address: string | null;
          landmark: string | null;
          map_embed_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price?: number | null;
          status?: string | null;
          address?: string | null;
          landmark?: string | null;
          map_embed_url?: string | null;
        };
        Update: Partial<{
          name: string;
          slug: string;
          description: string | null;
          price: number | null;
          status: string | null;
          address: string | null;
          landmark: string | null;
          map_embed_url: string | null;
        }>;
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
        Update: Partial<{
          page_id: string | null;
          type: string;
          data_source_type: string | null;
          order_index: number;
          is_visible: boolean | null;
        }>;
      };
      section_content: {
        Row: {
          id: string;
          section_id: string | null;
          content: Json;
        };
        Insert: {
          section_id?: string | null;
          content: Json;
        };
        Update: {
          section_id?: string | null;
          content?: Json;
        };
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
      };
    };
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
