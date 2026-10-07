const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function secureTables() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not defined.');
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, '..', 'prisma', 'secure_tables.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = new Client({ connectionString: databaseUrl });
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Applying RLS and security restrictions on tables...');
    await client.query(sql);
    console.log('Successfully secured tables! Checking status...');

    const res = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public'
        AND tablename IN ('projects', 'servers', 'settings', 'request_logs', 'AdminUser')
      ORDER BY tablename;
    `);

    console.log('Table RLS Status:');
    res.rows.forEach(row => {
      console.log(` - ${row.tablename}: RLS ${row.rowsecurity ? 'ENABLED (RESTRICTED & SECURED)' : 'DISABLED'}`);
    });

    const grants = await client.query(`
      SELECT grantee, table_name, privilege_type 
      FROM information_schema.role_table_grants 
      WHERE table_schema = 'public' 
        AND table_name IN ('projects', 'servers', 'settings', 'request_logs', 'AdminUser')
        AND grantee IN ('anon', 'authenticated');
    `);

    if (grants.rows.length === 0) {
      console.log('All public (anon/authenticated) privileges successfully revoked.');
    } else {
      console.log('Remaining public grants:', grants.rows);
    }

    await client.end();
  } catch (err) {
    console.error('Failed to secure tables:', err.message);
    process.exit(1);
  }
}

secureTables();
