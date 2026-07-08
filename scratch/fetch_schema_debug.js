import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
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

console.log("URL:", url, "Length:", url.length);
console.log("KEY:", key ? (key.substring(0, 10) + "...") : "None", "Length:", key ? key.length : 0);

async function fetchSchema() {
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    console.log("Status:", res.status);
    const body = await res.text();
    console.log("Body:", body.substring(0, 500));
  } catch (err) {
    console.error("Error:", err);
  }
}

fetchSchema();
