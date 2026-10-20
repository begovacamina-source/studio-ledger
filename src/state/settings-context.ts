import { createContext } from 'react'
import type { Settings } from '@/lib/storage'
import type { Currency } from '@/lib/types'

export interface SettingsContextValue {
  settings: Settings
  setCurrency: (currency: Currency) => void
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)
