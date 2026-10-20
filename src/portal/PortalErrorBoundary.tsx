import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { onError: (error: unknown) => void; children: ReactNode }
type State = { failed: boolean }

/** Any rendering error inside the portal falls back to the static artwork; the site keeps working. */
export class PortalErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    if (import.meta.env.DEV) console.warn('[portal] falling back to static artwork', error, info)
    this.props.onError(error)
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
