"use client";

import { useState } from "react";
import type { ChangeEvent, FocusEvent, ReactNode } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import TextField from "./TextField";

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  name?: string;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  autoFocus?: boolean;
  id?: string;
  icon?: LucideIcon;
  labelAccessory?: ReactNode;
};

export default function PasswordField({
  label,
  value,
  onChange,
  onBlur,
  name,
  placeholder,
  autoComplete,
  hint,
  error,
  required = false,
  disabled = false,
  maxLength,
  minLength,
  autoFocus,
  id,
  icon,
  labelAccessory,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      name={name}
      type={visible ? "text" : "password"}
      placeholder={placeholder}
      autoComplete={autoComplete}
      icon={icon}
      hint={hint}
      error={error}
      required={required}
      disabled={disabled}
      maxLength={maxLength}
      minLength={minLength}
      autoFocus={autoFocus}
      labelAccessory={labelAccessory}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-purple-50 hover:text-cefPurple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cefPurple focus-visible:ring-offset-1"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      }
    />
  );
}
