"use client";

import { useId } from "react";
import type {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { CircleAlert, type LucideIcon } from "lucide-react";
import {
  fieldBaseClassName,
  fieldErrorClassName,
  fieldErrorTextClassName,
  fieldHintClassName,
  fieldIdleClassName,
  fieldLabelClassName,
} from "./fieldStyles";

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  name?: string;
  type?: "text" | "email" | "tel" | "password" | "search";
  placeholder?: string;
  autoComplete?: string;
  icon?: LucideIcon;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  autoFocus?: boolean;
  id?: string;
  labelAccessory?: ReactNode;
  trailing?: ReactNode;
  inputClassName?: string;
};

export default function TextField({
  label,
  value,
  onChange,
  onBlur,
  name,
  type = "text",
  placeholder,
  autoComplete,
  icon: Icon,
  hint,
  error,
  required = false,
  disabled = false,
  maxLength,
  minLength,
  inputMode,
  autoFocus,
  id,
  labelAccessory,
  trailing,
  inputClassName = "",
}: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy =
    [errorId, hint ? hintId : undefined].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={fieldId} className={fieldLabelClassName}>
          {label}
          {required && (
            <span className="ml-1 text-cefPurple" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {labelAccessory}
      </div>

      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
        )}
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          inputMode={inputMode}
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${fieldBaseClassName} ${error ? fieldErrorClassName : fieldIdleClassName} ${
            Icon ? "pl-11" : ""
          } ${trailing ? "pr-12" : ""} ${inputClassName}`}
        />
        {trailing && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            {trailing}
          </div>
        )}
      </div>

      {error ? (
        <p id={errorId} className={fieldErrorTextClassName}>
          <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className={fieldHintClassName}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
