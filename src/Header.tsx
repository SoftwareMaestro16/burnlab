import { useState, useEffect, useRef } from 'react';
import { useTonConnectModal, useTonConnectUI, useTonWallet, CHAIN, toUserFriendlyAddress } from "@tonconnect/ui-react";
import './App.css';

interface HeaderProps {
    setWalletAddress: (address: string | null) => void;
}

export const Header = ({ setWalletAddress }: HeaderProps) => {
    const wallet = useTonWallet();
    const { open } = useTonConnectModal();
    const [tonConnectUi] = useTonConnectUI();
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [walletImageUrl, setWalletImageUrl] = useState<string | null>(null);
    const [walletAddress, setWalletAddressLocal] = useState<string | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [copyButtonText, setCopyButtonText] = useState('Copy Address');
    const [showModal, setShowModal] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (wallet) {
            setIsWalletConnected(true);
            if ('imageUrl' in wallet) {
                setWalletImageUrl(wallet.imageUrl);
            }
            const address = wallet.account?.address;
            if (address) {
                const friendly = toUserFriendlyAddress(address, wallet.account.chain === CHAIN.TESTNET);
                setWalletAddressLocal(friendly);
                setWalletAddress(friendly); 
            } else {
                setWalletAddressLocal(null);
                setWalletAddress(null);
            }
        } else {
            setIsWalletConnected(false);
            setWalletImageUrl(null);
            setWalletAddressLocal(null);
            setWalletAddress(null);
        }
    }, [wallet, setWalletAddress]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) && !buttonRef.current?.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDisconnect = async () => {
        try {
            await tonConnectUi.disconnect();
            setIsWalletConnected(false);
            setWalletImageUrl(null);
            setWalletAddressLocal(null);
            setWalletAddress(null);
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
        }
    };

    const handleOpenModal = () => {
        if (!isWalletConnected) {
            open();
        }
    };

    const handleCopyAddress = () => {
        if (walletAddress) {
            navigator.clipboard.writeText(walletAddress);
            setCopyButtonText('Copied!');
            setTimeout(() => {
                setCopyButtonText('Copy Address');
            }, 2000);
        }
    };

    const truncateAddress = (address: string) => {
        if (address.length <= 8) return address;
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                padding: '10px',
                zIndex: 1000
            }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                        ref={buttonRef}
                        onClick={handleOpenModal}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'linear-gradient(45deg, #e88335, #fabf73)',
                            border: '2px solid white',
                            borderRadius: '20px',
                            color: 'white',
                            padding: '13px 25px',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            position: 'relative',
                            outline: 'none', 
                            boxShadow: 'none' 
                        }}
                    >
                        {walletAddress ? (
                            <div onClick={() => setShowMenu(!showMenu)} style={{ display: 'flex', alignItems: 'center' }}>
                                {walletImageUrl && (
                                    <img
                                        src={walletImageUrl}
                                        height="35px"
                                        width="35px"
                                        style={{ borderRadius: '50%', marginRight: '10px' }}
                                        alt="Wallet"
                                    />
                                )}
                                <strong>{truncateAddress(walletAddress)}</strong>
                            </div>
                        ) : (
                            'Connect Wallet'
                        )}
                    </button>
                    {showMenu && walletAddress && (
                        <div ref={menuRef} style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'linear-gradient(45deg, #e88335, #fabf73)',
                            borderRadius: '20px',
                            border: '2px solid white',
                            boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
                            padding: '9px',
                            zIndex: 1000,
                            width: buttonRef.current ? `${buttonRef.current.offsetWidth * 0.8}px` : 'auto',
                            opacity: showMenu ? 1 : 0,
                            transition: 'opacity 0.3s ease, transform 0.3s ease',
                        }}>
                            <button
                                onClick={handleCopyAddress}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '4px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    borderRadius: '5px',
                                    transition: 'background 0.3s',
                                    marginBottom: '5px',
                                    outline: 'none', 
                                    boxShadow: 'none' 
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#f08132')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                {copyButtonText}
                            </button>
                            <button
                                onClick={handleDisconnect}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '4px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    borderRadius: '5px',
                                    transition: 'background 0.3s',
                                    marginBottom: '5px',
                                    outline: 'none',
                                    boxShadow: 'none'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#f08132')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                Disconnect
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Button */}
            <button
                onClick={toggleModal}
                style={{
                    position: 'fixed',
                    top: '10px',
                    left: '10px',
                    width: '60px', 
                    height: '60px', 
                    background: '#e88335',
                    border: '2px solid white',
                    borderRadius: '12px',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px', 
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    zIndex: 1000
                }}
            >
                i
            </button>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1001,
                    backdropFilter: 'blur(5px)', 
                    transition: 'backdrop-filter 0.3s ease'
                }}>
                    <div style={{
                        background: 'linear-gradient(45deg, #e88335, #fabf73)', 
                        borderRadius: '10px',
                        padding: '20px',
                        width: '80%',
                        maxWidth: '500px',
                        position: 'relative',
                        animation: 'fadeIn 0.5s ease', 
                        color: 'white',
                        fontFamily: 'Arial, sans-serif',
                        textAlign: 'center' 
                    }}>
                        <button
                            onClick={toggleModal}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                width: '40px',
                                height: '40px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '28px',
                                cursor: 'pointer',
                                color: '#fff'
                            }}
                        >
                            ×
                        </button>
                        <h1 style={{ fontSize: '32px' }}>BurnLab</h1>
                        <p style={{ fontSize: '25px', fontFamily: 'Arial', fontWeight: 'bold' }}>
                            BurnLab is a dApp by <a href="https://t.me/TokenInfinity" style={{ color: '#fff', textDecoration: 'underline' }}>@TokenInfinity</a> for burning Jetton, NFT and SBT tokens. BurnLab provides a transparent and fair burning process for managing digital assets. Use the app to burn unwanted tokens or create a scarcity that could potentially increase the value of the tokens, as well as burn spam NFT.
                        </p>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
};
