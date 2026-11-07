process.env.TEST_MODE = 'true';
import http from 'http';
import { app } from '../src/index.js';
import { db } from '../src/db/index.js';
import { EmailService } from '../src/services/emailService.js';

let server: http.Server;
const BASE_PORT = 5005;
const BASE_URL = `http://localhost:${BASE_PORT}`;

// Helper function for making HTTP requests
async function makeRequest(
  method: string,
  path: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ status: number; data: any; headers: http.IncomingHttpHeaders; cookies: string[] }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const reqData = body ? JSON.stringify(body) : undefined;
    if (reqData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(reqData).toString();
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          let parsedData: any = rawData;
          try {
            parsedData = JSON.parse(rawData);
          } catch {
            // Keep raw if not json
          }
          const cookies = res.headers['set-cookie'] || [];
          resolve({
            status: res.statusCode || 500,
            data: parsedData,
            headers: res.headers,
            cookies,
          });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (reqData) req.write(reqData);
    req.end();
  });
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`[PASS] ${message}`);
}

async function runTests() {
  console.log('--- STARTING IG ASSISTANT BACKEND AUTH SUITE ---\n');

  // Start test server on port 5005
  server = app.listen(BASE_PORT);
  await new Promise((r) => setTimeout(r, 600));

  try {
    // 1. Health check
    const health = await makeRequest('GET', '/api/health');
    assert(health.status === 200, 'Health endpoint returns 200');
    assert(health.data.database.connected === true, 'Database is connected and healthy');

    // 2. Registration - Invalid email
    const regInvalidEmail = await makeRequest('POST', '/api/auth/register', {
      email: 'not-an-email',
      password: 'Password123!',
      fullName: 'Test Creator',
    });
    assert(regInvalidEmail.status === 400, 'Rejects invalid email format');

    // 3. Registration - Weak password
    const regWeakPass = await makeRequest('POST', '/api/auth/register', {
      email: 'valid@example.com',
      password: 'weak',
      fullName: 'Test Creator',
    });
    assert(regWeakPass.status === 400, 'Rejects weak password (< 8 chars)');

    // 4. Registration - Valid registration
    const testEmail = `creator_${Date.now()}@studio.com`;
    const regSuccess = await makeRequest('POST', '/api/auth/register', {
      email: testEmail,
      password: 'StrongPassword123!',
      fullName: 'Sarah Vance',
      brandName: 'Vance Visuals',
      instagramHandle: '@vancevisuals',
    });
    assert(regSuccess.status === 201, 'Registration returns 201 Created');
    assert(regSuccess.data.requiresVerification === true, 'Requires verification');
    assert(regSuccess.data.user.email === testEmail.toLowerCase(), 'User record has correct email');

    // 5. Registration - Duplicate email check
    const regDuplicate = await makeRequest('POST', '/api/auth/register', {
      email: testEmail,
      password: 'StrongPassword123!',
      fullName: 'Sarah Vance Clone',
    });
    assert(regDuplicate.status === 400, 'Duplicate email registration is blocked');

    // 6. Login before email verification
    const loginUnverified = await makeRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: 'StrongPassword123!',
    });
    assert(loginUnverified.status === 401, 'Unverified account login is blocked');
    assert(loginUnverified.data.unverified === true, 'Response indicates unverified status');

    // 7. Verify email using 6-digit OTP
    const emailLog = EmailService.getLatestTokenForEmail(testEmail, 'verification');
    assert(Boolean(emailLog?.otp), 'Verification OTP was dispatched');

    const verifyOtpRes = await makeRequest('POST', '/api/auth/verify-email', {
      email: testEmail,
      otp: emailLog!.otp,
    });
    assert(verifyOtpRes.status === 200, 'Verification via OTP succeeds');
    assert(verifyOtpRes.data.user.isVerified === true, 'User is now marked as verified');

    // 8. Login with verified account
    const loginSuccess = await makeRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: 'StrongPassword123!',
    });
    assert(loginSuccess.status === 200, 'Login succeeds for verified user');
    assert(Boolean(loginSuccess.data.token), 'JWT token returned in login response');
    const authToken = loginSuccess.data.token;

    // Check HTTP-only cookie
    const hasAuthCookie = loginSuccess.cookies.some((c) => c.includes('ig_token='));
    assert(hasAuthCookie, 'HTTP-only ig_token cookie set');

    // 9. Protected route without auth
    const meNoAuth = await makeRequest('GET', '/api/auth/me');
    assert(meNoAuth.status === 401, 'Protected /api/auth/me rejects unauthenticated request');

    // 10. Protected route with auth token
    const meWithAuth = await makeRequest('GET', '/api/auth/me', undefined, {
      Authorization: `Bearer ${authToken}`,
    });
    assert(meWithAuth.status === 200, 'Protected /api/auth/me succeeds with Bearer token');
    assert(meWithAuth.data.user.fullName === 'Sarah Vance', 'Me returns correct user profile');

    // 11. Update user profile
    const updateProfile = await makeRequest(
      'PUT',
      '/api/auth/profile',
      {
        fullName: 'Sarah Vance, MBA',
        brandName: 'Vance Premium Media',
      },
      {
        Authorization: `Bearer ${authToken}`,
      }
    );
    assert(updateProfile.status === 200, 'Update profile succeeds');
    assert(updateProfile.data.user.fullName === 'Sarah Vance, MBA', 'Profile name updated');
    assert(updateProfile.data.user.brandName === 'Vance Premium Media', 'Brand name updated');

    // 12. Password Reset Flow
    const forgotRes = await makeRequest('POST', '/api/auth/forgot-password', {
      email: testEmail,
    });
    assert(forgotRes.status === 200, 'Forgot password request processed');

    const resetLog = EmailService.getLatestTokenForEmail(testEmail, 'password_reset');
    assert(Boolean(resetLog?.token), 'Reset token was generated and logged');

    const resetRes = await makeRequest('POST', '/api/auth/reset-password', {
      token: resetLog!.token,
      newPassword: 'BrandNewPassword456!',
    });
    assert(resetRes.status === 200, 'Reset password succeeds with new password');

    // 13. Verify old password fails & new password succeeds
    const loginOldPass = await makeRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: 'StrongPassword123!',
    });
    assert(loginOldPass.status === 401, 'Old password no longer works');

    const loginNewPass = await makeRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: 'BrandNewPassword456!',
    });
    assert(loginNewPass.status === 200, 'New password logs in successfully');
    const newAuthToken = loginNewPass.data.token;

    // 14. Logout & session revocation
    const logoutRes = await makeRequest(
      'POST',
      '/api/auth/logout',
      undefined,
      {
        Authorization: `Bearer ${newAuthToken}`,
      }
    );
    assert(logoutRes.status === 200, 'Logout succeeds');

    // Protected route with revoked token should now fail
    const meAfterLogout = await makeRequest('GET', '/api/auth/me', undefined, {
      Authorization: `Bearer ${newAuthToken}`,
    });
    assert(meAfterLogout.status === 401, 'Token is invalid after logout');

    // 15. Google Auth URL endpoint check
    const googleUrlRes = await makeRequest('GET', '/api/auth/google/url');
    assert(
      googleUrlRes.status === 200 || googleUrlRes.status === 503,
      'Google URL endpoint handles configured/unconfigured state gracefully'
    );

    console.log('\n======================================================');
    console.log('ALL 15 AUTHENTICATION TEST SUITES PASSED FLAWLESSLY!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('Test Suite Failed:', error);
    process.exitCode = 1;
  } finally {
    server.close(() => {
      process.exit(process.exitCode || 0);
    });
  }
}

runTests();
