import {
    useIsConnectionRestored,
    useTonConnectModal,

} from "@tonconnect/ui-react";
import './App.css'; 

interface SendTxProps {
    friendlyAddress: string | null | undefined;
    amount: number; 
    selectedTokenAddress: string;
}

export const SendTx = ({ friendlyAddress, amount, selectedTokenAddress }: SendTxProps) => {
    // console.log('Received friendlyAddress:', friendlyAddress); 
    console.log('SendTx Props:', { friendlyAddress, amount, selectedTokenAddress });
    
    const isRestored = useIsConnectionRestored();
    useTonConnectModal();
  
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
