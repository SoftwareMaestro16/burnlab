import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getNFTs, getNFTType } from './tonapi'; 
import './BurnNftPage.css';
import { BackButton } from './BackButton';
import { useTonConnectUI, CHAIN, toUserFriendlyAddress } from "@tonconnect/ui-react";
import { MainButton } from './MainButton';
import { Address, beginCell, toNano } from "@ton/core";
import { SendTransactionRequest } from "@tonconnect/ui-react";

const CACHE_TIMEOUT = 3 * 60 * 1000; // 3 minutes in milliseconds

const BurnNftPage: React.FC = () => {
    const { friendlyAddress } = useParams<{ friendlyAddress: string }>();
    const [nfts, setNfts] = useState<any[]>([]);
    const [showAssets, setShowAssets] = useState(false);
    const [selectedNftName, setSelectedNftName] = useState('');
    const [selectedNftAddress, setSelectedNftAddress] = useState('');
    const [addressDisplay, setAddressDisplay] = useState('');
    const [copied, setCopied] = useState(false);
    const assetsContainerRef = useRef<HTMLDivElement>(null);
    const [tonConnectUI] = useTonConnectUI();
    const [loading, setLoading] = useState(false);
    const [txInProgress, setTxInProgress] = useState(false);
    const [nftImage, setNftImage] = useState('https://cdn-icons-png.flaticon.com/512/6834/6834530.png');

    useEffect(() => {
        if (showAssets && friendlyAddress) {
            const fetchNFTs = async () => {
                const currentTime = Date.now();
                const cacheKeyRegular = `nfts-${friendlyAddress}`;
                const cacheKeySBT = `sbt-${friendlyAddress}`;
                const cachedDataRegular = localStorage.getItem(cacheKeyRegular);
                const cachedDataSBT = localStorage.getItem(cacheKeySBT);
                const cacheTimestampRegular = localStorage.getItem(`${cacheKeyRegular}-timestamp`);
                const cacheTimestampSBT = localStorage.getItem(`${cacheKeySBT}-timestamp`);

                if (cachedDataRegular && cacheTimestampRegular) {
                    const parsedData = JSON.parse(cachedDataRegular);
                    const cachedTimestamp = parseInt(cacheTimestampRegular, 10);
                    if (currentTime - cachedTimestamp < CACHE_TIMEOUT) {
                        setNfts(parsedData);
                        return;
                    }
                }

                if (cachedDataSBT && cacheTimestampSBT) {
                    const parsedData = JSON.parse(cachedDataSBT);
                    const cachedTimestamp = parseInt(cacheTimestampSBT, 10);
                    if (currentTime - cachedTimestamp < CACHE_TIMEOUT) {
                        setNfts(parsedData);
                        return;
                    }
                }

                setLoading(true);
                console.time('LoadNFTs');
                try {
                    const allNfts = await getNFTs(friendlyAddress);
                    console.timeEnd('LoadNFTs');
                    console.time('FilterNFTs');
                    const regularNfts = [];
                    const sbts = [];
                    for (const nft of allNfts) {
                        const type = await getNFTType(nft.address);
                        if (type === 'NFT') {
                            regularNfts.push(nft);
                        } else if (type === 'SBT') {
                            sbts.push(nft);
                        }
                    }
                    console.timeEnd('FilterNFTs');

                    localStorage.setItem(cacheKeyRegular, JSON.stringify(regularNfts));
                    localStorage.setItem(`${cacheKeyRegular}-timestamp`, currentTime.toString());
                    localStorage.setItem(cacheKeySBT, JSON.stringify(sbts));
                    localStorage.setItem(`${cacheKeySBT}-timestamp`, currentTime.toString());

                    setNfts(regularNfts);
                } catch (error) {
                    console.error('Error fetching NFTs:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchNFTs();
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

    const handleNftClick = (nft: any) => {
        const isTestnet = tonConnectUI?.wallet?.account?.chain === CHAIN.TESTNET;
        const friendlyAddress = toUserFriendlyAddress(nft.address, isTestnet);
        let formattedFriendlyAddress = `${friendlyAddress.substring(0, 4)}...${friendlyAddress.substring(friendlyAddress.length - 4)}`;
        setSelectedNftName(nft.name);
        setSelectedNftAddress(friendlyAddress);
        setAddressDisplay(formattedFriendlyAddress);
        setNftImage(nft.image);

        setShowAssets(false);
    };

    const handleAddressClick = () => {
        navigator.clipboard.writeText(selectedNftAddress)
            .then(() => {
                setCopied(true);
                setAddressDisplay('Copied!');
                setTimeout(() => {
                    setCopied(false);
                    setAddressDisplay(`${selectedNftAddress.substring(0, 4)}...${selectedNftAddress.substring(selectedNftAddress.length - 4)}`);
                }, 2000);
            })
            .catch(err => console.error('Failed to copy address:', err));
    };

    const isButtonDisabled = () => {
        return !selectedNftAddress;
    };

    const onSendBurnNft = async () => {
        if (!tonConnectUI?.wallet?.account) {
            console.error('Wallet is not connected');
            return;
        }

        if (!selectedNftAddress) {
            console.error('Selected NFT address is not available');
            return;
        }

        if (!friendlyAddress) {
            console.error('Friendly address is not available');
            return;
        }

        setTxInProgress(true);

        try {
            const ownerAddress = Address.parse(friendlyAddress);
            const nftAddress = selectedNftAddress;

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

            const result = await tonConnectUI.sendTransaction(tx, {
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

    return (
        <div className="container">
            <BackButton />
            <button onClick={() => setShowAssets(!showAssets)} className="toggle-button">
                {showAssets ? 'Hide Assets' : 'Show Assets'}
            </button>
            <div className="main-container">
                <h1 className='main-h1'>Burn NFT</h1>
            </div>
            <div className="nft-image-container">
                <img src={nftImage} alt="Selected NFT" className="selected-nft-image" />
            </div>
            <div className="input-container">
                <label htmlFor="nft-name"></label>
                <input
                    type="text"
                    id="nft-name"
                    placeholder="Name"
                    value={selectedNftName}
                    readOnly
                    style={{ fontWeight: 'bold' }}
                />
                <label htmlFor="nft-address"></label>
                <input
                    type="text"
                    id="nft-address"
                    placeholder="Address"
                    value={addressDisplay}
                    readOnly
                    onClick={handleAddressClick}
                    style={{ fontWeight: 'bold' }}
                />
            </div>
            <MainButton
                text="Send Burn Transaction"
                onClick={onSendBurnNft}
                color="#FF8C00"
                textColor="#FFFFFF"
                disabled={isButtonDisabled() || txInProgress}
            />
            <div
                ref={assetsContainerRef}
                className={`assets-container ${showAssets ? 'show' : 'hide'}`}
            >
                {loading ? (
                    <p className='load'>Loading assets, please wait...</p>
                ) : (
                    nfts.length === 0 ? (
                        <p className='no-assets'>No NFTs found.</p>
                    ) : (
                        <ul className="nfts-list">
                            {nfts.map((nft, index) => (
                                <li key={index} className="nft-item" onClick={() => handleNftClick(nft)}>
                                    <img
                                        src={nft.image}
                                        alt={nft.name}
                                        className="nft-image-thumbnail"
                                    />
                                    <div className="nft-details">
                                        <p className="nft-name">{nft.name}</p>
                                        <p className="nft-address">{`${nft.address.substring(0, 4)}...${nft.address.substring(nft.address.length - 4)}`}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )
                )}
            </div>
        </div>
    );
};

export default BurnNftPage;
