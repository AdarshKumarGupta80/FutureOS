import React from "react";
import { ErrorState } from "./ui/State";

type State = { error?: Error };

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <div className="p-6"><ErrorState message={this.state.error.message} onRetry={() => this.setState({ error: undefined })} /></div>;
    }
    return this.props.children;
  }
}
