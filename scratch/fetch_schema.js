import fs from 'fs';

// Manually parse .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const url = env.VITE_SUPABASE_URL + '/rest/v1/';
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing env vars in .env.local", env);
  process.exit(1);
}

async function fetchSchema() {
  try {
    console.log("Fetching schema from:", url);
    const res = await fetch(url, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    fs.writeFileSync('scratch/db_schema.json', JSON.stringify(data, null, 2));
    console.log("Successfully wrote scratch/db_schema.json");
    
    // Print out tables and views
    const tables = Object.keys(data.definitions || {});
    console.log("Tables found:", tables.length);
    console.log(tables);
  } catch (err) {
    console.error("Failed to fetch schema:", err);
  }
}

fetchSchema();
