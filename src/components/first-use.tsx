import { FileUpIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { LoadSampleButton } from '@/components/load-sample-button'
import { Button } from '@/components/ui/button'

/** The first-use empty state: what's missing, and the ways to get records in. */
export function FirstUse({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-12 text-center">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">
          Add records yourself, import a CSV, or try Studio Ledger with fictional sample data.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {children}
        <Button variant="outline" asChild>
          <Link to="/import">
            <FileUpIcon /> Import CSV
          </Link>
        </Button>
        <LoadSampleButton />
      </div>
    </div>
  )
}
