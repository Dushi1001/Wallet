import fetch from 'node-fetch';

// Type definitions
interface SunbaseAuthResponse {
  token: string;
  expires_in: number;
}

interface SunbaseInitiateResponse {
  kyc_id: string;
  verification_url: string;
}

interface SunbaseStatusResponse {
  status: 'pending' | 'verified' | 'rejected';
  verification_details?: {
    document_verified: boolean;
    face_match: boolean;
    liveness_check: boolean;
    address_verified: boolean;
  };
}

interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface KycWebhookData {
  kyc_id: string;
  status: 'pending' | 'verified' | 'rejected';
  verification_details?: {
    document_verified: boolean;
    face_match: boolean;
    liveness_check: boolean;
    address_verified: boolean;
  };
}

// Helper for API authentication
export async function getAuthToken(): Promise<string> {
  const SUNBASE_API_URL = process.env.SUNBASE_API_URL;
  const SUNBASE_API_KEY = process.env.SUNBASE_API_KEY;
  const SUNBASE_API_SECRET = process.env.SUNBASE_API_SECRET;
  
  if (!SUNBASE_API_URL || !SUNBASE_API_KEY || !SUNBASE_API_SECRET) {
    throw new Error('Sunbase API configuration missing. Check environment variables.');
  }

  const response = await fetch(`${SUNBASE_API_URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey: SUNBASE_API_KEY,
      secret: SUNBASE_API_SECRET
    })
  });
  
  if (!response.ok) {
    throw new Error(`Sunbase authentication failed: ${response.statusText}`);
  }
  
  const data = await response.json() as SunbaseAuthResponse;
  return data.token;
}

// Initialize KYC verification process
export async function initiateKyc(userId: number, userDetails: UserDetails): Promise<{kycId: string, verificationUrl: string}> {
  try {
    const SUNBASE_API_URL = process.env.SUNBASE_API_URL;
    const token = await getAuthToken();
    
    const response = await fetch(`${SUNBASE_API_URL}/kyc/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        external_id: userId.toString(),
        first_name: userDetails.firstName,
        last_name: userDetails.lastName,
        email: userDetails.email,
        phone: userDetails.phone,
        redirect_url: process.env.KYC_REDIRECT_URL || `${process.env.APP_URL || 'https://your-app.netlify.app'}/kyc-complete`
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to initiate KYC: ${response.statusText}`);
    }
    
    const data = await response.json() as SunbaseInitiateResponse;
    return {
      kycId: data.kyc_id,
      verificationUrl: data.verification_url
    };
  } catch (error) {
    console.error('KYC initiation error:', error);
    throw error;
  }
}

// Check KYC verification status
export async function checkKycStatus(kycId: string): Promise<{status: string, verificationDetails?: any}> {
  try {
    const SUNBASE_API_URL = process.env.SUNBASE_API_URL;
    const token = await getAuthToken();
    
    const response = await fetch(`${SUNBASE_API_URL}/kyc/status/${kycId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to check KYC status: ${response.statusText}`);
    }
    
    const data = await response.json() as SunbaseStatusResponse;
    return {
      status: data.status,
      verificationDetails: data.verification_details
    };
  } catch (error) {
    console.error('KYC status check error:', error);
    throw error;
  }
}

// Webhook handler for KYC status updates
export function handleKycWebhook(webhookData: KycWebhookData): {kycId: string, status: string, verificationDetails?: any} {
  // Process webhook data from Sunbase
  const { kyc_id, status, verification_details } = webhookData;
  
  // Return processed data to be stored in database
  return {
    kycId: kyc_id,
    status,
    verificationDetails: verification_details
  };
}

// Verify webhook signature (implementation depends on Sunbase's webhook security)
export function verifyWebhookSignature(headers: Record<string, string>, body: any): boolean {
  // This would need to be implemented based on Sunbase's webhook security model
  // For example, checking a signature header against a HMAC of the body
  
  // For now, return true as a placeholder
  // In production, you would verify the signature to prevent webhook spoofing
  return true;
}