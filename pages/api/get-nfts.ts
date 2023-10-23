import type { NextApiRequest, NextApiResponse } from "next";

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
  const network = req.query.network;

  if (network == "evm") {
    const chains = ["eth", "polygon", "arbitrum", "bsc", "avalanche"];

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
      let data = await response.json();

      for (let i = 0; i < data.result.length; i++) {
        let img;
        if (data.result[i].metadata) {
          img = JSON.parse(data.result[i].metadata).image;
        }

        let nft: nftData = {
          chain: chain,
          tokenAddress: data.result[i].token_address,
          tokenId: data.result[i].token_id,
          name: data.result[i].name,
          symbol: data.result[i].symbol,
          tokenURI: img,
        };
        allNFTs.push(nft);
      }
    }

    res.status(200).json(allNFTs);
  } else if (network == "solana") {
    let apiKey = process.env.HELIUS_API_KEY;
    const url = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;

    const address = req.query.address;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "string",
        method: "getAssetsByOwner",
        params: {
          ownerAddress: address,
          page: 1,
          limit: 1000,
        },
      }),
    });
    const { result } = await response.json();

    for (let i = 0; i < result.items.length; i++) {
      let nft: nftData = {
        chain: "solana",
        tokenAddress: result.items[i].id,
        tokenId: result.items[i].token_id, //
        name: result.items[i].content.metadata.name,
        symbol: result.items[i].symbol, //
        tokenURI: result.items[i].content.links.image,
      };
      allNFTs.push(nft);
    }

    res.status(200).json(allNFTs);
  } else if (network == "aptos") {
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

      const idHashResponse = await fetch(tokenDataUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey!,
        },
      });
      const nftInfo = await idHashResponse.json();

      const uri = await fetch(nftInfo[0].metadata_uri);
      const uriData = await uri.json();

      let nft: nftData = {
        chain: "aptos",
        tokenAddress: nftInfo[0].creator_address,
        tokenId: data.result[i].token_id, //
        name: data.result[i].name,
        symbol: data.result[i].symbol,
        tokenURI: uriData.image,
      };
      allNFTs.push(nft);
    }
    res.status(200).json(allNFTs);
  }
}
