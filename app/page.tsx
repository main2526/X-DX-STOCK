"use client";
import { useEffect, useState } from "react";
import type React from "react";

const FRUIT_IMAGE_MANIFEST: { [key: string]: string } = {
  Blizzard: "Blizzard.webp",
  Bomb: "Bomb.webp",
  Smoke: "Smoke.webp",
  Buddha: "Buddha.webp",
  Chop: "Chop.webp",
  Spring: "Spring.webp",
  Spin: "Spin.webp",
  Spike: "Spike.webp",
  Rocket: "Rocket.webp",
  Pain: "Pain.webp",
  Control: "Control.webp",
  Creation: "Creation.webp",
  Dark: "Dark.webp",
  Diamond: "Diamond.webp",
  Dough: "Dough.webp",
  Dragon: "DragonFruitEast.webp",
  Eagle: "Eagle.webp",
  Flame: "Flame.webp",
  Gas: "Gas.webp",
  Ghost: "Ghost.webp",
  Gravity: "Gravity.webp",
  Ice: "Ice.webp",
  Kitsune: "Kitsune.webp",
  Leopard: "Leopard.webp",
  Light: "Light.webp",
  Love: "Love.webp",
  Sand: "Sand.webp",
  Quake: "Quake.webp",
  Rumble: "Rumble.webp",
  Shadow: "Shadow.webp",
  Spirit: "Spirit.webp",
  Magma: "Magma.webp",
  Mammoth: "Mammoth.webp",
  Blade: "Chop.webp"
};

// Helper para normalizar el nombre de la fruta (toma la parte antes del guion, primera letra mayúscula, resto minúsculas, sin espacios)
const normalizeFruitName = (name: string): string => {
  if (!name) return "";
  // Toma solo la parte antes del guion
  const base = name.split("-")[0];
  const trimmed = base.trim().replace(/\s+/g, "");
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

// --- CAMBIO 2: Función `getFruitImage` robusta con normalización ---
const getFruitImage = (fruitName: string): string => {
  const normalized = normalizeFruitName(fruitName);
  const imageName = FRUIT_IMAGE_MANIFEST[normalized];
  if (imageName) {
    return `/fruits/${imageName}`;
  }
  // Si no se encuentra una imagen, se devuelve un placeholder.
  return "https://placehold.co/32x32/cccccc/333333?text=?";
};

// El manejador de errores es una buena práctica como respaldo final.
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = "https://placehold.co/32x32/cccccc/333333?text=?";
};

// Interfaces para tipar los datos de la API
interface Fruit {
  name: string;
  price: number;
  onSale: boolean;
}

interface StockServer {
  sessionId: string;
  playerName: string;
  serverId: string;
  normalStock: Fruit[];
  mirageStock: Fruit[];
}

// --- CAMBIO 3: Componente reutilizable para mostrar cada fruta ---
// Esto evita la duplicación de código (principio DRY: Don't Repeat Yourself).
interface FruitRowProps {
  fruit: Fruit;
  isDark: boolean;
  priceColorClass: string;
}

const FruitRow: React.FC<FruitRowProps> = ({
  fruit,
  isDark,
  priceColorClass,
}) => (
  <div className="flex justify-between items-center py-2">
    <div className="flex items-center gap-3">
      <div className="relative w-8 h-8 flex-shrink-0">
        {/* CORRECCIÓN: Se reemplaza el componente `Image` de Next.js por una etiqueta `img` estándar para resolver el error de compilación. */}
        <img
          src={getFruitImage(fruit.name) || "/placeholder.svg"}
          alt={`${fruit.name} fruit`}
          width="32"
          height="32"
          className="rounded-md object-cover w-full h-full"
          onError={handleImageError}
        />
      </div>
      <span
        className={`font-medium transition-colors duration-300 ${
          isDark ? "text-slate-300" : "text-slate-700"
        }`}
      >
        {fruit.name}
      </span>
    </div>
    <span
      className={`font-semibold transition-colors duration-300 ${priceColorClass}`}
    >
      ${fruit.price.toLocaleString()}
    </span>
  </div>
);

// --- Componente Principal ---
export default function Home() {
  const [stock, setStock] = useState<StockServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [normalTimer, setNormalTimer] = useState(0);
  const [mirageTimer, setMirageTimer] = useState(0);
  const [lastCreatedAt, setLastCreatedAt] = useState<number | null>(null);

  // Función para formatear el tiempo restante
  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Leer createdAt de localStorage al iniciar
  useEffect(() => {
    const savedCreatedAt = localStorage.getItem("bloxfruits_createdAt");
    const savedNormalTimer = localStorage.getItem("bloxfruits_normalTimer");
    const savedMirageTimer = localStorage.getItem("bloxfruits_mirageTimer");
    const now = Date.now();

    if (savedCreatedAt && savedNormalTimer && savedMirageTimer) {
      const createdAtNum = Number(savedCreatedAt);
      const normalTimerNum = Number(savedNormalTimer);
      const mirageTimerNum = Number(savedMirageTimer);

      setLastCreatedAt(createdAtNum);

      const timeElapsed = now - createdAtNum;
      const normalLeft = Math.max(0, normalTimerNum - timeElapsed);
      const mirageLeft = Math.max(0, mirageTimerNum - timeElapsed);

      setNormalTimer(normalLeft);
      setMirageTimer(mirageLeft);
    } else {
      setNormalTimer(4 * 60 * 60 * 1000); // 4 horas
      setMirageTimer(2 * 60 * 60 * 1000); // 2 horas
    }
  }, []);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((e) => {
        setStock(e.data || []);
        if (e.data && e.data.length > 0) {
          const createdAt = e.data[0].createdAt;
          setLastCreatedAt(createdAt);
          localStorage.setItem("bloxfruits_createdAt", String(createdAt));
        }
      })
      .catch((error) => {
        console.error("Falló la carga de datos del stock:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (normalTimer <= 0) return;

    const interval = setInterval(() => {
      setNormalTimer((prev) => {
        const newValue = prev - 1000;
        if (newValue <= 0) {
          const resetValue = 4 * 60 * 60 * 1000;
          localStorage.setItem("bloxfruits_normalTimer", String(resetValue));
          localStorage.setItem("bloxfruits_createdAt", String(Date.now()));
          return resetValue;
        }
        localStorage.setItem("bloxfruits_normalTimer", String(newValue));
        localStorage.setItem("bloxfruits_createdAt", String(Date.now()));
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [normalTimer]);

  useEffect(() => {
    if (mirageTimer <= 0) return;

    const interval = setInterval(() => {
      setMirageTimer((prev) => {
        const newValue = prev - 1000;
        if (newValue <= 0) {
          const resetValue = 2 * 60 * 60 * 1000;
          localStorage.setItem("bloxfruits_mirageTimer", String(resetValue));
          localStorage.setItem("bloxfruits_createdAt", String(Date.now()));
          return resetValue;
        }
        localStorage.setItem("bloxfruits_mirageTimer", String(newValue));
        localStorage.setItem("bloxfruits_createdAt", String(Date.now()));
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mirageTimer]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 to-slate-800"
          : "bg-gradient-to-br from-slate-50 to-slate-100"
      }`}
    >
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <button
            onClick={toggleTheme}
            className={`absolute top-0 right-0 p-3 rounded-full transition-all duration-300 ${
              isDark
                ? "bg-slate-700 hover:bg-slate-600 text-yellow-400"
                : "bg-white hover:bg-slate-100 text-slate-700 shadow-lg"
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" />
              </svg>
            )}
          </button>

          <h1
            className={`text-4xl md:text-6xl font-bold mb-2 transition-colors duration-300 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Blox Fruits Stock
          </h1>
          <p
            className={`text-lg font-light transition-colors duration-300 ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Powered by BootsDev-X
          </p>
        </div>

        {/* Stock Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
          {/* Normal Stock Card */}
          <div
            className={`rounded-2xl shadow-lg border overflow-hidden transition-colors duration-300 ${
              isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            {/* Contador de 4 horas */}
            <div className="px-6 pt-4 pb-2 flex items-center gap-2">
              <span
                className={`text-xs font-semibold ${
                  isDark ? "text-green-300" : "text-green-700"
                }`}
              >
                Tiempo restante: {formatTime(normalTimer)}
              </span>
            </div>
            <div
              className={`px-6 py-4 transition-colors duration-300 ${
                isDark ? "bg-white/5" : "bg-slate-50"
              }`}
            >
              <h2
                className={`text-xl font-semibold flex items-center gap-2 transition-colors duration-300 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                Normal Stock
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div
                    className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                      isDark ? "border-white" : "border-slate-900"
                    }`}
                  ></div>
                </div>
              ) : stock.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  No hay datos disponibles
                </p>
              ) : (
                <div className="space-y-6 max-h-80 overflow-y-auto px-1">
                  {stock.map((server) => (
                    <div
                      key={server.serverId}
                      className={`border-b last:border-b-0 pb-4 last:pb-0 transition-colors duration-300 ${
                        isDark ? "border-slate-700" : "border-slate-200"
                      }`}
                    >
                      <div
                        className={`text-xs font-medium mb-3 uppercase tracking-wide ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        Server: {server.playerName}
                      </div>
                      {server.normalStock.length === 0 ? (
                        <p className="text-slate-400 italic">
                          Sin stock disponible
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {server.normalStock.map((fruit) => (
                            <FruitRow
                              key={`${server.serverId}-${fruit.name}`}
                              fruit={fruit}
                              isDark={isDark}
                              priceColorClass={
                                isDark ? "text-green-400" : "text-green-600"
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mirage Stock Card */}
          <div
            className={`rounded-2xl shadow-lg border overflow-hidden transition-colors duration-300 ${
              isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            {/* Contador de 2 horas */}
            <div className="px-6 pt-4 pb-2 flex items-center gap-2">
              <span
                className={`text-xs font-semibold ${
                  isDark ? "text-purple-300" : "text-purple-700"
                }`}
              >
                Tiempo restante: {formatTime(mirageTimer)}
              </span>
            </div>
            <div
              className={`px-6 py-4 transition-colors duration-300 ${
                isDark ? "bg-white/5" : "bg-slate-50"
              }`}
            >
              <h2
                className={`text-xl font-semibold flex items-center gap-2 transition-colors duration-300 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                Mirage Stock
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div
                    className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                      isDark ? "border-purple-400" : "border-purple-600"
                    }`}
                  ></div>
                </div>
              ) : stock.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  No hay datos disponibles
                </p>
              ) : (
                <div className="space-y-6 max-h-80 overflow-y-auto px-1">
                  {stock.map((server) => (
                    <div
                      key={server.serverId}
                      className={`border-b last:border-b-0 pb-4 last:pb-0 transition-colors duration-300 ${
                        isDark ? "border-slate-700" : "border-slate-200"
                      }`}
                    >
                      <div
                        className={`text-xs font-medium mb-3 uppercase tracking-wide ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        Server: {server.playerName}
                      </div>
                      {server.mirageStock.length === 0 ? (
                        <p className="text-slate-400 italic">
                          Sin stock disponible
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {server.mirageStock.map((fruit) => (
                            <FruitRow
                              key={`${server.serverId}-${fruit.name}`}
                              fruit={fruit}
                              isDark={isDark}
                              priceColorClass={
                                isDark ? "text-purple-400" : "text-purple-600"
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <a
            href="https://youtube.com/@bootsdev-x?si=baIInBjNWRROUsjt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Follow BootsDev-X on YouTube
          </a>
        </div>
      </div>
    </div>
  );
}
