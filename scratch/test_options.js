import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    env[key] = value.trim();
  }
});

const url = env.VITE_SUPABASE_URL + '/rest/v1/profiles';
const key = env.VITE_SUPABASE_ANON_KEY;

async function testOptions() {
  try {
    const res = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    console.log("Status:", res.status);
    const body = await res.text();
    console.log("Response headers:", [...res.headers.entries()]);
    console.log("Body:", body.substring(0, 1000));
  } catch (err) {
    console.error("Error:", err);
  }
}

testOptions();
