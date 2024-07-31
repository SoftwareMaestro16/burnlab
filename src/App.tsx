import { useEffect, useState, FC } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import WebAppSDK from '@twa-dev/sdk';
import { THEME, TonConnectUIProvider, useTonConnectModal } from "@tonconnect/ui-react";
import { Header } from "./Header.tsx";
import { SendTx } from "./SendTx.tsx";
import { Settings } from "./Settings.tsx";
import './App.css';
import exampleImage from './assets/fire.png';
import BurnJettonPage from './BurnJettonPage.tsx'; 
import BurnNftPage from './BurnNftPage.tsx';
import BurnSbtPage from './BurnSbtPage.tsx';

declare global {
    interface Window {
        Telegram?: any;
    }
}

const Home: FC<{ setWalletAddress: (address: string | null) => void }> = ({ setWalletAddress }) => {
    const [walletAddress, setWalletAddressLocal] = useState<string | null>(null);
    const [friendlyAddress, setFriendlyAddress] = useState<string | null>(null);
    const [amount] = useState<number>(0); 
    const [selectedTokenAddress] = useState<string>(''); 
    const { open } = useTonConnectModal();
    useEffect(() => {
        if (walletAddress) {
            const friendly = walletAddress; 
            setFriendlyAddress(friendly);
        } else {
            setFriendlyAddress(null);
        }
    }, [walletAddress]);

    useEffect(() => {
        setWalletAddress(walletAddress);
    }, [walletAddress, setWalletAddress]);

    const navigate = useNavigate();

    const handleBurnJettonClick = () => {
        if (friendlyAddress) {
            navigate(`/burn-jetton/${encodeURIComponent(friendlyAddress)}`);
        } else {
            open(); 
        }
    };

    const handleBurnNftClick = () => {
        if (friendlyAddress) {
            navigate(`/burn-nft/${encodeURIComponent(friendlyAddress)}`);
        } else {
            open(); 
        }
    };

    const handleBurnSbtClick = () => {
        if (friendlyAddress) {
            navigate(`/burn-sbt/${encodeURIComponent(friendlyAddress)}`);
        } else {
            open(); 
        }
    };

    return (
        <>
            <Header setWalletAddress={setWalletAddressLocal} />
            <div className="image-container">
                <img src={exampleImage} alt="Example" className="example-image" />
            </div>
            <div className="main-container">
                <h1 className='main-hh1'>BurnLab</h1>
                <h2 className='main-h2'>Token Burning Service</h2>
            </div>
            <div className="button-container">
                <button className="button-1" onClick={handleBurnJettonClick}>Burn Jetton</button>
                <button className="button-2" onClick={handleBurnNftClick}>Burn NFT</button>
                <button className="button-3" onClick={handleBurnSbtClick}>Burn SBT</button>
            </div>
            <SendTx 
                friendlyAddress={friendlyAddress} 
                amount={amount} 
                selectedTokenAddress={selectedTokenAddress} 
            />
            <Settings />
        </>
    );
};

function App() {
    const [isTg, setIsTg] = useState<boolean>(false);

    useEffect(() => {
        const isTgCheck = window.Telegram?.WebApp?.initData !== '';

        if (isTgCheck) {
            WebAppSDK.ready();
            WebAppSDK.enableClosingConfirmation();
            WebAppSDK.expand();
            WebAppSDK.headerColor = "#eb5d25"
            setIsTg(true);

            document.body.style.backgroundColor = 'var(--tg-theme-bg-color)';
            document.body.style.setProperty('background-color', 'var(--tg-theme-bg-color)', 'important');
        }
    }, []);

    return (
        <>
            {isTg ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: 'black',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '24px',
                }}>
                    Access denied. Please open in Telegram.
                </div>
            ) : (
                <TonConnectUIProvider
                    manifestUrl="https://burnlab.vercel.app/tonconnect-manifest.json"
                    uiPreferences={{
                        borderRadius: 'm',
                        colorsSet: {
                            [THEME.LIGHT]: {
                                connectButton: {
                                    background: '#e88335'
                                },
                                accent: '#e88335',
                                telegramButton: '#ed7e2f',
                                background: {
                                    qr: '#fabf73',
                                    tint: '#e88335',
                                    primary: '#f2b15c',
                                    secondary: '#e16ae6',
                                    segment: '#e88335'
                                },
                                text: {
                                    primary: '#000000',
                                    secondary: '#000000'
                                },
                                
                            }
                        }
                    }}
                    actionsConfiguration={{
                        modals: 'all',
                        notifications: ['error'],
                        twaReturnUrl: 'https://t.me/BurnLabBot/Burn' 
                    }}
                >
                    <Router>
                    <Routes>
                            <Route path="/" element={<Home setWalletAddress={() => {}} />} />
                            <Route path="/burn-jetton/:friendlyAddress" element={<BurnJettonPage />} />
                            <Route path="/burn-nft/:friendlyAddress" element={<BurnNftPage />} />
                            <Route path="/burn-sbt/:friendlyAddress" element={<BurnSbtPage />} /> {/* Added route */}
                        </Routes>
                    </Router>
                </TonConnectUIProvider>
            )}
        </>
    );
}

export default App;
