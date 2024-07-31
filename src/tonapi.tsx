import {Api, HttpClient} from "@ton-api/client";

const httpClient = new HttpClient({
    baseUrl: 'https://tonapi.io',
    baseApiParams: {
        headers: {
            Authorization: `Bearer AEXJI3CLA76FXGQAAAAIC6OMGVN22R6SCKVNVRN7WMPGTVZI2M6LMAYXTOI6PDFNB2BLNII`,
            'Content-type': 'application/json'
        }
    }
});

export const tonapi = new Api(httpClient);


export async function waitForTx(msgHash: string, attempt = 0) {
    try {
        return await tonapi.blockchain.getBlockchainTransactionByMessageHash(msgHash);
    } catch (e) {
        if (attempt >= 20) {
            throw e;
        }

        await new Promise(resolve => setTimeout(resolve, 1500));

        return waitForTx(msgHash, attempt + 1);
    }
}

export async function getJettonWalletAddress(jettonMasterAddress: string, walletAddress: string) {
    console.log('Fetching jetton wallet address with:', { jettonMasterAddress, walletAddress });
    try {
        const result = await tonapi.blockchain.execGetMethodForBlockchainAccount(jettonMasterAddress, 'get_wallet_address', {
            args: [walletAddress]
        });
        console.log('Jetton wallet address result:', result);
        return result.decoded.jetton_wallet_address;
    } catch (e) {
        console.error('Error fetching jetton wallet address:', e);
        throw e;
    }
}

export async function getNonZeroBalanceTokens(userAddress: string) {
    try {
        const response = await fetch(`https://tonapi.io/v2/accounts/${userAddress}/jettons?currencies=usd`, {
            headers: {
                Authorization: `Bearer AEXJI3CLA76FXGQAAAAIC6OMGVN22R6SCKVNVRN7WMPGTVZI2M6LMAYXTOI6PDFNB2BLNII`,
                'Content-type': 'application/json'
            }
        });

        const data = await response.json();
        const tokens = data.balances
            .filter((item: any) => parseFloat(item.balance) > 0)
            .map((item: any) => ({
                address: item.jetton.address, // Адрес токена
                name: item.jetton.name,
                symbol: item.jetton.symbol,
                balance: item.balance,
                image: item.jetton.image,
                decimals: item.jetton.decimals,
                diff_24h: item.price.diff_24h ? item.price.diff_24h.USD : 'N/A', // Изменение за 24 часа
                verification: item.jetton.verification === 'none' ? 'Not Verified' : 'Verified' // Парсинг verification
            }));

        return tokens;
    } catch (error) {
        console.error('Error fetching tokens:', error);
        throw error;
    }
}

export async function getNFTs(userAddress: string) {
    try {
        const response = await fetch(`https://tonapi.io/v2/accounts/${userAddress}/nfts?limit=1000&offset=0&indirect_ownership=false`, {
            headers: {
                Authorization: `Bearer AEXJI3CLA76FXGQAAAAIC6OMGVN22R6SCKVNVRN7WMPGTVZI2M6LMAYXTOI6PDFNB2BLNII`,
                'Content-type': 'application/json'
            }
        });

        const data = await response.json();
        const nfts = data.nft_items.map((item: any) => ({
            address: item.address,
            name: item.metadata.name,
            image: item.previews.find((preview: any) => preview.resolution === '1500x1500')?.url || '',
        }));

        return nfts;
    } catch (error) {
        console.error('Error fetching NFTs:', error);
        throw error;
    }
}

export async function getNFTType(nftAddress: string): Promise<string> {
    try {
        const response = await fetch(`https://tonapi.io/v2/accounts/${nftAddress}`, {
            headers: {
                Authorization: 'Bearer AEXJI3CLA76FXGQAAAAIC6OMGVN22R6SCKVNVRN7WMPGTVZI2M6LMAYXTOI6PDFNB2BLNII',
                'Content-type': 'application/json'
            }
        });

        const data = await response.json();
        if (data.interfaces && data.interfaces.includes('sbt')) {
            return 'SBT';
        }
        return 'NFT';
    } catch (error) {
        console.error('Error fetching NFT type:', error);
        throw error;
    }
}