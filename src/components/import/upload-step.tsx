import { DownloadIcon, FileUpIcon } from 'lucide-react'
import { useId, useRef, useState, type DragEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { checkFile, parseCsv, type ParsedFile, type RecordType } from '@/lib/csv-import'
import { cn } from '@/lib/utils'

const SAMPLES: Record<RecordType, string> = {
  invoices: '/samples/studio-ledger-invoices-sample.csv',
  expenses: '/samples/studio-ledger-expenses-sample.csv',
}

const TYPES: { value: RecordType; label: string; hint: string }[] = [
  { value: 'invoices', label: 'Invoices', hint: 'Invoice number, client, amount, dates' },
  { value: 'expenses', label: 'Expenses', hint: 'Date, amount, category' },
]

export function UploadStep({
  type,
  onTypeChange,
  onFileRead,
}: {
  type: RecordType
  onTypeChange: (type: RecordType) => void
  onFileRead: (file: ParsedFile, fileName: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const errorId = useId()
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  async function read(file: File | undefined) {
    if (!file) return
    const problem = checkFile(file)
    if (problem) {
      setError(problem)
      return
    }
    const { file: parsed, error: parseError } = parseCsv(await file.text())
    if (!parsed) {
      setError(parseError ?? 'The file could not be read.')
      return
    }
    setError(null)
    onFileRead(parsed, file.name)
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    void read(event.dataTransfer.files[0])
  }

  return (
    <div className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">What are you importing?</legend>
        <RadioGroup
          value={type}
          onValueChange={(value) => onTypeChange(value as RecordType)}
          className="grid gap-3 sm:grid-cols-2"
        >
          {TYPES.map((t) => (
            <Label
              key={t.value}
              htmlFor={`type-${t.value}`}
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 font-normal has-data-[state=checked]:border-action"
            >
              <RadioGroupItem id={`type-${t.value}`} value={t.value} className="mt-0.5" />
              <span className="grid gap-1">
                <span className="font-medium">{t.label}</span>
                <span className="text-sm text-muted-foreground">{t.hint}</span>
              </span>
            </Label>
          ))}
        </RadioGroup>
      </fieldset>

      <div className="space-y-2">
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center transition-colors hover:bg-muted/50 has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50',
            dragging && 'border-primary bg-muted/50',
            error && 'border-destructive',
          )}
        >
          <FileUpIcon className="size-6 text-muted-foreground" aria-hidden />
          <span className="font-medium">Drop a CSV file here, or choose one</span>
          <span className="text-sm text-muted-foreground">.csv only, up to 5 MB and 5,000 rows</span>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? true : undefined}
            onChange={(e) => {
              void read(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </label>
        {error && (
          <p id={errorId} role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Not sure about the format?</span>
        <Button variant="outline" size="sm" asChild>
          <a href={SAMPLES[type]} download>
            <DownloadIcon /> Download a sample {type === 'invoices' ? 'invoices' : 'expenses'} CSV
          </a>
        </Button>
      </div>
    </div>
  )
}
