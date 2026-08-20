type DialogCloseCallback = () => void;

interface DialogEntry {
  id: string;
  onClose: DialogCloseCallback;
  element?: HTMLElement | null;
}

class DialogStackManager {
  private stack: DialogEntry[] = [];
  private originalBodyOverflow = '';
  private isListenerAttached = false;

  public registerDialog(
    id: string,
    onClose: DialogCloseCallback,
    element?: HTMLElement | null
  ): () => void {
    // If opening first dialog, lock body scroll and set background inert
    if (this.stack.length === 0 && typeof document !== 'undefined') {
      this.originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      this.attachGlobalListener();
      this.updateBackgroundInert(true);
    }

    // Push dialog to top of stack or update existing entry
    const existingIdx = this.stack.findIndex((e) => e.id === id);
    if (existingIdx >= 0) {
      this.stack[existingIdx] = { id, onClose, element };
    } else {
      this.stack.push({ id, onClose, element });
    }
    this.updateDialogStackA11y();

    // Return unregister callback
    return () => {
      this.stack = this.stack.filter((entry) => entry.id !== id);
      this.updateDialogStackA11y();

      // If closing last dialog, restore body scroll and remove background inert
      if (this.stack.length === 0 && typeof document !== 'undefined') {
        document.body.style.overflow = this.originalBodyOverflow;
        this.detachGlobalListener();
        this.updateBackgroundInert(false);
      }
    };
  }

  public updateDialogElement(id: string, element: HTMLElement | null, onClose?: DialogCloseCallback) {
    const entry = this.stack.find((e) => e.id === id);
    if (entry) {
      entry.element = element;
      if (onClose) entry.onClose = onClose;
      this.updateDialogStackA11y();
    }
  }

  public isTopDialog(id: string): boolean {
    if (this.stack.length === 0) return false;
    return this.stack[this.stack.length - 1].id === id;
  }

  private updateBackgroundInert(isInert: boolean) {
    if (typeof document === 'undefined') return;
    const appRoot = document.getElementById('app-root');
    if (appRoot) {
      appRoot.inert = isInert;
    }
  }

  private updateDialogStackA11y() {
    if (typeof document === 'undefined') return;
    const topIndex = this.stack.length - 1;

    this.stack.forEach((entry, idx) => {
      if (!entry.element) return;
      const isTop = idx === topIndex;
      if (isTop) {
        entry.element.inert = false;
      } else {
        entry.element.inert = true;
      }
    });
  }

  private attachGlobalListener() {
    if (this.isListenerAttached || typeof document === 'undefined') return;
    this.isListenerAttached = true;
    document.addEventListener('keydown', this.handleGlobalKeyDown);
  }

  private detachGlobalListener() {
    if (!this.isListenerAttached || typeof document === 'undefined') return;
    this.isListenerAttached = false;
    document.removeEventListener('keydown', this.handleGlobalKeyDown);
  }

  private handleGlobalKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.stack.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      const topEntry = this.stack[this.stack.length - 1];
      topEntry.onClose();
    }
  };
}

export const dialogStackManager = new DialogStackManager();
