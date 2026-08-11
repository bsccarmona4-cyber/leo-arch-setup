-- analyses table
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_hash TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'web')),
  url_original TEXT NOT NULL,
  url_final TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  verdict TEXT NOT NULL CHECK (verdict IN ('safe', 'suspicious', 'fraud')),
  threat_type TEXT,
  brand_spoofed TEXT,
  llm_explanation TEXT,
  response_sent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analyses_user_hash ON analyses(user_hash);
CREATE INDEX idx_analyses_verdict ON analyses(verdict);
CREATE INDEX idx_analyses_brand ON analyses(brand_spoofed);
CREATE INDEX idx_analyses_created ON analyses(created_at DESC);
CREATE INDEX idx_analyses_channel ON analyses(channel);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON analyses
  FOR ALL USING (true) WITH CHECK (true);

-- Allow anon to read for dashboard
CREATE POLICY "Anon read analyses" ON analyses
  FOR SELECT USING (true);

-- url_cache table
CREATE TABLE url_cache (
  url_hash TEXT PRIMARY KEY,
  score INTEGER NOT NULL DEFAULT 0,
  verdict TEXT NOT NULL CHECK (verdict IN ('safe', 'suspicious', 'fraud')),
  threat_type TEXT,
  brand_spoofed TEXT,
  llm_explanation TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_url_cache_expires ON url_cache(expires_at);

ALTER TABLE url_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access cache" ON url_cache
  FOR ALL USING (true) WITH CHECK (true);

-- user_context table
CREATE TABLE user_context (
  user_hash TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'web')),
  analysis_count INTEGER NOT NULL DEFAULT 0,
  last_analysis_at TIMESTAMPTZ,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB,
  PRIMARY KEY (user_hash, channel)
);

ALTER TABLE user_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access context" ON user_context
  FOR ALL USING (true) WITH CHECK (true);

-- rate_limits table (used by security.ts)
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rate_limits_ip_endpoint ON rate_limits(ip_hash, endpoint);
CREATE INDEX idx_rate_limits_window ON rate_limits(window_start);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access rate_limits" ON rate_limits
  FOR ALL USING (true) WITH CHECK (true);

-- Function to increment analysis count
CREATE OR REPLACE FUNCTION increment_analysis_count(
  p_user_hash TEXT,
  p_channel TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_context (user_hash, channel, analysis_count, last_analysis_at)
  VALUES (p_user_hash, p_channel, 1, now())
  ON CONFLICT (user_hash, channel)
  DO UPDATE SET
    analysis_count = user_context.analysis_count + 1,
    last_analysis_at = now();
END;
$$;

-- ═══════════════════════════════════════════
-- Stripe Subscriptions
-- ═══════════════════════════════════════════

CREATE TABLE subscription_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  familiar_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'expired')),
  stripe_customer_id TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sub_intents_session ON subscription_intents(stripe_session_id);
CREATE INDEX idx_sub_intents_email ON subscription_intents(email);

ALTER TABLE subscription_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access intents" ON subscription_intents
  FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  email TEXT NOT NULL,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('mensual', 'trimestral', 'anual')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  familiar_whatsapp TEXT,
  familiar_email TEXT,
  canceled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subs_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subs_email ON subscriptions(email);
CREATE INDEX idx_subs_status ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access subs" ON subscriptions
  FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE analyses;
ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;
