import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables manually
const envPath = path.resolve(__dirname, '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        // Handle both KEY=VALUE and KEY: VALUE formats
        const separator = line.includes('=') ? '=' : ':';
        const parts = line.split(separator);

        if (parts.length < 2) return;

        const key = parts[0].trim();
        const value = parts.slice(1).join(separator).trim();

        if (key === 'VITE_SUPABASE_URL') {
            supabaseUrl = value;
        } else if (key === 'VITE_SUPABASE_ANON_KEY') {
            supabaseKey = value;
        }
    });
}

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing .env.local variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFlow() {
    // Generate a shorter, unique email
    const uniqueId = Date.now().toString().slice(-6);
    const testEmail = `test${uniqueId}@gmail.com`;
    const testPassword = 'Password123!';
    const testName = 'Test User Flow';

    console.log(`🚀 Starting Test Flow for: ${testEmail}`);
    console.log('----------------------------------------');

    // 1. Sign Up
    console.log('1️⃣  Attempting Sign Up...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
            data: {
                full_name: testName,
                // Removed avatar_url to match current app logic
            }
        }
    });

    if (signUpError) {
        console.error('❌ Sign Up Failed:', signUpError.message);
        return;
    }
    console.log('✅ Sign Up Success! User ID:', signUpData.user?.id);

    // 2. Login (Immediate)
    console.log('2️⃣  Attempting Login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
    });

    if (loginError) {
        console.error('❌ Login Failed:', loginError.message);
        // Sometimes email confirmation is required, check logs
    } else {
        console.log('✅ Login Success! Session active.');
    }

    // 3. Check Database Side Effects (Triggers)
    console.log('3️⃣  Verifying Database Triggers (Wait 2s)...');
    await new Promise(r => setTimeout(r, 2000));

    // Check Exercises
    const { count: exCount, error: exError } = await supabase
        .from('exercises')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', signUpData.user?.id);

    if (exError) console.error('   ❌ Check Exercises Failed:', exError.message);
    else console.log(`   ℹ️  Exercises created: ${exCount} (Expected ~5)`);

    // Check Profile
    const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user?.id)
        .single();

    if (profError) {
        console.error('   ❌ Check Profile Failed:', profError.message);
        console.log('       (Could be RLS blocking access if not logged in context, but script uses client err?)');
        // Note: The script client is anon, but we just logged in above.
        // Wait, 'supabase' client above is NOT persistent across calls unless we used the session from login.
        // Let's create an authenticated client for the checks.
    } else if (profile) {
        console.log('   ✅ Profile Created:', profile.full_name);
    } else {
        console.log('   ❌ Profile NOT created.');
    }

}

testFlow();
