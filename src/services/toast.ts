export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn([...this.toasts]));
  }

  show(type: ToastType, title: string, message: string, duration = 4000) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const item: ToastItem = { id, type, title, message, duration };
    this.toasts.push(item);
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  success(message: string, title = 'Thành công') {
    this.show('success', title, message);
  }

  error(message: string, title = 'Lỗi') {
    this.show('error', title, message, 6000);
  }

  warning(message: string, title = 'Cảnh báo') {
    this.show('warning', title, message, 5000);
  }

  info(message: string, title = 'Thông báo') {
    this.show('info', title, message);
  }
}

export const toast = new ToastManager();
