import { useMemo, useState, type ReactNode } from 'react'
import { readSettings, writeSettings, type Settings } from '@/lib/storage'
import type { Currency } from '@/lib/types'
import { SettingsContext } from './settings-context'

/** App settings, kept in browser storage so they survive a reload. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(readSettings)

  const value = useMemo(
    () => ({
      settings,
      setCurrency: (currency: Currency) => {
        const next = { ...settings, currency }
        setSettings(next)
        writeSettings(next)
      },
    }),
    [settings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
