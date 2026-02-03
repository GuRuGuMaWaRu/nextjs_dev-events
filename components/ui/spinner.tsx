import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

type SpinnerProps = {
  className?: string
}

const Spinner = ({ className }: SpinnerProps) => {
  return <Loader2Icon className={cn("size-4 animate-spin", className)} />
}

export { Spinner }
