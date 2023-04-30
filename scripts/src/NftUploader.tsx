/** @format */

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import ImageLogo from './image.svg';
import { Button } from '@mui/material';
import './NftUploader.css';
import { ethers } from 'ethers';
import abi from './utils/Web3Mint.json';
// 画像をIPFSにアップロードしてCIDを返してもらう機能
import { Web3Storage } from 'web3.storage';

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
    const askContractToMintNft = async (ipfs: any) => {
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
                console.log(
                    'Going to pop wallet now to pay gas... : ',
                    web3MintContract
                );

                // 何故かここでトランザクションが閉じる #########################################################3

                // トランザクションがマイニングされ 承認 を待ってから Wait で実行する。
                let txn = await web3MintContract.mintIpfsNFT('test2', ipfs);
                console.log('Mining...please wait.');

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

    // Web3Storage API を定義

    /** Image から IPFS の変換 File を作り出し、askContractToMintNft にIPFS のファイルを渡し実行 */
    // target: HTMLImageElement
    const imageToNFT = async (e: any) => {
        const API_KEY =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDJkNjIzMDJjMmZFMDE5NDUyQTJBZTFDOERlNDQzZWZBMzgwM2NDZjQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2ODI3NjM2Mjk4MzgsIm5hbWUiOiJORlQtTWFrZXItQVBJIn0.RKzJTfWtd3Sfbv20AMw3b3NAFQVXwCmY9b9NvWEZRkc';

        // クライアントをインスタンス化
        const web3StorageClient = new Web3Storage({ token: API_KEY });
        const image = e.target;

        // web3.storageにファイルをアップロードします。 第２引数：オプション
        // ファイルはクライアントでハッシュ化され、1つのContent Addressed Archive(CAR)としてアップロードされます。
        const rootCid = await web3StorageClient.put(image.files, {
            name: 'test',
            maxRetries: 3, // アップロードに失敗した場合に再試行する最大回数。デフォルト：5
        });

        // アップしたIPFSのCid を取得する (Put した際に、RootCid に Cid が格納されている。)
        const cidResponse = await web3StorageClient.get(rootCid);

        // CID から ファイルを取得する。
        const IPFSFiles = await cidResponse?.files();

        // ファイルの数だけ、コントラクトから NFT を Mint する。
        if (IPFSFiles) {
            for (const IPFS of IPFSFiles) {
                askContractToMintNft(IPFS);
                console.log('IPFS.cid : ', IPFS.cid);
            }
        }
    };

    // MetaMask に未接続なら ボタンをレンダーする
    const renderNotConnectedContainer = () => (
        <button
            onClick={connectWallet}
            className='cta-button connect-wallet-button'
        >
            Connect wallet
        </button>
    );

    // レンダリング時にアカウント接続を実行
    useEffect(() => {
        connectWallet();
    }, []);

    // 画像アップロードページをレンダー
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
                    onChange={imageToNFT}
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
                    onChange={imageToNFT}
                />
            </Button>
        </div>
    );
};

export default NftUploader;
