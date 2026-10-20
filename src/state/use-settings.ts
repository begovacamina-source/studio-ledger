import { useContext } from 'react'
import { SettingsContext } from './settings-context'

export function useSettings() {
  const value = useContext(SettingsContext)
  if (!value) throw new Error('useSettings must be used inside SettingsProvider')
  return value
}

/** The app currency. Formatting only: amounts are never converted. */
export function useCurrency() {
  return useSettings().settings.currency
}
