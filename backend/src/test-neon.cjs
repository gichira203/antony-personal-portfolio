const { Pool } = require('pg');
const url = process.env.DATABASE_URL;
console.log('Testing Neon connection...', 'url=', url ? url.slice(0, 30) + '...' : 'UNDEFINED');
const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
const start = Date.now();
pool.connect()
  .then(client => {
    console.log('CONNECTED in', Date.now() - start, 'ms via pooler');
    return client.query('SELECT version()').then(r => {
      console.log('Postgres version:', r.rows[0].version.slice(0, 60));
      client.release();
      return pool.end();
    });
  })
  .catch(e => {
    console.error('FAILED after', Date.now() - start, 'ms');
    console.error('code:', e.code);
    console.error('message:', e.message.split('\n').slice(0, 2).join(' | '));
    process.exit(1);
  });
