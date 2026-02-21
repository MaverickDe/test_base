import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface CoinInfo {
  alias: string;
  logo: string;
}
export const COIN_MAP: { [key: string]: CoinInfo } = {
   'TETHEREUM': { 
    alias: 'tethereum-3', // Tracking ETH price
    logo: 'https://assets.coingecko.com/coins/images/54861/standard/Tethereum_Transperent_logo.png?1742309715' 
  },

  'ETH': { 
    alias: 'ethereum', 
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' 
  },
    'BNB': { 
    alias: 'binancecoin', 
    logo: 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png' 
  },
 
  'USDT': { 
    alias: 'tether', 
    logo: 'https://assets.coingecko.com/coins/images/325/large/tether.png' 
  },
  'USDC': { 
    alias: 'usd-coin', 
    logo: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png' 
  },
  'DAI': { 
    alias: 'dai', 
    logo: 'https://assets.coingecko.com/coins/images/9956/large/Badge_Dai.png' 
  },
  'MATIC': { 
    alias: 'matic-network', 
    logo: 'https://assets.coingecko.com/coins/images/4713/large/polygon-pos-icon.png' 
  },
  'ARB': { 
    alias: 'arbitrum', 
    logo: 'https://assets.coingecko.com/coins/images/16547/large/arbitrum.png' 
  },
  'OP': { 
    alias: 'optimism', 
    logo: 'https://assets.coingecko.com/coins/images/25244/large/Optimism.png' 
  },
};

// export async function getLivePrices() {
  
//   const ids = Object.values(COIN_MAP).join(',');
//   const res = await fetch(
//     `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
//     { next: { revalidate: 60 } } // Cache for 60 seconds (Next.js 13+)
//   );
  
//   const data = await res.json();
  
//   // Format into a simple { SYMBOL: price } object
//   const prices: { [key: string]: number } = {};
//   Object.keys(COIN_MAP).forEach((symbol) => {
//     prices[symbol] = data[COIN_MAP[symbol].alias]?.usd || 1;
//   });

//   // Handle custom tokens (e.g., TETHEREUM as 1:1 with ETH or custom value)
//   prices['TETHEREUM'] = prices['ETH']; 

//   return prices;
// }

const CACHE_KEY = 'crypto_prices_cache';
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds

export async function getLivePrices() {
  // 1. Check if we are in the browser and if valid cache exists
  if (typeof window !== 'undefined') {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { prices, timestamp } = JSON.parse(cachedData);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;

      if (!isExpired) {
        console.log("Serving prices from local storage cache...");
        return prices;
      }
    }
  }

  // 2. If no cache or expired, fetch fresh data
  console.log("Cache expired or missing. Fetching fresh prices...");
  
  const aliases = Object.values(COIN_MAP).map(coin => coin.alias);
  const uniqueIds = Array.from(new Set(aliases)).join(',');

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${uniqueIds}&vs_currencies=usd`
    );
    
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    console.log(data,"data")
    
    const prices: { [key: string]: number } = {};
    
    Object.keys(COIN_MAP).forEach((symbol) => {
      const alias = COIN_MAP[symbol].alias;
      prices[symbol] = data[alias]?.usd || 1;
    });

    // Handle the custom/tethered token
    // prices['TETHEREUM'] = prices['ETH'];

    // 3. Save to local storage with timestamp
    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        prices,
        timestamp: Date.now()
      }));
    }

    return prices;
  } catch (error) {
    console.error("Failed to fetch prices:", error);
    
    // Fallback: if fetch fails, try to return expired cache anyway 
    // rather than returning an empty object (better UX)
    const fallback = localStorage.getItem(CACHE_KEY);
    return fallback ? JSON.parse(fallback).prices : {};
  }
}

export async function getDynamicExchangeRates() {
  const prices = await getLivePrices();
  const symbols = Object.keys(prices);
  
  const rates: { [key: string]: { [key: string]: number } } = {};

  symbols.forEach((source) => {
    rates[source] = {};
    symbols.forEach((target) => {
      // Logic: 1 Source = (SourcePrice / TargetPrice) Target
      rates[source][target] = prices[source] / prices[target];
    });
  });

  return rates;
}