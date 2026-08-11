export interface Database {
  public: {
    Tables: {
      analyses: {
        Row: {
          id: string
          user_hash: string
          channel: 'whatsapp' | 'email' | 'web'
          url_original: string
          url_final: string | null
          score: number
          verdict: 'safe' | 'suspicious' | 'fraud'
          threat_type: string | null
          brand_spoofed: string | null
          llm_explanation: string | null
          response_sent: string | null
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['analyses']['Row'], 'id' | 'created_at'>
      }
      url_cache: {
        Row: {
          url_hash: string
          score: number
          verdict: 'safe' | 'suspicious' | 'fraud'
          threat_type: string | null
          brand_spoofed: string | null
          llm_explanation: string | null
          expires_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['url_cache']['Row'], 'created_at'>
      }
      user_context: {
        Row: {
          user_hash: string
          channel: 'whatsapp' | 'email' | 'web'
          analysis_count: number
          last_analysis_at: string | null
          first_seen: string
          metadata: Record<string, unknown> | null
        }
        Insert: Omit<Database['public']['Tables']['user_context']['Row'], 'first_seen'>
      }
    }
    Functions: {
      increment_analysis_count: {
        Args: { p_user_hash: string; p_channel: string }
        Returns: void
      }
    }
  }
}
