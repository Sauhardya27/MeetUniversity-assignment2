import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bell, Search, Star, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, DollarSign, Volume2, Globe } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const generateSinusoidalData = (basePrice, length) => {
  const data = [];
  const amplitude = basePrice * 0.1; // 10% of base price
  const period = 10; // Complete cycle over 10 points

  for (let i = 0; i < length; i++) {
    // Base sinusoidal movement
    const sinComponent = Math.sin((i / period) * 2 * Math.PI) * amplitude;
    // Add random noise
    const noise = (Math.random() - 0.5) * amplitude * 0.5;
    // Combine with slight upward trend
    const trend = (i / length) * (basePrice * 0.05);
    const price = basePrice + sinComponent + noise + trend;

    data.push({
      time: i,
      price: Math.max(price, basePrice * 0.5)
    });
  }
  return data;
};

const App = () => {
  const [stocks, setStocks] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const generateStockData = () => {
      const stockList = [
        { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 180 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', basePrice: 140 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', basePrice: 330 },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', basePrice: 170 },
        { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 250 },
      ];

      return stockList.map(stock => {
        const historicalData = generateSinusoidalData(stock.basePrice, 30);
        const currentPrice = historicalData[historicalData.length - 1].price;
        const change = ((currentPrice - stock.basePrice) / stock.basePrice * 100).toFixed(2);

        return {
          ...stock,
          price: currentPrice,
          change,
          volume: Math.floor(Math.random() * 1000000),
          dailyHigh: Math.max(...historicalData.map(d => d.price)),
          dailyLow: Math.min(...historicalData.map(d => d.price)),
          historicalData
        };
      });
    };

    setStocks(generateStockData());

    const interval = setInterval(() => {
      setStocks(prevStocks =>
        prevStocks.map(stock => {
          const newHistoricalData = [...stock.historicalData.slice(1)];
          const lastPrice = newHistoricalData[newHistoricalData.length - 1].price;

          // Generate new price with sinusoidal influence
          const time = stock.historicalData[stock.historicalData.length - 1].time + 1;
          const sinComponent = Math.sin((time / 10) * 2 * Math.PI) * (stock.basePrice * 0.1);
          const noise = (Math.random() - 0.5) * (stock.basePrice * 0.05);
          const trend = (time / 30) * (stock.basePrice * 0.05);
          const newPrice = stock.basePrice + sinComponent + noise + trend;

          newHistoricalData.push({
            time,
            price: Math.max(newPrice, stock.basePrice * 0.5)
          });

          const change = ((newPrice - stock.basePrice) / stock.basePrice * 100).toFixed(2);

          // Update selected stock if it matches
          if (selectedStock && selectedStock.symbol === stock.symbol) {
            setSelectedStock({
              ...stock,
              price: newPrice,
              change,
              historicalData: newHistoricalData,
              dailyHigh: Math.max(stock.dailyHigh, newPrice),
              dailyLow: Math.min(stock.dailyLow, newPrice)
            });
          }

          return {
            ...stock,
            price: newPrice,
            change,
            historicalData: newHistoricalData,
            dailyHigh: Math.max(stock.dailyHigh, newPrice),
            dailyLow: Math.min(stock.dailyLow, newPrice)
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedStock]);

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'watchlist') {
      return matchesSearch && watchlist.includes(stock.symbol);
    }
    return matchesSearch;
  });

  const toggleWatchlist = (symbol) => {
    setWatchlist(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <Activity className="text-blue-400 h-8 w-8" />
            Market Pulse
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search stocks..."
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                onClick={() => setActiveTab('all')}
              >
                All Stocks
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'watchlist' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                onClick={() => setActiveTab('watchlist')}
              >
                Watchlist
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { title: 'Market Cap', icon: DollarSign, value: '$2.3T', change: '+2.4%' },
            { title: 'Volume', icon: Volume2, value: '12.5M', change: '-1.2%' },
            { title: 'Active Stocks', icon: Activity, value: '3,421', change: '+5.6%' },
            { title: 'Global Markets', icon: Globe, value: '23/24', change: '+0.8%' },
          ].map((item) => (
            <Card key={item.title} className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">{item.title}</p>
                    <p className="text-2xl font-bold text-white">{item.value}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
                <p className={`text-sm mt-2 flex items-center gap-1 ${item.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                  }`}>
                  {item.change.startsWith('+') ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {item.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Market Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer border border-gray-700 ${selectedStock?.symbol === stock.symbol
                          ? 'bg-blue-500 bg-opacity-10 border-blue-500'
                          : 'bg-gray-900 hover:border-gray-600'
                        }`}
                      onClick={() => setSelectedStock(stock)}
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(stock.symbol);
                          }}
                          className="text-gray-400 hover:text-yellow-500 transition-colors"
                        >
                          <Star
                            className={watchlist.includes(stock.symbol) ? "fill-yellow-500 text-yellow-500" : ""}
                          />
                        </button>
                        <div>
                          <h3 className="font-bold text-white">{stock.symbol}</h3>
                          <p className="text-sm text-gray-400">{stock.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">${stock.price.toFixed(2)}</p>
                        <p className={`text-sm flex items-center gap-1 ${parseFloat(stock.change) >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                          {parseFloat(stock.change) >= 0 ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          {stock.change}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  {selectedStock ? `${selectedStock.symbol} Details` : 'Select a Stock'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStock ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-400">{selectedStock.name}</p>
                        <h3 className="font-bold text-2xl text-white">${selectedStock.price.toFixed(2)}</h3>
                        <p className={`text-sm flex items-center gap-1 ${parseFloat(selectedStock.change) >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                          {parseFloat(selectedStock.change) >= 0 ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          {selectedStock.change}%
                        </p>
                      </div>
                      <button
                        className={`p-2 rounded-full transition-colors ${watchlist.includes(selectedStock.symbol)
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-700 text-gray-400 hover:text-white'
                          }`}
                        onClick={() => toggleWatchlist(selectedStock.symbol)}
                      >
                        <Star className={watchlist.includes(selectedStock.symbol) ? "fill-white" : ""} />
                      </button>
                    </div>

                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={selectedStock.historicalData}
                          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                        >
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                          />
                          <CartesianGrid stroke="#374151" strokeDasharray="5 5" />
                          <XAxis dataKey="time" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1f2937',
                              border: 'none',
                              borderRadius: '0.5rem',
                              color: '#fff'
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                        <p className="text-sm text-gray-400">Volume</p>
                        <p className="font-bold text-white">{selectedStock.volume.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                        <p className="text-sm text-gray-400">Market Cap</p>
                        <p className="font-bold text-white">${(selectedStock.price * selectedStock.volume).toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                        <p className="text-sm text-gray-400">Day High</p>
                        <p className="font-bold text-white">${selectedStock.dailyHigh.toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                        <p className="text-sm text-gray-400">Day Low</p>
                        <p className="font-bold text-white">${selectedStock.dailyLow.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                    <p>Select a stock to view detailed information</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;