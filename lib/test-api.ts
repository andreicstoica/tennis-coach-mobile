import { authClient } from './auth-client';

export const testDirectAPI = async () => {
    try {
        console.log('=== COMPREHENSIVE DIRECT API TEST ===');

        const session = await authClient.getSession();
        if (!session?.data?.session?.token) {
            console.log('No session token for API test');
            return;
        }

        const token = session.data.session.token;
        const sessionId = session.data.session.id;
        const userId = session.data.user.id;

        console.log('Session Info:');
        console.log('  Token:', token.substring(0, 15) + '...');
        console.log('  Session ID:', sessionId);
        console.log('  User ID:', userId);
        console.log('  User Agent:', navigator.userAgent);

        // Test 1: Basic cookie format
        console.log('\n🧪 Test 1: Basic __Secure- cookie');
        await testAPICall(
            `__Secure-better-auth.session_token=${token}`,
            {}
        );

        // Test 2: Try without the __Secure- prefix (for testing)
        console.log('\n🧪 Test 2: Without __Secure- prefix');
        await testAPICall(
            `better-auth.session_token=${token}`,
            {}
        );

        // Test 3: Add User-Agent header to match web
        console.log('\n🧪 Test 3: With web-like User-Agent');
        await testAPICall(
            `__Secure-better-auth.session_token=${token}`,
            {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            }
        );

        // Test 4: Add Origin header
        console.log('\n🧪 Test 4: With Origin header');
        await testAPICall(
            `__Secure-better-auth.session_token=${token}`,
            {
                'Origin': 'https://courtly-xi.vercel.app',
            }
        );

        // Test 5: Try with session ID as additional cookie
        console.log('\n🧪 Test 5: With additional session cookie');
        await testAPICall(
            `__Secure-better-auth.session_token=${token}; session=${sessionId}`,
            {}
        );

        // Test 6: Check if there's a different endpoint that works
        console.log('\n🧪 Test 6: Test auth endpoint instead');
        try {
            const authResponse = await fetch('https://courtly-xi.vercel.app/api/trpc/auth.getUser', {
                method: 'GET',
                headers: {
                    'Cookie': `__Secure-better-auth.session_token=${token}`,
                },
            });
            console.log('  Auth endpoint status:', authResponse.status);
            if (authResponse.status === 200) {
                const authText = await authResponse.text();
                console.log('  Auth response:', authText.substring(0, 100) + '...');
            }
        } catch (error) {
            console.log('  Auth endpoint error:', error.message);
        }

    } catch (error) {
        console.error('Direct API test error:', error);
    }
    console.log('=== END COMPREHENSIVE TEST ===');
};

async function testAPICall(cookieHeader: string, additionalHeaders: Record<string, string>) {
    try {
        const headers = {
            'Cookie': cookieHeader,
            ...additionalHeaders,
        };

        const response = await fetch('https://courtly-xi.vercel.app/api/trpc/practiceSession.list', {
            method: 'GET',
            headers,
        });

        console.log(`  Status: ${response.status}`);

        if (response.status === 200) {
            console.log('  ✅ SUCCESS!');
            const responseText = await response.text();
            console.log('  Response preview:', responseText.substring(0, 100) + '...');
            return true;
        } else {
            const responseText = await response.text();
            console.log(`  ❌ Failed: ${responseText.substring(0, 150)}...`);
        }
    } catch (error) {
        console.log(`  💥 Error: ${error.message}`);
    }
    return false;
}