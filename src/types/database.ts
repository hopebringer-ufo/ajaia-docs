export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      document_shares: {
        Row: {
          id: string;
          document_id: string;
          shared_with_user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          shared_with_user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          shared_with_user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "document_shares_document_id_fkey";
            columns: ["document_id"];
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "document_shares_shared_with_user_id_fkey";
            columns: ["shared_with_user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      user_can_access_document: { Args: { doc_id: string }; Returns: boolean };
      user_owns_document: { Args: { doc_id: string }; Returns: boolean };
      create_document: {
        Args: { p_title?: string; p_content?: string };
        Returns: Database["public"]["Tables"]["documents"]["Row"];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type DocumentShare =
  Database["public"]["Tables"]["document_shares"]["Row"];

export type DocumentSummary = Omit<Document, "content">;

export type DocumentWithOwner = Document & {
  owner: Pick<Profile, "id" | "email" | "full_name">;
};

export type DocumentSummaryWithOwner = DocumentSummary & {
  owner: Pick<Profile, "id" | "email" | "full_name">;
};

export type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
