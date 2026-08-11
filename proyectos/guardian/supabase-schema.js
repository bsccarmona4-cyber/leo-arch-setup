const { Client } = require('pg')
const fs = require('fs')

const schema = `
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_hash TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email')),
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

CREATE INDEX IF NOT EXISTS idx_analyses_user_hash ON analyses(user_hash);
CREATE INDEX IF NOT EXISTS idx_analyses_verdict ON analyses(verdict);
CREATE INDEX IF NOT EXISTS idx_analyses_brand ON analyses(brand_spoofed);
CREATE INDEX IF NOT EXISTS idx_analyses_created ON analyses(created_at DESC);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS url_cache (
  url_hash TEXT PRIMARY KEY,
  score INTEGER NOT NULL DEFAULT 0,
  verdict TEXT NOT NULL CHECK (verdict IN ('safe', 'suspicious', 'fraud')),
  threat_type TEXT,
  brand_spoofed TEXT,
  llm_explanation TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_url_cache_expires ON url_cache(expires_at);

ALTER TABLE url_cache ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS user_context (
  user_hash TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email')),
  analysis_count INTEGER NOT NULL DEFAULT 0,
  last_analysis_at TIMESTAMPTZ,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB,
  PRIMARY KEY (user_hash, channel)
);

ALTER TABLE user_context ENABLE ROW LEVEL SECURITY;

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
`

// RLS policies after tables exist
const policies = `
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access' AND tablename = 'analyses') THEN
    CREATE POLICY "Service role full access" ON analyses USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access cache' AND tablename = 'url_cache') THEN
    CREATE POLICY "Service role full access cache" ON url_cache USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access context' AND tablename = 'user_context') THEN
    CREATE POLICY "Service role full access context" ON user_context USING (true) WITH CHECK (true);
  END IF;
END $$;
`

async function main() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('Conectando a Supabase...')
    await client.connect()
    console.log('✓ Conectado')

    console.log('Creando tablas...')
    await client.query(schema)
    console.log('✓ Tablas creadas')

    console.log('Creando políticas RLS...')
    await client.query(policies)
    console.log('✓ Políticas creadas')

    // Verify
    const tables = await client.query(`
      SELECT table_name, table_type FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)
    console.log('✓ Tablas en public:', tables.rows.map(r => r.table_name).join(', '))

    await client.end()
    console.log('\n✅ Schema completo!')
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

main()
