'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';
import { dialogStackManager } from './dialogStackManager';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]):not([aria-hidden="true"]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  maxWidth = 'md',
  footer,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const pointerDownOnBackdrop = useRef(false);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [mounted, setMounted] = useState(false);

  const uniqueId = useId();
  const titleId = `modal-title-${uniqueId}`;
  const descId = `modal-desc-${uniqueId}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Register with Dialog Stack Manager (stable callback reference)
  useEffect(() => {
    if (!isOpen || !mounted) return;
    const unregister = dialogStackManager.registerDialog(
      uniqueId,
      () => onCloseRef.current(),
      modalRef.current
    );
    return () => unregister();
  }, [isOpen, mounted, uniqueId]);

  useEffect(() => {
    if (isOpen && mounted && modalRef.current) {
      dialogStackManager.updateDialogElement(uniqueId, modalRef.current, () => onCloseRef.current());
    }
  }, [isOpen, mounted, uniqueId]);

  // 2. Keyboard Focus Trap
  useEffect(() => {
    if (!isOpen || !mounted) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!dialogStackManager.isTopDialog(uniqueId)) return;

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length === 0) {
          e.preventDefault();
          modalRef.current.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const isFocusInside = modalRef.current.contains(document.activeElement);

        if (!isFocusInside) {
          e.preventDefault();
          first.focus();
          return;
        }

        if (e.shiftKey) {
          if (document.activeElement === first || document.activeElement === modalRef.current) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    const timer = setTimeout(() => {
      if (modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 16);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedElement.current?.focus?.();
    };
  }, [isOpen, mounted, uniqueId]);

  if (!isOpen || !mounted) return null;

  const maxWidthStyles = {
    sm: 'max-w-xs',
    md: 'max-w-sm',
    lg: 'max-w-md',
    xl: 'max-w-lg',
  }[maxWidth];

  const dialogRoot = document.getElementById('dialog-root');
  if (!dialogRoot) return null;

  const modalJsx = (
    <div
      role="presentation"
      onPointerDown={(e) => {
        pointerDownOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (pointerDownOnBackdrop.current && e.target === e.currentTarget) {
          onClose();
        }
        pointerDownOnBackdrop.current = false;
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 animate-fade-in"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`relative w-full ${maxWidthStyles} rounded-lg bg-[#0e131d] border border-[#263348] shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex flex-col max-h-[90vh] max-h-[90dvh] overflow-hidden focus:outline-none overscroll-contain`}
      >
        {/* Top Gold/Cyan Accent Filament */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400/80 to-transparent shrink-0" aria-hidden="true" />

        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b] bg-gradient-to-b from-[#161f2e] to-[#101723] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && <div className="shrink-0 text-amber-400" aria-hidden="true">{icon}</div>}
            <div className="min-w-0">
              <h2 id={titleId} className="text-sm font-black tracking-wide text-slate-100 truncate">
                {title}
              </h2>
              {description && (
                <p id={descId} className="text-[11px] text-slate-400 truncate mt-0.5">
                  {description}
                </p>
              )}
            </div>
          </div>

          <IconButton
            type="button"
            aria-label="Close dialog"
            size="sm"
            onClick={onClose}
            data-tutorial-target="modal-close-btn"
            className="text-slate-400 hover:text-slate-100 shrink-0 ml-2"
          >
            <X size={16} aria-hidden="true" />
          </IconButton>
        </header>

        {/* Body content with scroll containment */}
        <div className="flex-1 overflow-y-auto p-3.5 overscroll-contain text-xs text-slate-200 bg-[#0a0e17]">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <footer className="px-4 py-3 border-t border-[#1e293b] bg-[#0d121c] shrink-0">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );

  return createPortal(modalJsx, dialogRoot);
};

export default ModalShell;
