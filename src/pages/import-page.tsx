import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { MatchStep } from '@/components/import/match-step'
import { PreviewStep } from '@/components/import/preview-step'
import { ResultStep } from '@/components/import/result-step'
import { UploadStep } from '@/components/import/upload-step'
import { Card, CardContent } from '@/components/ui/card'
import {
  autoMatch,
  suggestDateFormat,
  suggestDecimalSeparator,
  validateRows,
  type ImportOutcome,
  type ImportSettings,
  type ParsedFile,
  type RecordType,
} from '@/lib/csv-import'
import { cn } from '@/lib/utils'
import { useLedger } from '@/state/use-ledger'
import { useCurrency } from '@/state/use-settings'

const STEPS = ['Upload', 'Match columns', 'Preview', 'Done'] as const
type Step = (typeof STEPS)[number]

function Steps({ current }: { current: Step }) {
  const index = STEPS.indexOf(current)
  return (
    <ol className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
      {STEPS.map((step, i) => (
        <li
          key={step}
          aria-current={i === index ? 'step' : undefined}
          className={cn(
            'flex items-center gap-2',
            i === index ? 'font-medium text-foreground' : 'text-muted-foreground',
          )}
        >
          <span
            className={cn(
              'flex size-6 items-center justify-center rounded-full border text-xs tabular-nums',
              i === index && 'border-primary bg-primary text-primary-foreground',
            )}
          >
            {i + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  )
}

export function ImportPage() {
  const currency = useCurrency()
  const { ledger, importRecords } = useLedger()
  const [step, setStep] = useState<Step>('Upload')
  const [type, setType] = useState<RecordType>('invoices')
  const [file, setFile] = useState<{ parsed: ParsedFile; name: string } | null>(null)
  const [settings, setSettings] = useState<ImportSettings | null>(null)
  const [suggested, setSuggested] = useState<Pick<ImportSettings, 'dateFormat' | 'decimal'> | null>(null)
  const [outcome, setOutcome] = useState<ImportOutcome | null>(null)

  const result = useMemo(
    () => (file && settings && step === 'Preview' ? validateRows(file.parsed, settings, ledger) : null),
    [file, settings, step, ledger],
  )

  function handleFileRead(parsed: ParsedFile, name: string) {
    const mapping = autoMatch(parsed.headers, type)
    const guess = {
      dateFormat: suggestDateFormat(parsed, mapping, type, currency),
      decimal: suggestDecimalSeparator(parsed, mapping, type),
    }
    setFile({ parsed, name })
    setSuggested(guess)
    setSettings({ type, mapping, ...guess })
    setStep('Match columns')
  }

  function startOver() {
    setFile(null)
    setSettings(null)
    setOutcome(null)
    setStep('Upload')
  }

  function handleImport() {
    if (!result) return
    const done = importRecords(type, result)
    setOutcome(done)
    setStep('Done')
    toast.success(`${done.imported} ${type === 'invoices' ? 'invoices' : 'expenses'} imported`)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Import CSV</h1>
        <Steps current={step} />
      </div>
      <Card>
        <CardContent>
          {file && step !== 'Upload' && step !== 'Done' && (
            <p className="mb-4 text-sm text-muted-foreground">
              {file.name} · {file.parsed.rows.length.toLocaleString('en-US')} rows ·{' '}
              {type === 'invoices' ? 'Invoices' : 'Expenses'}
            </p>
          )}
          {step === 'Upload' && <UploadStep type={type} onTypeChange={setType} onFileRead={handleFileRead} />}
          {step === 'Match columns' && file && settings && suggested && (
            <MatchStep
              file={file.parsed}
              settings={settings}
              suggested={suggested}
              onChange={setSettings}
              onBack={startOver}
              onNext={() => setStep('Preview')}
            />
          )}
          {step === 'Preview' && settings && result && (
            <PreviewStep
              settings={settings}
              result={result}
              onBack={() => setStep('Match columns')}
              onCancel={startOver}
              onImport={handleImport}
            />
          )}
          {step === 'Done' && outcome && (
            <ResultStep type={type} outcome={outcome} onImportAnother={startOver} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
