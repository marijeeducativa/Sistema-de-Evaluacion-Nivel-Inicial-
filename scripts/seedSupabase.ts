import { Client } from 'pg';
import { INITIAL_SCHOOL_INFO, INITIAL_TEACHERS, INITIAL_STUDENTS, generateInitialEvaluations } from '../src/data/initialData';

async function seed() {
  console.log('Connecting to Supabase...');
  const client = new Client({
    host: 'db.kbotzvpasfgpnyurdchg.supabase.co',
    port: 5432,
    user: 'postgres',
    password: 'viva67@8482',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected! Inserting app state and evaluations in batch...');

    const evals = generateInitialEvaluations(INITIAL_STUDENTS);

    const fullState = {
      schoolInfo: INITIAL_SCHOOL_INFO,
      teachers: INITIAL_TEACHERS,
      students: INITIAL_STUDENTS,
      evaluations: evals,
      currentPeriod: 'P1',
      selectedGrade: 'Preprimario',
      selectedSection: 'A'
    };

    // Fast batch insert into app_state_backup and evaluaciones_inicial
    await client.query(`
      INSERT INTO public.app_state_backup (id, school_code, academic_year, backup_data)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET
        backup_data = EXCLUDED.backup_data,
        updated_at = now();
    `, [
      `backup-${INITIAL_SCHOOL_INFO.code}-${INITIAL_SCHOOL_INFO.academicYear}`,
      INITIAL_SCHOOL_INFO.code,
      INITIAL_SCHOOL_INFO.academicYear,
      JSON.stringify(fullState)
    ]);

    await client.query(`
      INSERT INTO public.evaluaciones_inicial (id, school_code, academic_year, period, data)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = now();
    `, [
      `eval-${INITIAL_SCHOOL_INFO.code}-P1`,
      INITIAL_SCHOOL_INFO.code,
      INITIAL_SCHOOL_INFO.academicYear,
      'P1',
      JSON.stringify(fullState)
    ]);

    console.log('Batch sync completed successfully!');
  } catch (err: any) {
    console.error('Error seeding:', err.message || err);
  } finally {
    await client.end();
  }
}

seed();
