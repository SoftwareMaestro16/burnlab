// BurnJettonPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getNonZeroBalanceTokens, getJettonWalletAddress } from './tonapi';
import './BurnJettonPage.css';
import { BackButton } from './BackButton';
import { useTonConnectUI, CHAIN, toUserFriendlyAddress } from "@tonconnect/ui-react";
import { setJettonAddress, JETTON } from './constants';
import { MainButton } from './MainButton';
import { Address, beginCell } from "@ton/core";
import { SendTransactionRequest } from "@tonconnect/ui-react";

const BurnJettonPage: React.FC = () => {
    const { friendlyAddress } = useParams<{ friendlyAddress: string }>();
    const [tokens, setTokens] = useState<any[]>([]);
    const [showAssets, setShowAssets] = useState(false);
    const [selectedTokenSymbol, setSelectedTokenSymbol] = useState('');
    const [selectedTokenAddress, setSelectedTokenAddress] = useState('');
    const [addressDisplay, setAddressDisplay] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [, setCopied] = useState(false);
    const assetsContainerRef = useRef<HTMLDivElement>(null);
    const [tonConnectUI] = useTonConnectUI();
    const [selectedTokenDecimals, setSelectedTokenDecimals] = useState(0);
    const [balance, setBalance] = useState(0);
    const [selectedTokenImage, setSelectedTokenImage] = useState('https://cdn-icons-png.flaticon.com/512/6834/6834530.png');

    useEffect(() => {
        if (showAssets && friendlyAddress) {
            getNonZeroBalanceTokens(friendlyAddress).then(setTokens).catch(console.error);
        }
    }, [showAssets, friendlyAddress]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (assetsContainerRef.current && !assetsContainerRef.current.contains(event.target as Node)) {
                setShowAssets(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formatBalance = (balance: string, decimals: number) => {
        return (parseFloat(balance) / Math.pow(10, decimals)).toFixed(decimals);
    };

    const formatPercentageChange = (diff: string) => {
        return diff;
    };

    const getChangeClass = (diff: string) => {
        if (diff.startsWith('+')) return 'positive';
        if (diff.startsWith('−') || diff.startsWith('-')) return 'negative';
        return '';
    };

    const handleTokenClick = (token: any) => {
        const isTestnet = tonConnectUI?.wallet?.account?.chain === CHAIN.TESTNET;
        const friendlyAddress = toUserFriendlyAddress(token.address, isTestnet);
        let formattedFriendlyAddress = `${friendlyAddress.substring(0, 4)}...${friendlyAddress.substring(friendlyAddress.length - 4)}`;
        setSelectedTokenSymbol(token.symbol);
        setSelectedTokenAddress(friendlyAddress);
        setAddressDisplay(formattedFriendlyAddress);
        setSelectedTokenDecimals(token.decimals);
        setBalance(parseFloat(formatBalance(token.balance, token.decimals)));
        setSelectedTokenImage(token.image);

        setJettonAddress(token.address);

        setShowAssets(false);
    };

    const handleAddressClick = () => {
        navigator.clipboard.writeText(selectedTokenAddress)
            .then(() => {
                setCopied(true);
                setAddressDisplay('Copied!');
                setTimeout(() => {
                    setCopied(false);
                    setAddressDisplay(`${selectedTokenAddress.substring(0, 4)}...${selectedTokenAddress.substring(selectedTokenAddress.length - 4)}`);
                }, 2000);
            })
            .catch(err => console.error('Failed to copy address:', err));
    };

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const numberValue = parseFloat(value);
        if (!isNaN(numberValue) && numberValue >= 0) {
            setAmount(numberValue);
        }
    };

    const calculateAmount = () => {
        return amount * Math.pow(10, selectedTokenDecimals);
    };

    const isAmountValid = () => {
        return amount <= balance;
    };

    const isButtonDisabled = () => {
        return !amount || !selectedTokenAddress || !isAmountValid();
    };

    const onSendBurnJetton = async () => {
        if (!tonConnectUI?.wallet?.account) {
            console.error('Wallet is not connected');
            return;
        }

        if (!selectedTokenAddress) {
            console.error('Selected token address is not available');
            return;
        }

        if (!friendlyAddress) {
            console.error('Friendly address is not available');
            return;
        }

        const amountInNano = calculateAmount();
        const ownerAddress = Address.parse(friendlyAddress);
        const jwAddress = await getJettonWalletAddress(JETTON.toRawString(), tonConnectUI.wallet.account.address);

        const jettonBurnPayload = beginCell()
            .storeUint(0x595f07bc, 32)
            .storeUint(0, 64)
            .storeCoins(amountInNano)
            .storeAddress(ownerAddress)
            .storeUint(0, 1)
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

        try {
            const result = await tonConnectUI.sendTransaction(tx, {
                modals: 'all',
                notifications: ['error']
            });

            console.log('Transaction sent successfully:', result);
        } catch (e) {
            console.error('Error sending transaction:', e);
        }
    };

    return (
        <div className="container">
            <BackButton />
            <button onClick={() => setShowAssets(!showAssets)} className="toggle-button">
                {showAssets ? 'Hide Assets' : 'Show Assets'}
            </button>
            <div className="main-container">
                <h1 className='main-h1'>Burn Jetton</h1>
            </div>
            <div className="token-image-container-2">
                <img src={selectedTokenImage} alt="Selected Token" className="token-image-22" />
            </div>
            <div className="input-container">
                <label htmlFor="token-symbol"></label>
                <input
                    type="text"
                    id="token-symbol"
                    placeholder="Ticker"
                    value={selectedTokenSymbol}
                    readOnly
                    style={{ fontWeight: 'bold' }}
                />
                <label htmlFor="token-address"></label>
                <input
                    type="text"
                    id="token-address"
                    placeholder="Address"
                    value={addressDisplay}
                    readOnly
                    onClick={handleAddressClick}
                    style={{ fontWeight: 'bold' }}
                />
                <label htmlFor="token-amount"></label>
                <input
                    type="text"
                    id="token-amount"
                    placeholder="Amount"
                    value={amount.toString()}
                    onChange={handleAmountChange}
                    className={`amount-input ${!isAmountValid() && amount ? 'invalid' : ''}`}
                    style={{ fontWeight: 'bold' }}
                />
            </div>
            <MainButton
                text="Send Burn Transaction"
                onClick={onSendBurnJetton}
                color="#FF8C00"
                textColor="#FFFFFF"
                disabled={isButtonDisabled()}
            />
            <div
                ref={assetsContainerRef}
                className={`assets-container ${showAssets ? 'show' : 'hide'}`}
            >
                <ul className="tokens-list">
                    {tokens.map((token, index) => (
                        <li key={index} className="token-item" onClick={() => handleTokenClick(token)}>
                            <img
                                src={token.image}
                                alt={token.name}
                                className="token-image"
                            />
                            <div className="token-details">
                                <div className="token-info">
                                    <div>
                                        <p className="token-symbol">{token.symbol}</p>
                                        <p className="token-balance">{formatBalance(token.balance, token.decimals)}</p>
                                        <p className={`token-change ${getChangeClass(token.diff_24h)}`}>
                                            24h Change: {formatPercentageChange(token.diff_24h)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <hr className="divider" />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default BurnJettonPage;
