'use client';

import { useState, useRef, useEffect } from 'react';

export default function ChatInput({
  onSend,
  onStop,
  isSending = false,
  disabled = false,
  placeholder = 'Ask about your expenses...',
  maxRows = 4,
}) {
  const [value,      setValue]      = useState('');
  const [focused,    setFocused]    = useState(false);
  const [attachment, setAttachment] = useState(null); // { file, previewUrl }
  const textareaRef  = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 20;
    const paddingY   = 20;
    const maxHeight  = lineHeight * maxRows + paddingY;
    el.style.height    = Math.min(el.scrollHeight, maxHeight) + 'px';
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [value, maxRows]);

  useEffect(() => {
    return () => {
      if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    };
  }, [attachment]);

  const canSend = (value.trim().length > 0 || attachment) && !disabled && !isSending;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setAttachment({ file, previewUrl });
    e.target.value = '';
  };

  const removeAttachment = () => {
    if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    setAttachment(null);
  };

  const handleSend = () => {
    if (!canSend) return;
    onSend(value.trim(), attachment?.file || null);
    setValue('');
    setAttachment(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      borderTop: '1px solid var(--glass-border)',
      background: 'linear-gradient(180deg, rgba(255,228,190,0.85) 0%, rgba(255,242,220,0.95) 100%)',
    }}>
      {/* ── Attachment preview chip ── */}
      {attachment && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px 0' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--lw-surface-alt)',
            border: '1px solid var(--glass-border)',
            borderRadius: '10px',
            padding: '6px 10px',
            maxWidth: '100%',
          }}>
            <img
              src={attachment.previewUrl}
              alt="receipt"
              style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
            <span style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '11px',
              color: 'var(--lw-text)',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '180px',
            }}>
              {attachment.file.name}
            </span>
            <button
              onClick={removeAttachment}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lw-muted)', fontSize: '16px', lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
            >×</button>
          </div>
        </div>
      )}

      {/* ── Input row ── */}
      <div style={{ padding: '10px 12px', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Paperclip button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending || disabled}
          title="Attach receipt image"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: attachment ? 'var(--lw-accent)' : 'var(--lw-surface-alt)',
            border: '1px solid var(--glass-border)',
            cursor: isSending || disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s',
            opacity: isSending || disabled ? 0.5 : 1,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke={attachment ? 'var(--lw-dark)' : 'var(--lw-muted)'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
        </button>

        {/* Text area */}
        <div style={{
          flex: 1,
          position: 'relative',
          borderRadius: '10px',
          border: `1px solid ${focused ? 'var(--lw-accent)' : 'var(--glass-border)'}`,
          transition: 'border-color 0.15s',
          background: 'var(--lw-surface-alt)',
        }}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={attachment
              ? 'Which folder? e.g. "Admin Expense" or "create VIP Preparation folder"'
              : placeholder}
            disabled={disabled || isSending}
            rows={1}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              padding: '10px 14px',
              color: disabled ? 'var(--lw-muted)' : 'var(--lw-text)',
              fontFamily: "'Manrope', sans-serif",
              fontSize: '13px',
              lineHeight: '20px',
              display: 'block',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Send / Stop */}
        <button
          onClick={isSending ? onStop : handleSend}
          disabled={isSending ? false : !canSend}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: isSending ? 'var(--lw-earth)' : canSend ? 'var(--lw-accent)' : 'var(--lw-surface-alt)',
            border: '1px solid var(--glass-border)',
            cursor: isSending || canSend ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s',
            boxShadow: canSend && !isSending ? '0 6px 14px rgba(255,179,71,0.28)' : 'none',
          }}
        >
          {isSending ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lw-white)" strokeWidth="2.5" strokeLinecap="round">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={canSend ? 'var(--lw-dark)' : 'var(--lw-muted)'}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"/>
              <polyline points="5 12 12 5 19 12"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}