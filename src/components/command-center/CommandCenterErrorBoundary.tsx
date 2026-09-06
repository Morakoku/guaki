'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { lastKnownStateMessage } from '../../lib/command_center_hardening.mjs';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class CommandCenterErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Browser diagnostics retain the details; the coordination UI never renders them.
  }

  retry = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return <section className="command-center"><div className="command-content"><div className="command-panel command-stack-panel"><h2>Command Center unavailable</h2><p className="command-muted">{lastKnownStateMessage()}</p><button className="command-inline-button command-inline-button-primary" type="button" onClick={this.retry}>Retry Command Center</button></div></div></section>;
    }
    return this.props.children;
  }
}