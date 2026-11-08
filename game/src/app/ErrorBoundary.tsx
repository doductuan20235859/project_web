import { Component, type PropsWithChildren } from 'react';
import { Button } from '../shared/ui/Button';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-screen">
          <section className="notice-card notice-card--error" role="alert">
            <p className="eyebrow">Một chút gián đoạn</p>
            <h1>Trang nhật ký chưa thể hiển thị.</h1>
            <p>Hãy tải lại trang để tiếp tục từ tiến trình đã lưu.</p>
            <Button onClick={() => window.location.reload()}>Tải lại trang</Button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
