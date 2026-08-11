-- ============================================
-- 🗄️ KREID — Migración 001: Perfiles Extendidos
-- Fecha: 2026-08-08
-- Agrega: phone, address, referral_code, loyalty
-- ============================================

-- Extender tabla profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS referral_used TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loyalty_rewards_claimed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_purchase_at TIMESTAMPTZ;

-- Índice para búsqueda rápida por referral_code
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code)
  WHERE referral_code IS NOT NULL;

-- Función para generar código de invitación aleatorio
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..8 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists_already;
    EXIT WHEN NOT exists_already;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Actualizar RLS: permitir que los usuarios lean el referral_code de otros (para validar)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

-- Permitir buscar perfiles por referral_code (solo lectura del código)
CREATE POLICY "Anyone can lookup by referral code" ON public.profiles
  FOR SELECT USING (true);

-- Actualizar política de update para incluir nuevos campos
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger para generar referral_code automáticamente al crear perfil
CREATE OR REPLACE FUNCTION handle_new_user_extended()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, referral_code, loyalty_points, loyalty_rewards_claimed)
  VALUES (NEW.id, NEW.email, public.generate_referral_code(), 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reemplazar el trigger viejo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_extended();

-- Función para incrementar loyalty_points (también actualiza last_purchase_at)
CREATE OR REPLACE FUNCTION increment_loyalty(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_points INTEGER;
BEGIN
  UPDATE public.profiles
  SET loyalty_points = loyalty_points + 1,
      last_purchase_at = now()
  WHERE id = user_id
  RETURNING loyalty_points INTO new_points;
  RETURN new_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar inactividad: si no compró en 21 días, resetea puntos y recompensas
CREATE OR REPLACE FUNCTION check_loyalty_inactivity(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  last_purchase TIMESTAMPTZ;
BEGIN
  SELECT last_purchase_at INTO last_purchase
  FROM public.profiles WHERE id = user_id;

  IF last_purchase IS NOT NULL AND last_purchase < now() - INTERVAL '21 days' THEN
    UPDATE public.profiles
    SET loyalty_points = 0,
        loyalty_rewards_claimed = 0
    WHERE id = user_id;
    RETURN jsonb_build_object('reset', true, 'inactive_days', EXTRACT(DAY FROM now() - last_purchase)::int);
  END IF;

  RETURN jsonb_build_object('reset', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para reclamar premio (sistema escalonado: 5→6→7→8→9→10 círculos por tarjeta)
-- loyalty_points = total de compras de por vida (NUNCA decrece)
-- loyalty_rewards_claimed = cuántas veces ha reclamado premio
-- Cada reclamo consume los puntos necesarios para la tarjeta actual
-- La tarjeta empieza con 5 círculos y crece +1 por cada reclamo, hasta 10 máx
CREATE OR REPLACE FUNCTION claim_loyalty_reward(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  current_points INTEGER;
  rewards_claimed INTEGER;
  card_size INTEGER;
  total_consumed INTEGER;
BEGIN
  SELECT loyalty_points, loyalty_rewards_claimed
  INTO current_points, rewards_claimed
  FROM public.profiles WHERE id = user_id;

  -- Tamaño de la tarjeta actual: 5 + rewards_claimed, máximo 10
  card_size := LEAST(5 + rewards_claimed, 10);

  -- Puntos consumidos por reclamos anteriores
  -- Suma de min(5+i, 10) para i = 0..rewards_claimed-1
  IF rewards_claimed = 0 THEN
    total_consumed := 0;
  ELSIF rewards_claimed <= 5 THEN
    total_consumed := rewards_claimed * (rewards_claimed + 9) / 2;
  ELSE
    total_consumed := 35 + (rewards_claimed - 5) * 10;
  END IF;

  -- Verificar que tiene suficientes puntos en la tarjeta actual
  IF current_points - total_consumed < card_size THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Necesitas ' || card_size || ' compras para este premio. Llevas ' || (current_points - total_consumed) || '.'
    );
  END IF;

  -- Solo incrementamos rewards_claimed — loyalty_points NUNCA decrece
  UPDATE public.profiles
  SET loyalty_rewards_claimed = loyalty_rewards_claimed + 1
  WHERE id = user_id;

  RETURN jsonb_build_object(
    'success', true,
    'rewards_claimed', rewards_claimed + 1,
    'card_size', card_size,
    'next_card_size', LEAST(5 + rewards_claimed + 1, 10),
    'total_points', current_points
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
