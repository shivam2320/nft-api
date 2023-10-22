import type { NextApiRequest, NextApiResponse } from "next";
import next from "next";

type nftData = {
  chain: string;
  tokenAddress: string;
  tokenId: string;
  name: string;
  symbol: string;
  tokenURI: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const allNFTs = [];

  const address = req.query.address;

  if (req.query.network == "evm") {
    console.log("asasasa");
    const chains = ["eth", "polygon", "bsc", "arbitrum", "avalanche"];

    for (const chain of chains) {
      let url = `https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=${chain}&format=decimal&media_items=false`;
      let apiKey = process.env.MORALIS_API_KEY;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey!,
        },
      });
      const data = await response.json();

      for (let i = 0; i < data.result.length; i++) {
        let nft: nftData = {
          chain: chain,
          tokenAddress: data.result[i].token_address,
          tokenId: data.result[i].token_id,
          name: data.result[i].name,
          symbol: data.result[i].symbol,
          tokenURI: data.result[i].token_uri,
        };
        allNFTs.push(nft);
      }
    }

    res.status(200).json(allNFTs);
  } else if (req.query.network == "solana") {
  } else if (req.query.network == "aptos") {
    let nftUrl = `https://mainnet-aptos-api.moralis.io/wallets/nfts?limit=30&owner_addresses%5B0%5D=${address}`;

    let apiKey = process.env.MORALIS_API_KEY;

    const response = await fetch(nftUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey!,
      },
    });
    const data = await response.json();

    for (let i = 0; i < data.result.length; i++) {
      let idHash = data.result[i].token_data_id_hash;
      let tokenDataUrl = `https://mainnet-aptos-api.moralis.io/nfts?token_ids%5B0%5D=${idHash}`;
      console.log(idHash);
      console.log(tokenDataUrl);
      const idHashResponse = await fetch(tokenDataUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey!,
        },
      });
      const nftInfo = await idHashResponse.json();
      console.log(nftInfo);
      let nft: nftData = {
        chain: "aptos",
        tokenAddress: data.result[i].token_address,
        tokenId: data.result[i].token_id,
        name: data.result[i].name,
        symbol: data.result[i].symbol,
        tokenURI: nftInfo[0].metadata_uri,
      };
      allNFTs.push(nft);
    }
    console.log(allNFTs);
    res.status(200).json(allNFTs);
  }
}
