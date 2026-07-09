"use client"

import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Home } from "lucide-react"
import Link from "next/link"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center space-y-4 max-w-sm mx-auto px-4">
            <div className="text-5xl font-bold text-destructive/30">!</div>
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              This tool encountered an error. Please try again.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={() => this.setState({ hasError: false })}
              >
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Try Again
              </Button>
              <Link href="/tools">
                <Button variant="outline">
                  <Home className="h-4 w-4 mr-1.5" />
                  All Tools
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
