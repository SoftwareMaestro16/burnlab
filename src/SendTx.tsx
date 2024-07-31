import {
    SendTransactionRequest,
    useIsConnectionRestored,
    useTonConnectModal,
    useTonConnectUI,
    useTonWallet
} from "@tonconnect/ui-react";
import { Address, beginCell, Cell, toNano } from "@ton/core";
import { getJettonWalletAddress, waitForTx } from "./tonapi";
import { useState } from "react";
import { useNftCollectionData } from './Nft.ts';
import './App.css'; 
import { JETTON } from "./constants.ts";

interface SendTxProps {
    friendlyAddress: string | null | undefined;
    amount: number; 
    selectedTokenAddress: string;
}

export const SendTx = ({ friendlyAddress, amount, selectedTokenAddress }: SendTxProps) => {
    // console.log('Received friendlyAddress:', friendlyAddress); 
    console.log('SendTx Props:', { friendlyAddress, amount, selectedTokenAddress });
    
    const wallet = useTonWallet();
    const isRestored = useIsConnectionRestored();
    const { open } = useTonConnectModal();
    const [tonConnectUi] = useTonConnectUI();
    const [, setTxInProgress] = useState(false);
    const { itemIndex } = useNftCollectionData();

    const onSendBurnJetton = async () => {
        
        if (!wallet) {
            console.error('Wallet is not connected');
            return;
        }

        if (!itemIndex) {
            console.error('Item index not available');
            return;
        }

        if (!friendlyAddress) {
            console.error('Friendly address is not available');
            return;
        }

        setTxInProgress(true);

        try {
            const ownerAddress = Address.parse(friendlyAddress);

            const jwAddress = await getJettonWalletAddress(JETTON.toRawString(), wallet.account.address);

            const jettonBurnPayload = beginCell()
                .storeUint(0x595f07bc, 32)                // jetton burn op code
                .storeUint(0, 64)                         // query_id:uint64
                .storeCoins(amount)    // Convert amount to correct precision
                .storeAddress(ownerAddress)               // response_destination:MsgAddress
                .storeUint(0, 1)                          // custom_payload:(Maybe ^Cell)
                .endCell().toBoc().toString('base64');
                
            console.log('Jetton Burn Payload:', jettonBurnPayload);
      
            const tx: SendTransactionRequest = {
                validUntil: Math.round(Date.now() / 1000) + 60 * 5,
                messages: [
                    {
                        address: jwAddress,
                        amount: '30000000',   
                        payload: jettonBurnPayload             
                    }
                ]
            };

            const result = await tonConnectUi.sendTransaction(tx, {
                modals: 'all',
                notifications: ['error']
            });

            console.log('Transaction sent successfully:', result);

        } catch (e) {
            console.error('Error sending transaction:', e);
        } finally {
            setTxInProgress(false);
        }
    };


    const onSendBurnNft = async () => {
        if (!wallet) {
            console.error('Wallet is not connected');
            return;
        }
    
        if (!itemIndex) {
            console.error('Item index not available');
            return;
        }
        
        if (!friendlyAddress) {
            console.error('Friendly address is not available');
            return;
        }
    
        setTxInProgress(true);
    
        try {
            const ownerAddress = Address.parse(friendlyAddress);
            const nftAddress = "UQBmIDiHFKqWWN4IFYa4BMyYQ1a8UiBxzJlRvsAEsnTo5wBo";

            const nftBurnPayload = beginCell()
                .storeUint(0x5fcc3d14, 32)               // NFT transfer op code 0x5fcc3d14
                .storeUint(0, 64)                        // query_id:uint64
                .storeAddress(Address.parse("EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c")) // new_owner:MsgAddress
                .storeAddress(ownerAddress)       // response_destination:MsgAddress
                .storeUint(0, 1)                         // custom_payload:(Maybe ^Cell)
                .storeCoins(toNano(0.000000001))       // forward_amount:(VarUInteger 16)
                .storeUint(0,1)                          // forward_payload:(Either Cell ^Cell)
                .endCell().toBoc().toString('base64');
        
    
            const tx: SendTransactionRequest = {
                validUntil: Math.round(Date.now() / 1000) + 60 * 5,
                messages: [
                    {
                        address: nftAddress,
                        amount: '30000000',   
                        payload: nftBurnPayload             
                    }
                ]
            };
    
            const result = await tonConnectUi.sendTransaction(tx, {
                modals: 'all',
                notifications: ['error']
            });
    
            console.log('Transaction sent successfully:', result);
    
        } catch (e) {
            console.error('Error sending transaction:', e);
        } finally {
            setTxInProgress(false);
        }
    };
    
    const onSendBurnSbtNft = async () => {
        if (!wallet) {
            console.error('Wallet is not connected');
            return;
        }
    
        if (!itemIndex) {
            console.error('Item index not available');
            return;
        }
        
        if (!friendlyAddress) {
            console.error('Friendly address is not available');
            return;
        }
    
        setTxInProgress(true);
    
        try {
            const ownerAddress = Address.parse(friendlyAddress);
            const sbtNftAddress = "EQCkhmSwRmxkDGM3NDZJNzUCa2gJgYjZWbKuD_K_lmNHoZZI";

            const sbtNftBurnPayload = beginCell()
                .storeUint(0x1f04537a, 32)  
                .storeUint(1, 64)
                .endCell().toBoc().toString('base64');
    
            const tx: SendTransactionRequest = {
                validUntil: Math.round(Date.now() / 1000) + 60 * 5,
                messages: [
                    {
                        address: sbtNftAddress,
                        amount: '30000000',   
                        payload: sbtNftBurnPayload             
                    }
                ]
            };
    
            const result = await tonConnectUi.sendTransaction(tx, {
                modals: 'all',
                notifications: ['error']
            });
    
            console.log('Transaction sent successfully:', result);
    
        } catch (e) {
            console.error('Error sending transaction:', e);
        } finally {
            setTxInProgress(false);
        }
    };

    if (!isRestored) {
        return ' ';
    }

    // if (!wallet) {
    //     return <button onClick={open}>Connect Wallet</button>;
    // }

    return (
        <div style={{ position: 'relative', height: '100vh' }}>
            {/* <div className="button-container">
            <button className="button-1" onClick={onSendBurnJetton}>Burn Jetton</button>
            <button className="button-2" onClick={onSendBurnNft}>Burn NFT</button>
            <button className="button-3" onClick={onSendBurnSbtNft}>Burn SBT</button>
            </div> */}
        </div>
    );
};
