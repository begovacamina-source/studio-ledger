import * as React from "react"

const MOBILE_BREAKPOINT = 768
/** Tailwind's lg. The invoice list has the most columns, so it switches to a card list here. */
export const LG_BREAKPOINT = 1024

/** True while the window is narrower than `breakpoint` px. */
export function useIsBelow(breakpoint: number) {
  // Read the width straight away, so narrow screens never render the wide layout first.
  const [isBelow, setIsBelow] = React.useState(() => window.innerWidth < breakpoint)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = () => {
      setIsBelow(window.innerWidth < breakpoint)
    }
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [breakpoint])

  return isBelow
}

/** Below Tailwind's md: phones. */
export function useIsMobile() {
  return useIsBelow(MOBILE_BREAKPOINT)
}
