/** @format */

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import ImageLogo from './image.svg';
import { Button } from '@mui/material';
import './NftUploader.css';
import { ethers } from 'ethers';
import { abi } from './utils/Web3Mint.json';

// Metamask プロバイダーの追加
import { MetaMaskInpageProvider } from '@metamask/providers';
import { Interface } from 'readline';

// MetaMaskInpageProvider の ethereum オブジェクトを 使えるようにする
declare global {
    interface Window {
        ethereum?: MetaMaskInpageProvider;
    }
}

// NFT の画像アップロードページ
const NftUploader = () => {
    /** アカウントのWalletアドレス */
    const [currentAccount, setCurrentAccount] = useState<string>();
    const [isAccount, setIsAccount] = useState<boolean>(false);

    // Ethereum オブジェクトを取得する
    const checkIfWalletIsConnected = (): MetaMaskInpageProvider | null => {
        if (
            typeof window !== 'undefined' &&
            typeof window.ethereum !== 'undefined'
        ) {
            const { ethereum } = window;
            console.log('Ethereum Object => ', ethereum);
            return ethereum;
        }
        alert('Get MetaMask!');
        return null;
    };

    // Ethereum アカウント（Wallet）に接続する。
    const connectWallet = async () => {
        try {
            const ethereum = checkIfWalletIsConnected();
            const accounts = await ethereum?.request({
                method: 'eth_requestAccounts',
            });
            // accouts が Null か Undefined ならリターン
            if (!Array.isArray(accounts)) return;
            setCurrentAccount(accounts[0]);
            setIsAccount(true);
            console.log('use account => ', accounts[0]);
        } catch (err) {
            console.log(err);
        }
    };

    /** コントラクトとWebサイトを連動させ、mintIpfsNFT関数を呼び出し */
    const askContractToMintNft = async (ipfs: string) => {
        try {
            const ethereum = checkIfWalletIsConnected();
            const CONTRACT_ADDRESS =
                '0x0f85C6D6D721a09Bbe809a4ace0D523CdE1520A7';
            const contractAbi = abi.abi;

            if (ethereum) {
                const provider = new ethers.BrowserProvider(ethereum);
                const signer = await provider.getSigner();

                // Ethers を使用して コントラクトに接続
                const web3MintContract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    contractAbi,
                    signer
                );

                // トランザクションがマイニングされ 承認 を待ってから Wait で実行する。
                let txn = await web3MintContract.mintIpfsNFT('test1', 'ipfs1');
                await txn.wait();
                console.log(
                    `Mined, see transaction: https://sepolia.etherscan.io/tx/${txn.hash}`
                );
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (err) {
            console.log(err);
        }
    };

    const renderNotConnectedContainer = () => (
        <button
            onClick={connectWallet}
            className='cta-button connect-wallet-button'
        >
            Connect wallet
        </button>
    );

    useEffect(() => {
        connectWallet();
    }, []);

    return (
        <div className='outerBox'>
            {/* Wallet に接続されていなければ接続ボタンを表示 */}
            {!isAccount && renderNotConnectedContainer()}

            {/* Title */}
            <div className='title'>
                <h2>NFTアップローダー</h2>
                <p>JpegかPngの画像ファイル</p>
            </div>

            {/* Upload box */}
            <div className='nftUplodeBox'>
                {/* Image logo */}
                <div className='imageLogoAndText'>
                    <img src={ImageLogo} />
                    <p>ここにドラッグ＆ドロップしてね</p>
                </div>
                {/* ドラッグ・アンド・ドロップ で 隠しInput要素の値を更新する */}
                <input
                    className='nftUploadInput'
                    multiple
                    name='imageURL'
                    type='file'
                    accept='.jpg , .jpeg , .png'
                />
            </div>

            {/* ファイルを選択してアップロード */}
            <p>または</p>
            {/* リッチなボタンを生成する */}
            <Button variant='contained'>
                ファイルを選択
                {/* 隠しInput 要素 */}
                <input
                    className='nftUploadInput'
                    // multiple
                    name='imageURL'
                    type='file'
                    accept='.jpg , .jpeg , .png'
                />
            </Button>
        </div>
    );
};

export default NftUploader;
