import { apiClient, setAuthToken } from './client';

export interface WorldIdAuthResult {
  token: string;
  userId: string;
  worldIdHash: string;
  displayName: string;
  role: string;
  profile: any;
}

export const isWorldApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).MiniKit?.isInstalled?.());
};

/**
 * Tự động xác thực danh tính:
 * - Nếu ở World App: Gọi MiniKit World ID Proof of Personhood
 * - Nếu ở Trình duyệt Local: Gọi Local Dev Login để lấy token và đồ thật từ DB
 */
export const authenticateUser = async (): Promise<WorldIdAuthResult | null> => {
  try {
    if (isWorldApp()) {
      console.log('🌐 Detected World App Environment. Requesting World ID verification...');
      const miniKit = (window as any).MiniKit;
      
      const verifyResponse = await miniKit.commandsAsync.verify({
        action: 'world-hero-login',
        signal: 'login_' + Date.now(),
        verification_level: 'orb',
      });

      if (verifyResponse?.finalPayload) {
        const payload = verifyResponse.finalPayload;
        const res = await apiClient.post('/auth/world-id', {
          nullifier_hash: payload.nullifier_hash,
          merkle_root: payload.merkle_root,
          proof: payload.proof,
          verification_level: payload.verification_level || 'orb',
          action: 'world-hero-login',
        });

        if (res.data?.token) {
          setAuthToken(res.data.token);
          return res.data;
        }
      }
      // World App verification cancelled or failed; do not fallback to local login
      return null;
    }

    // Local / Dev Browser Environment Fallback
    if (process.env.NODE_ENV !== 'production') {
      console.log('💻 Local Browser Environment. Initiating Local Session with DB...');
      const localRes = await apiClient.post('/auth/local-login');
      if (localRes.data?.token) {
        setAuthToken(localRes.data.token);
        return localRes.data;
      }
    }

    return null;
  } catch (err) {
    console.warn('⚠️ Authentication encountered an issue:', err);
    return null;
  }
};

/**
 * Gửi lệnh thanh toán WLD qua MiniKit hoặc Local fallback
 */
export const payWithWld = async (params: {
  featureKey: string;
  amountWld: number;
  description: string;
}): Promise<any> => {
  const reference = 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

  if (isWorldApp()) {
    const miniKit = (window as any).MiniKit;
    const payRes = await miniKit.commandsAsync.pay({
      reference,
      to: process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '0x4983050cD9aB56B52d2f7902d1f728c308fFe1De',
      tokens: [
        {
          symbol: 'WLD',
          token_amount: params.amountWld.toString(),
        },
      ],
      description: params.description,
    });

    const txId = payRes?.finalPayload?.transaction_id || reference;
    const verifyRes = await apiClient.post('/monetization/verify-payment', {
      reference,
      transaction_id: txId,
      feature_key: params.featureKey,
      amount_wld: params.amountWld,
    });

    return verifyRes.data;
  }

  // Local Browser Environment: Call verify-payment directly for testing
  const verifyRes = await apiClient.post('/monetization/verify-payment', {
    reference,
    transaction_id: 'local_tx_' + Date.now(),
    feature_key: params.featureKey,
    amount_wld: params.amountWld,
  });

  return verifyRes.data;
};
