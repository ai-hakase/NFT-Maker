/** @format */

import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
    solidity: '0.8.18',
    networks: {
        // sepolia テストネットワークを使用する
        sepolia: {
            // マイニングで Alchemy を使用。 （API）
            // Alchemy → 世界中のトランザクションを一元化し、マイナーの承認を促進するプラットフォーム
            url: 'https://eth-sepolia.g.alchemy.com/v2/Xmd9qfLbtBzKCkdRZTJo1DUNyci6UZPg',
            // 複数の場合もあるので配列にする。 → テストネットで使用するアカウント
            accounts: [
                '6ce1ae45d183b195c255e907fa8fcb632b4ab6bfb45c52f5833551fb38774ee8',
            ],
        },
    },
};

export default config;
