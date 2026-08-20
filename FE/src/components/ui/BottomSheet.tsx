'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';
import { dialogStackManager } from './dialogStackManager';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]):not([aria-hidden="true"]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const pointerDownOnBackdrop = useRef(false);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [mounted, setMounted] = useState(false);

  const uniqueId = useId();
  const titleId = `sheet-title-${uniqueId}`;
  const descId = `sheet-desc-${uniqueId}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Register with Dialog Stack Manager (stable callback reference)
  useEffect(() => {
    if (!isOpen || !mounted) return;
    const unregister = dialogStackManager.registerDialog(
      uniqueId,
      () => onCloseRef.current(),
      sheetRef.current
    );
    return () => unregister();
  }, [isOpen, mounted, uniqueId]);

  useEffect(() => {
    if (isOpen && mounted && sheetRef.current) {
      dialogStackManager.updateDialogElement(uniqueId, sheetRef.current, () => onCloseRef.current());
    }
  }, [isOpen, mounted, uniqueId]);

  // 2. Keyboard Focus Trap
  useEffect(() => {
    if (!isOpen || !mounted) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!dialogStackManager.isTopDialog(uniqueId)) return;

      if (e.key === 'Tab' && sheetRef.current) {
        const focusable = Array.from(
          sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length === 0) {
          e.preventDefault();
          sheetRef.current.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const isFocusInside = sheetRef.current.contains(document.activeElement);

        if (!isFocusInside) {
          e.preventDefault();
          first.focus();
          return;
        }

        if (e.shiftKey) {
          if (document.activeElement === first || document.activeElement === sheetRef.current) {
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
      if (sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          sheetRef.current.focus();
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

  const dialogRoot = document.getElementById('dialog-root');
  if (!dialogRoot) return null;

  const sheetJsx = (
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className="w-full max-w-md rounded-t-xl bg-[#0e131d] border-t border-x border-[#263348] shadow-[0_-8px_32px_rgba(0,0,0,0.85)] flex flex-col max-h-[85vh] max-h-[85dvh] overflow-hidden focus:outline-none overscroll-contain pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        {/* Grab Handle */}
        <div className="w-10 h-1 bg-slate-700/80 rounded-full mx-auto mt-2.5 mb-1 shrink-0" aria-hidden="true" />

        {/* Header */}
        <header className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e293b] bg-gradient-to-b from-[#161f2e] to-[#101723] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
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
            aria-label="Close sheet"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 shrink-0 ml-2"
          >
            <X size={16} aria-hidden="true" />
          </IconButton>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3.5 overscroll-contain text-xs text-slate-200 bg-[#0a0e17]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <footer className="px-4 py-3 border-t border-[#1e293b] bg-[#0d121c] shrink-0">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );

  return createPortal(sheetJsx, dialogRoot);
};

export default BottomSheet;
