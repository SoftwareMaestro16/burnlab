// NftCollection.ts
import { useEffect, useState } from 'react';
import { TonClient, Address } from '@ton/ton';
import { getHttpEndpoint } from '@orbs-network/ton-access';

const createTonClient = async () => {
  const endpoint = await getHttpEndpoint({ network: 'testnet' });
  return new TonClient({
    endpoint: endpoint,
    apiKey: '6853ae687c19eb2f2224fd86bf65967a9ff512a434003f3354918e1bee09df0e',
  });
};

const nftCollectionAddress = Address.parse('kQAfzRlySN4omuF6KWonj1NFtqN63jpdaKW5PlvN1fy83U1N');

export function useNftCollectionData() {
  const [itemIndex, setItemIndex] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tonClient = await createTonClient();
        const { stack } = await tonClient.callGetMethod(nftCollectionAddress, 'get_collection_data');
        const nextItemIndex = stack.readBigNumber();
        setItemIndex(nextItemIndex.toString());
      } catch (e) {
        setError('Failed to fetch NFT data');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { itemIndex, loading, error };
}
