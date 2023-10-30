import type { NextApiRequest, NextApiResponse } from "next";

type nftData = {
  network: string;
  chain?: string;
  tokenAddress: string;
  tokenId: string;
  name: string;
  symbol: string;
  image: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token_address = req.query.token_address;
  const network = req.query.network;

  if (network == "evm") {
    const token_id = req.query.token_id;
    const chain = req.query.chain;
    let url = `https://deep-index.moralis.io/api/v2.2/nft/${token_address}/${token_id}?chain=${chain}&format=decimal&media_items=false`;
    let apiKey = process.env.MORALIS_API_KEY;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey!,
      },
    });
    let data = await response.json();
    let image = JSON.parse(data.metadata).image;

    let nftData: nftData = {
      network: network,
      chain: chain as string,
      tokenAddress: data.token_address,
      tokenId: data.token_id,
      name: data.name,
      symbol: data.symbol,
      image: image,
    };

    res.status(200).json(nftData);
  } else if (network == "aptos") {
    let token_id_hash = req.query.token_id_hash;
    let apiKey = process.env.MORALIS_API_KEY;
    let tokenDataUrl = `https://mainnet-aptos-api.moralis.io/nfts?token_ids%5B0%5D=${token_id_hash}`;

    const idHashResponse = await fetch(tokenDataUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey!,
      },
    });
    let data = await idHashResponse.json();

    let uri;

    if (data[0].metadata_uri.slice(0, 4) == "ipfs") {
      uri = await fetch(
        data[0].metadata_uri.replace("ipfs://", "https://ipfs.io/ipfs/")
      );
    } else {
      uri = await fetch(data[0].metadata_uri);
    }
    const uriData = await uri.json();

    let nftData: nftData = {
      network: network,
      tokenAddress: data[0].creator_address,
      tokenId: token_id_hash as string,
      name: data[0].name,
      symbol: data[0].symbol,
      image: uriData.image,
    };

    res.status(200).json(nftData);
  }
}
