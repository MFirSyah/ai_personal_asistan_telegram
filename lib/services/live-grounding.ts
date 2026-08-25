export interface LiveWeatherInfo {
  city: string;
  temperatureC: number;
  weatherDescription: string;
  isRainy: boolean;
  windSpeedKmh: number;
  humidityPct: number;
  advice: string;
}

export const COORDINATES: Record<string, { lat: number; lng: number; name: string }> = {
  malang: { lat: -7.9797, lng: 112.6304, name: 'Malang, Jawa Timur' },
  dieng: { lat: -7.2062, lng: 109.9075, name: 'Dataran Tinggi Dieng, Wonosobo' },
  surabaya: { lat: -7.2575, lng: 112.7521, name: 'Surabaya, Jawa Timur' },
  jakarta: { lat: -6.2088, lng: 106.8456, name: 'Jakarta' },
  batu: { lat: -7.8712, lng: 112.5273, name: 'Kota Batu, Jawa Timur' },
  bromo: { lat: -7.9425, lng: 112.9530, name: 'Gunung Bromo, Jawa Timur' },
};

export const OFFICIAL_FACTS = {
  fuelPrices: {
    pertalite: 10000, // Pertalite (RON 90) - Subsidi
    biosolar: 6800,   // Biosolar / Solar (CN 48) - Subsidi
    pertamax: 15950,  // Pertamax (RON 92)
    pertamaxGreen: 16600, // Pertamax Green (RON 95)
    pertamaxTurbo: 18300, // Pertamax Turbo (RON 98)
    dexlite: 19700,   // Dexlite (CN 51)
    pertaminaDex: 21150, // Pertamina Dex (CN 53)
  },
  fuelPricesEastJavaString: `DAFTAR HARGA RESMI BBM PERTAMINA (JAWA TIMUR):
• Pertalite (RON 90): Rp 10.000 / liter (Subsidi)
• Biosolar / Solar (CN 48): Rp 6.800 / liter (Subsidi)
• Pertamax (RON 92): Rp 15.950 / liter
• Pertamax Green (RON 95): Rp 16.600 / liter
• Pertamax Turbo (RON 98): Rp 18.300 / liter
• Dexlite (CN 51): Rp 19.700 / liter
• Pertamina Dex (CN 53): Rp 21.150 / liter`,

  tollRates: {
    malangSurabaya: 54500, // Pandaan-Malang
    soloMalang: 320000,
  },
  firmanProfile: {
    vehicle: 'Honda Beat FI (Kapasitas Tangki 4.2 Liter, Konsumsi BBM ~48-52 KM/Liter)',
    bankLoan: 'Bank Jago (Cicilan Rp 67.940/bulan autodebet setiap tanggal 20)',
    activeWallets: ['Cash Kertas', 'Gopay', 'SeaBank', 'Bank Jago'],
    activePlan: 'Trip Ke Dieng (Pagu Anggaran Rp 1.040.000, Rencana 29-30 Agustus 2026)',
    academic: 'Mahasiswa Tingkat Akhir (Skripsi Bab 4-5 dengan Dosen Pembimbing Pak Sulthan)',
    localHotspots: 'Kota Malang (Suhat, Dinoyo, Sawojajar, Ijen, Tunggulmas, Sawojajar)',
  }
};

export async function fetchLiveWeather(locationKey = 'malang'): Promise<LiveWeatherInfo | null> {
  const coord = COORDINATES[locationKey.toLowerCase()] || COORDINATES.malang;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coord.lat}&longitude=${coord.lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FJakarta`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (!res.ok) return null;

    const data = await res.json();
    const current = data.current;
    if (!current) return null;

    const temp = Math.round(current.temperature_2m);
    const humidity = Math.round(current.relative_humidity_2m);
    const wind = Math.round(current.wind_speed_10m);
    const code = current.weather_code;

    let desc = 'Cerah Berawan';
    let isRainy = false;
    let advice = 'Cuaca cerah mendukung untuk narik Gojek atau beraktivitas luar ruangan.';

    if (code >= 51 && code <= 67) {
      desc = 'Gerimis / Hujan Ringan';
      isRainy = true;
      advice = 'Disarankan menyiapkan jas hujan setelan dan sarung sepatu anti air.';
    } else if (code >= 71 && code <= 82) {
      desc = 'Hujan Deras';
      isRainy = true;
      advice = 'Hati-hati jalan licin dan genangan air, utamakan keselamatan berkendara.';
    } else if (code >= 95) {
      desc = 'Hujan Disertai Petir';
      isRainy = true;
      advice = 'Sebaiknya berteduh sejenak di warung/tempat aman hingga petir reda.';
    } else if (temp <= 15) {
      desc = 'Suhu Dingin Berkabut';
      advice = 'Suhu sangat dingin, kenakan jaket windproof tebal dan sarung tangan.';
    }

    return {
      city: coord.name,
      temperatureC: temp,
      weatherDescription: desc,
      isRainy,
      windSpeedKmh: wind,
      humidityPct: humidity,
      advice,
    };
  } catch (err) {
    console.warn(`[LiveGrounding] Weather fetch timeout or failed for ${locationKey}:`, err);
    return null;
  }
}
