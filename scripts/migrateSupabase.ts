import { Client } from 'pg';

async function migrate() {
  console.log('Connecting to Supabase PostgreSQL...');
  
  // Connection config
  const client = new Client({
    host: 'db.kbotzvpasfgpnyurdchg.supabase.co',
    port: 5432,
    user: 'postgres',
    password: 'viva67@8482',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  try {
    await client.connect();
    console.log('Successfully connected to Supabase PostgreSQL database!');

    // SQL Migration script for MINERD periodic evaluation system
    const sql = `
      -- 1. Tabla de información del centro educativo
      CREATE TABLE IF NOT EXISTS public.school_info (
        id text PRIMARY KEY,
        code text NOT NULL,
        name text NOT NULL,
        district text,
        regional text,
        circuit text,
        director text,
        coordinador text,
        academic_year text NOT NULL,
        tanda text,
        phone text,
        logo_base64 text,
        updated_at timestamptz DEFAULT now()
      );

      -- 2. Tabla de maestros / asignaciones
      CREATE TABLE IF NOT EXISTS public.teachers (
        id text PRIMARY KEY,
        name text NOT NULL,
        grade text NOT NULL,
        section text NOT NULL,
        phone text,
        updated_at timestamptz DEFAULT now()
      );

      -- 3. Tabla de estudiantes
      CREATE TABLE IF NOT EXISTS public.students (
        id text PRIMARY KEY,
        full_name text NOT NULL,
        age integer NOT NULL,
        grade text NOT NULL,
        section text NOT NULL,
        gender text,
        birth_date text,
        parent_name text,
        school_code text,
        school_name text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );

      -- 4. Tabla de evaluaciones por estudiante y período
      CREATE TABLE IF NOT EXISTS public.evaluations (
        student_id text PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
        eval_data jsonb NOT NULL,
        updated_at timestamptz DEFAULT now()
      );

      -- 5. Tabla de estado completo y respaldo central
      CREATE TABLE IF NOT EXISTS public.app_state_backup (
        id text PRIMARY KEY,
        school_code text NOT NULL,
        academic_year text NOT NULL,
        backup_data jsonb NOT NULL,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );

      -- 6. Tabla de logs del cron de mantenimiento (Keep-Alive)
      CREATE TABLE IF NOT EXISTS public.cron_maintenance_logs (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        school_code text,
        task text NOT NULL,
        success boolean NOT NULL,
        status integer,
        message text,
        duration_ms integer,
        timestamp timestamptz DEFAULT now()
      );

      -- 7. Tabla genérica para sincronización REST estándar
      CREATE TABLE IF NOT EXISTS public.evaluaciones_inicial (
        id text PRIMARY KEY,
        school_code text NOT NULL,
        academic_year text NOT NULL,
        period text NOT NULL,
        data jsonb NOT NULL,
        updated_at timestamptz DEFAULT now()
      );

      -- 8. Configurar RLS (Row Level Security) para permitir acceso anónimo y autenticado
      ALTER TABLE public.school_info ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.app_state_backup ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.cron_maintenance_logs ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.evaluaciones_inicial ENABLE ROW LEVEL SECURITY;

      -- Crear políticas de acceso permisivas para anon
      DROP POLICY IF EXISTS "Anon school_info access" ON public.school_info;
      CREATE POLICY "Anon school_info access" ON public.school_info FOR ALL USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Anon teachers access" ON public.teachers;
      CREATE POLICY "Anon teachers access" ON public.teachers FOR ALL USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Anon students access" ON public.students;
      CREATE POLICY "Anon students access" ON public.students FOR ALL USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Anon evaluations access" ON public.evaluations;
      CREATE POLICY "Anon evaluations access" ON public.evaluations FOR ALL USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Anon app_state_backup access" ON public.app_state_backup;
      CREATE POLICY "Anon app_state_backup access" ON public.app_state_backup FOR ALL USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Anon cron_maintenance_logs access" ON public.cron_maintenance_logs;
      CREATE POLICY "Anon cron_maintenance_logs access" ON public.cron_maintenance_logs FOR ALL USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Anon evaluaciones_inicial access" ON public.evaluaciones_inicial;
      CREATE POLICY "Anon evaluaciones_inicial access" ON public.evaluaciones_inicial FOR ALL USING (true) WITH CHECK (true);
    `;

    console.log('Running SQL table creations and RLS policies...');
    await client.query(sql);
    console.log('Database schema and policies successfully configured on Supabase!');

  } catch (err: any) {
    console.error('Migration error:', err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
