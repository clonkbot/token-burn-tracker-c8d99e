import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOTAL_SUPPLY = 1_000_000_000;
const BURN_ADDRESS_BALANCE_URL = 'https://tonapi.io/v2/accounts/EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';

interface FlameParticle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

function FlameParticles() {
  const particles: FlameParticle[] = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 1.5 + Math.random() * 2,
      size: 4 + Math.random() * 8,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: '30%',
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, #ff6b35 0%, #ff4500 50%, transparent 70%)`,
            boxShadow: `0 0 ${p.size * 2}px #ff4500, 0 0 ${p.size * 4}px #ff6b35`,
          }}
          animate={{
            y: [0, -300 - Math.random() * 200],
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

function EmberGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
        style={{
          background: 'radial-gradient(ellipse at center bottom, rgba(255,69,0,0.3) 0%, rgba(255,107,53,0.15) 30%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

function AnimatedNumber({ value, label }: { value: string; label: string }) {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter"
        style={{
          fontFamily: '"Bebas Neue", sans-serif',
          background: 'linear-gradient(180deg, #fff 0%, #ff6b35 50%, #ff4500 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 60px rgba(255,69,0,0.5)',
        }}
      >
        {value}
      </motion.span>
      <p className="text-sm sm:text-base uppercase tracking-[0.3em] text-orange-400/70 mt-2"
         style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
        {label}
      </p>
    </motion.div>
  );
}

function BurnMeter({ percentage }: { percentage: number }) {
  return (
    <div className="w-full max-w-xl mx-auto mt-12">
      <div className="relative h-4 bg-black/60 rounded-full overflow-hidden border border-orange-900/50">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #ff4500 0%, #ff6b35 50%, #ffa500 100%)',
            boxShadow: '0 0 20px #ff4500, 0 0 40px #ff6b35',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, transparent 80%, rgba(255,255,255,0.4) 100%)',
          }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      <div className="flex justify-between mt-3 text-xs tracking-wider"
           style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
        <span className="text-orange-500/60">0</span>
        <motion.span
          className="text-orange-400"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {percentage.toFixed(4)}% BURNED
        </motion.span>
        <span className="text-orange-500/60">1B</span>
      </div>
    </div>
  );
}

function App() {
  const [burnedTokens, setBurnedTokens] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchBurnedTokens = useCallback(async () => {
    try {
      const response = await fetch(BURN_ADDRESS_BALANCE_URL);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();

      // The balance is in nanotons (9 decimals), convert to tokens
      const balance = data.balance ? Number(data.balance) / 1e9 : 0;
      setBurnedTokens(balance);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError('Unable to fetch burn data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBurnedTokens();
    const interval = setInterval(fetchBurnedTokens, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchBurnedTokens]);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const percentage = burnedTokens !== null ? (burnedTokens / TOTAL_SUPPLY) * 100 : 0;
  const remaining = burnedTokens !== null ? TOTAL_SUPPLY - burnedTokens : TOTAL_SUPPLY;

  return (
    <div className="min-h-screen relative overflow-hidden"
         style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a0a00 50%, #0d0500 100%)' }}>

      {/* Background noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient glow */}
      <EmberGlow />

      {/* Fire particles */}
      <FlameParticles />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1
            className="text-lg sm:text-xl uppercase tracking-[0.5em] text-orange-500/80 mb-2"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            Token Burn Tracker
          </h1>
          <motion.div
            className="w-24 h-px mx-auto bg-gradient-to-r from-transparent via-orange-500 to-transparent"
            animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.8, 1.2, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </motion.div>

        {/* Main stats */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full mx-auto"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p className="text-orange-400/60 mt-6 tracking-wider text-sm"
                 style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                FETCHING BURN DATA...
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-400"
            >
              <p style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{error}</p>
            </motion.div>
          ) : (
            <motion.div
              key="data"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center w-full max-w-4xl"
            >
              {/* Burned amount */}
              <AnimatedNumber
                value={formatNumber(burnedTokens || 0)}
                label="Tokens Burned"
              />

              {/* Burn meter */}
              <BurnMeter percentage={percentage} />

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-8 mt-16 max-w-md mx-auto">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center p-6 rounded-lg border border-orange-900/30 bg-black/30 backdrop-blur-sm"
                >
                  <p className="text-2xl sm:text-3xl font-bold text-orange-300"
                     style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                    {formatNumber(remaining)}
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-orange-500/50 mt-2"
                     style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    Remaining
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center p-6 rounded-lg border border-orange-900/30 bg-black/30 backdrop-blur-sm"
                >
                  <p className="text-2xl sm:text-3xl font-bold text-orange-300"
                     style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                    1,000,000,000
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-orange-500/50 mt-2"
                     style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    Total Supply
                  </p>
                </motion.div>
              </div>

              {/* Last update */}
              {lastUpdate && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-orange-500/40 text-xs mt-12 tracking-wider"
                  style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                >
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-4 text-center">
        <p
          className="text-[11px] text-orange-500/30 tracking-wide"
          style={{ fontFamily: '"IBM Plex Mono", monospace' }}
        >
          Requested by <a href="https://twitter.com/GoldenFarFR" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400/50 transition-colors">@GoldenFarFR</a> · Built by <a href="https://twitter.com/clonkbot" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400/50 transition-colors">@clonkbot</a>
        </p>
      </footer>
    </div>
  );
}

export default App;