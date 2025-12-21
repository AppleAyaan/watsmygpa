export interface StoredGPAData {
  gpa: number
  courses: any[]
  program?: string
  year?: string
  timestamp: number
}

const STORAGE_KEY = "uw-gpa-data"

export function saveGPAData(data: Partial<StoredGPAData>): void {
  const existing = getGPAData()
  const updated = { ...existing, ...data }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function getGPAData(): StoredGPAData | null {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function updateUserInfo(program: string, year: string): void {
  saveGPAData({ program, year })
}

export function clearGPAData(): void {
  localStorage.removeItem(STORAGE_KEY)
}
