import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import abi from './utils/MyEpicNFT.json';
import ReactLoading from 'react-loading';
import Modal from 'react-modal';

// Constants
// const TWITTER_HANDLE = '_buildspace';
const TWITTER_HANDLE_MT = 'melwyntee';
const TWITTER_LINK_MT = `https://twitter.com/${TWITTER_HANDLE_MT}`;

const OPENSEA_LINK = 'https://testnets.opensea.io/assets';
const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = '0x4E0301935cd61c36997b439fC524a685052a9fE7';

// String, hex code of the chainId of the Rinkebey test network
const rinkebyChainId = '0x4';

const Loader = ({ type, color }) => (
  <ReactLoading type={type} color={color} height={'20%'} width={'20%'} />
);

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [totalNFTMinted, setTotalNFTMinted] = useState(0);
  const [currentChainId, setCurrentChainId] = useState('');
  const [minting, setMinting] = useState(false);

  const [modalBox, setModalBox] = useState({
    open: false,
    message: '',
  });

  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    // checkIfWalletIsConnected is ran only once
    console.log('check if wallet is connected...');

    const { ethereum } = window;

    const networkVersion = ethereum ? ethereum.networkVersion : null;
    console.log(
      `#checkIfWalletIsConnected - Network Version: ${networkVersion}`
    );

    // const isMetaMask = ethereum ? ethereum.isMetaMask : null;

    try {
      if (!ethereum) {
        console.log('Make sure you have metamask!');
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account: ', account);
        setCurrentAccount(account);

        let chainId = await ethereum.request({ method: 'eth_chainId' });
        setCurrentChainId(chainId);

        console.log('Connected to chain ' + chainId);

        // if (chainId !== rinkebyChainId) {
        //   alert('You are not connected to the Rinkeby Test Network!');
        // }

        if (chainId === rinkebyChainId) {
          setupEventListener();
        }
      } else {
        console.log('No authorized account found.');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    const { ethereum } = window;
    const networkVersion = ethereum ? ethereum.networkVersion : null;
    console.log(`#connectWallet - Network Version: ${networkVersion}`);

    // const isMetaMask = ethereum ? ethereum.isMetaMask : null;

    try {
      if (!ethereum) {
        console.log('Get metamask!');
        return;
      }

      // check in doc if this is an async function
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      const account = accounts[0];

      setCurrentAccount(account);

      console.log('connected', account);

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      setCurrentChainId(chainId);

      console.log('Connected to chain ' + chainId);

      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  const setupEventListener = async () => {
    const { ethereum } = window;
    const networkVersion = ethereum ? ethereum.networkVersion : null;
    console.log(`#setupEventListener - Network Version: ${networkVersion}`);

    // const isMetaMask = ethereum ? ethereum.isMetaMask : null;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractABI,
          signer
        );

        connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
          console.log(`From: ${from}, token id: ${tokenId}`);
          // alert(
          //   `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: ${OPENSEA_LINK}/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          // );
          setModalBox({
            open: true,
            message: `
            Hey there!<br /><br />
            We've minted your NFT and sent it to your wallet.
            <br /><br />
            It may be blank right now.
            <br /><br />
            It can take a max of 10 min to show up on OpenSea.
            <br /><br />
            Here's the link:
            <a
                href="${OPENSEA_LINK}/${CONTRACT_ADDRESS}/${tokenId.toNumber()}"
                target="_blank"
                rel="noopener noreferrer"
              >
              ${OPENSEA_LINK}/${CONTRACT_ADDRESS}/${tokenId.toNumber()}
              </a>
            `,
          });

          setMinting(false);
        });

        connectedContract.on('SendTotalNFT', (total) => {
          console.log(`Total: ${total.toNumber()}`);
          setTotalNFTMinted(total.toNumber());
        });

        // if (currentChainId === rinkebyChainId) {
        const totalNFTsMintedSoFar =
          await connectedContract.getTotalNFTsMintedSoFar();

        setTotalNFTMinted(totalNFTsMintedSoFar.toNumber());

        console.log(
          `Total NFTs minted so far: ${totalNFTsMintedSoFar.toNumber()}`
        );
        // }
        // console.log('Current Chain ID: ', currentChainId);

        console.log('Setup event listener!');
      } else {
        console.log('Ethereum object does not exist.');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNFT = async () => {
    const { ethereum } = window;
    const networkVersion = ethereum ? ethereum.networkVersion : null;
    console.log(`Network Version: ${networkVersion}`);

    // const isMetaMask = ethereum ? ethereum.isMetaMask : null;

    try {
      if (ethereum) {
        // A "Provider" is what we use to actually talk to Ethereum nodes
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractABI,
          signer
        );

        console.log('Going to pop wallet now to pay gas...');

        // this must be set to true before the call to mint the NFT
        setMinting(true);

        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log('Mining... Please wait.');
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log('Ethereum object does not exist.');
      }
    } catch (error) {
      console.log(`Error Code: ${error.code}, Message: ${error.message}`);
      setMinting(false);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();

    const { ethereum } = window;

    try {
      if (ethereum) {
        ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0)
            console.log(`Account connected: ${accounts[0]}`);
          else {
            console.log('Account disconnected');
            setCurrentAccount('');
            setCurrentChainId('');
          }
        });

        ethereum.on('chainChanged', async (_) => {
          console.log('Chain changed');
          let chainId = await window.ethereum.request({
            method: 'eth_chainId',
          });
          console.log(chainId, typeof chainId);
          setCurrentChainId(chainId);
        });
      } else {
        console.log("Ethereum object doesn't exist.");
      }
    } catch (error) {
      console.log(error);
    }

    // eslint-disable-next-line
  }, []);

  const visitOpenSea = () => {
    console.log('Visit OpenSea');
    window.open(
      'https://testnets.opensea.io/0x59cc0f814e3d6216f230e3f0a75e5d561774f06c',
      '_blank' // <- This is what makes it open in a new window.
    );
  };

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => {
    if (!minting && currentChainId === rinkebyChainId) {
      return (
        <button
          onClick={askContractToMintNFT}
          className="cta-button mint-button"
        >
          Mint NFT
        </button>
      );
    } else if (!minting && currentChainId !== rinkebyChainId) {
      return (
        <button onClick={null} className="cta-button connect-wallet-button">
          Please select in MetaMask the Rinkeby Test Network!
        </button>
      );
    } else {
      return (
        <button onClick={null} className="cta-button connect-wallet-button">
          Please wait while your NFT is being minted.
          <Loader type={'cubes'} color={'#ffffff'} />
        </button>
      );
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Create your NFT Collection!</p>
          <p className="sub-text">
            Each unique. Each beautiful. Connect your MetaMask wallet and mint
            your own NFT.
          </p>
          <p style={{ color: 'white', fontSize: '14px' }}>
            This is deployed on Rinkeby Test Network.
            <br />
            You can get free (<del>fake</del>) Eth here{' '}
            <a
              href="https://app.mycrypto.com/faucet"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://app.mycrypto.com/faucet
            </a>{' '}
            <br />
            (make sure to connect your wallet to the site and click on this link
            again)
          </p>
          <p className="sub-text">
            {currentChainId === rinkebyChainId
              ? `Number of NFT minted: ${totalNFTMinted} / ${TOTAL_MINT_COUNT}`
              : ''}
          </p>

          {currentAccount ? renderMintUI() : renderNotConnectedContainer()}

          <br />
          <br />

          <button onClick={visitOpenSea} className="cta-button opensea-button">
            Visit my NFT collection
          </button>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK_MT}
            target="_blank"
            rel="noreferrer"
          >{`Follow me on Twitter @${TWITTER_HANDLE_MT}`}</a>
        </div>
      </div>

      <Modal
        isOpen={modalBox.open}
        onRequestClose={() => setModalBox({ open: false, message: '' })}
      >
        <div dangerouslySetInnerHTML={{ __html: modalBox.message }}></div>
      </Modal>
    </div>
  );
};

export default App;
