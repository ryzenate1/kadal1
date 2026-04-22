import { createHash, randomInt } from 'crypto';

type OtpDispatchResult = {
  dispatched: boolean;
  provider: 'self-hosted' | 'msg91' | 'twilio' | 'none';
  errorMessage?: string;
};

type OtpVerifyResult = {
  verified: boolean;
  provider: 'twilio' | 'none';
  errorMessage?: string;
};

/**
 * Returns the pepper used to hash OTP codes at rest.
 * Throws at call-time if no secret env var is configured,
 * rather than silently falling back to a guessable default.
 */
function getOtpPepper(): string {
  const pepper =
    process.env.OTP_HASH_SECRET ??
    process.env.APP_TOKEN_SECRET;
  if (!pepper || pepper.trim().length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[otpService] OTP_HASH_SECRET is not configured. Falling back to an insecure development-only secret.'
      );
      return 'dev-only-otp-secret-change-me';
    }

    throw new Error(
      '[otpService] OTP_HASH_SECRET environment variable is required but not set. ' +
      'Set OTP_HASH_SECRET (or APP_TOKEN_SECRET as a fallback) before starting the server.'
    );
  }
  return pepper.trim();
}

export function generateOtp(): string {
  return randomInt(100000, 1000000).toString();
}

export function hashOtp(phoneNumber: string, otp: string): string {
  return createHash('sha256')
    .update(`${phoneNumber}:${otp}:${getOtpPepper()}`)
    .digest('hex');
}

function firstDefinedEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function normalizeIndianPhoneForE164(phoneNumber: string): string {
  const digits = (phoneNumber || '').replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  return `+${digits}`;
}

async function sendOtpViaSelfHostedGateway(phoneNumber: string, otp: string): Promise<OtpDispatchResult> {
  const gatewayUrl = firstDefinedEnv('OTP_SMS_GATEWAY_URL', 'SELF_HOSTED_SMS_URL');
  const gatewayToken = firstDefinedEnv('OTP_SMS_GATEWAY_TOKEN', 'SELF_HOSTED_SMS_TOKEN');
  const sender = firstDefinedEnv('OTP_SMS_SENDER', 'SELF_HOSTED_SMS_SENDER', 'KADAL');

  if (!gatewayUrl) {
    return {
      dispatched: false,
      provider: 'self-hosted',
      errorMessage:
        'Self-hosted SMS gateway is not configured. Set OTP_SMS_GATEWAY_URL (or SELF_HOSTED_SMS_URL).',
    };
  }

  const message = `Your OTP for Kadal Thunai is ${otp}. It is valid for 10 minutes.`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (gatewayToken) {
    headers.Authorization = `Bearer ${gatewayToken}`;
    headers['x-api-key'] = gatewayToken;
  }

  const response = await fetch(gatewayUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      phoneNumber,
      otp,
      message,
      sender,
      channel: 'sms',
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    return {
      dispatched: false,
      provider: 'self-hosted',
      errorMessage: `Self-hosted SMS gateway failed: ${payload || `HTTP ${response.status}`}`,
    };
  }

  return {
    dispatched: true,
    provider: 'self-hosted',
  };
}

async function sendOtpViaMsg91(phoneNumber: string, otp: string): Promise<OtpDispatchResult> {
  const authKey = firstDefinedEnv('MSG91_AUTH_KEY', 'MSG91_AUTHKEY', 'MSG91_KEY');
  const senderId = firstDefinedEnv('MSG91_SENDER_ID', 'MSG91_SENDER');
  const templateId = firstDefinedEnv('MSG91_TEMPLATE_ID', 'MSG91_FLOW_ID');

  if (!authKey || !senderId || !templateId) {
    return {
      dispatched: false,
      provider: 'msg91',
      errorMessage:
        'MSG91 env variables are missing. Set MSG91_AUTH_KEY, MSG91_SENDER_ID, and MSG91_TEMPLATE_ID.',
    };
  }

  const response = await fetch('https://control.msg91.com/api/v5/flow/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authkey: authKey,
    },
    body: JSON.stringify({
      template_id: templateId,
      sender: senderId,
      short_url: 0,
      recipients: [
        {
          mobiles: `91${phoneNumber}`,
          otp,
        },
      ],
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    return {
      dispatched: false,
      provider: 'msg91',
      errorMessage: `MSG91 send failed: ${payload}`,
    };
  }

  return {
    dispatched: true,
    provider: 'msg91',
  };
}

async function sendOtpViaTwilioVerify(phoneNumber: string): Promise<OtpDispatchResult> {
  const accountSid = firstDefinedEnv('TWILIO_ACCOUNT_SID');
  const authToken = firstDefinedEnv('TWILIO_AUTH_TOKEN', 'TWILIO_API_KEY');
  const serviceSid = firstDefinedEnv('TWILIO_VERIFY_SERVICE_SID', 'TWILIO_SERVICE_SID');

  if (!accountSid || !authToken || !serviceSid) {
    return {
      dispatched: false,
      provider: 'twilio',
      errorMessage:
        'Twilio Verify env variables are missing. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID.',
    };
  }

  const to = normalizeIndianPhoneForE164(phoneNumber);
  const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      To: to,
      Channel: 'sms',
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    return {
      dispatched: false,
      provider: 'twilio',
      errorMessage: `Twilio Verify send failed: ${payload || `HTTP ${response.status}`}`,
    };
  }

  return {
    dispatched: true,
    provider: 'twilio',
  };
}

export async function verifyOtpViaTwilio(phoneNumber: string, otp: string): Promise<OtpVerifyResult> {
  const accountSid = firstDefinedEnv('TWILIO_ACCOUNT_SID');
  const authToken = firstDefinedEnv('TWILIO_AUTH_TOKEN', 'TWILIO_API_KEY');
  const serviceSid = firstDefinedEnv('TWILIO_VERIFY_SERVICE_SID', 'TWILIO_SERVICE_SID');

  if (!accountSid || !authToken || !serviceSid) {
    return {
      verified: false,
      provider: 'twilio',
      errorMessage:
        'Twilio Verify env variables are missing. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID.',
    };
  }

  const to = normalizeIndianPhoneForE164(phoneNumber);
  const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      To: to,
      Code: otp,
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    return {
      verified: false,
      provider: 'twilio',
      errorMessage: `Twilio Verify check failed: ${payload || `HTTP ${response.status}`}`,
    };
  }

  const data = (await response.json()) as { status?: string };
  return {
    verified: data.status === 'approved',
    provider: 'twilio',
  };
}

export function getOtpProvider(): string {
  return (process.env.OTP_PROVIDER || 'msg91').toLowerCase();
}

export async function dispatchOtp(phoneNumber: string, otp: string): Promise<OtpDispatchResult> {
  const provider = getOtpProvider();

  if (provider === 'twilio' || provider === 'twilio-verify') {
    return sendOtpViaTwilioVerify(phoneNumber);
  }

  if (provider === 'self' || provider === 'self-hosted' || provider === 'local-gateway') {
    return sendOtpViaSelfHostedGateway(phoneNumber, otp);
  }

  if (provider === 'msg91') {
    return sendOtpViaMsg91(phoneNumber, otp);
  }

  return {
    dispatched: false,
    provider: 'none',
    errorMessage: `Unsupported OTP provider: ${provider}`,
  };
}
