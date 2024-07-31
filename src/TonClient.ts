import { TonClient } from '@ton/ton';
import { getHttpEndpoint } from '@orbs-network/ton-access';

export const tonClient = async () => {
    return new TonClient({
      endpoint: await getHttpEndpoint({ network: 'testnet' }),
      apiKey: '6853ae687c19eb2f2224fd86bf65967a9ff512a434003f3354918e1bee09df0e',
    });
  };

