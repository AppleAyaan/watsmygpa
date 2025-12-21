// Anonymized peer statistics (pre-seeded sample data)
// In a real app, this would aggregate from local storage across sessions

interface PeerStats {
  min: number
  max: number
  average: number
  sampleSize: number
}

const peerData: { [key: string]: PeerStats } = {
  "Computer Science-1A": { min: 2.5, max: 4.0, average: 3.4, sampleSize: 127 },
  "Computer Science-1B": { min: 2.3, max: 4.0, average: 3.3, sampleSize: 115 },
  "Computer Science-2A": { min: 2.4, max: 4.0, average: 3.5, sampleSize: 98 },
  "Computer Science-2B": { min: 2.6, max: 4.0, average: 3.6, sampleSize: 94 },
  "Computer Science-3A": { min: 2.7, max: 4.0, average: 3.7, sampleSize: 76 },
  "Computer Science-3B": { min: 2.8, max: 4.0, average: 3.7, sampleSize: 71 },
  "Computer Science-4A": { min: 2.9, max: 4.0, average: 3.8, sampleSize: 58 },
  "Computer Science-4B": { min: 3.0, max: 4.0, average: 3.8, sampleSize: 52 },

  "Software Engineering-1A": { min: 2.6, max: 4.0, average: 3.5, sampleSize: 89 },
  "Software Engineering-1B": { min: 2.5, max: 4.0, average: 3.4, sampleSize: 84 },
  "Software Engineering-2A": { min: 2.7, max: 4.0, average: 3.6, sampleSize: 78 },
  "Software Engineering-2B": { min: 2.8, max: 4.0, average: 3.7, sampleSize: 73 },
  "Software Engineering-3A": { min: 2.9, max: 4.0, average: 3.8, sampleSize: 65 },
  "Software Engineering-3B": { min: 3.0, max: 4.0, average: 3.8, sampleSize: 61 },
  "Software Engineering-4A": { min: 3.1, max: 4.0, average: 3.9, sampleSize: 54 },
  "Software Engineering-4B": { min: 3.2, max: 4.0, average: 3.9, sampleSize: 49 },

  "Mathematics-1A": { min: 2.4, max: 4.0, average: 3.3, sampleSize: 142 },
  "Mathematics-1B": { min: 2.3, max: 4.0, average: 3.2, sampleSize: 134 },
  "Mathematics-2A": { min: 2.5, max: 4.0, average: 3.4, sampleSize: 118 },
  "Mathematics-2B": { min: 2.6, max: 4.0, average: 3.5, sampleSize: 112 },

  "Electrical Engineering-1A": { min: 2.3, max: 4.0, average: 3.2, sampleSize: 103 },
  "Electrical Engineering-1B": { min: 2.2, max: 4.0, average: 3.1, sampleSize: 97 },
  "Electrical Engineering-2A": { min: 2.4, max: 4.0, average: 3.3, sampleSize: 89 },
  "Electrical Engineering-2B": { min: 2.5, max: 4.0, average: 3.4, sampleSize: 84 },
}

export function getPeerStats(program: string, year: string): PeerStats {
  const key = `${program}-${year}`

  // Return specific stats if available, otherwise return default
  return (
    peerData[key] ?? {
      min: 2.0,
      max: 4.0,
      average: 3.3,
      sampleSize: 50,
    }
  )
}
