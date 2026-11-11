"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { ChevronDown, Pencil, X } from "lucide-react";

export type AdminCategoryRow = {
  id: string;
  name: string;
  description: string;
};

type CategoryManagerProps<TCategory extends AdminCategoryRow> = {
  categories: TCategory[];
  itemCounts: ReadonlyMap<string, number>;
  busy: boolean;
  onAdd: (data: FormData) => boolean | Promise<boolean>;
  onSave: (id: string, data: FormData) => boolean | Promise<boolean>;
};

const fieldClassName =
  "mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-normal text-gray-900 outline-none transition focus:border-cefPurple focus:ring-2 focus:ring-purple-100";

export function CategoryManager<TCategory extends AdminCategoryRow>({
  categories,
  itemCounts,
  busy,
  onAdd,
  onSave,
}: CategoryManagerProps<TCategory>) {
  const [editingId, setEditingId] = useState<string | null>(null);

  async function submit(
    event: FormEvent<HTMLFormElement>,
    categoryId?: string,
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (categoryId) {
      if (await onSave(categoryId, data)) {
        setEditingId(null);
      }
    } else {
      if (await onAdd(data)) {
        form.reset();
      }
    }
  }

  return (
    <section
      aria-labelledby="admin-category-manager-heading"
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
    >
      <div className="mb-5">
        <h2
          id="admin-category-manager-heading"
          className="font-serif text-xl font-bold text-gray-950"
        >
          Categories
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Edit category details here. Categories with assigned items cannot be
          removed through the current media API.
        </p>
      </div>

      <form
        onSubmit={(event) => submit(event)}
        className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]"
      >
        <label className="text-xs font-bold text-gray-700">
          Category name
          <input
            name="name"
            required
            minLength={2}
            maxLength={100}
            className={fieldClassName}
          />
        </label>
        <label className="text-xs font-bold text-gray-700">
          Description
          <input
            name="description"
            required
            minLength={5}
            maxLength={500}
            className={fieldClassName}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-cefPurple px-4 py-3 text-xs font-bold text-white disabled:opacity-50"
        >
          Add category
        </button>
      </form>

      <ul className="mt-5 divide-y divide-gray-100 border-t border-gray-100">
        {categories.map((category) => (
          <li key={category.id} className="py-3 first:pt-4">
            {editingId === category.id ? (
              <InlineEditForm
                formId={`category-edit-${category.id}`}
                onCancel={() => setEditingId(null)}
                saveLabel="Save category"
                busy={busy}
              >
                <form
                  id={`category-edit-${category.id}`}
                  onSubmit={(event) => submit(event, category.id)}
                  className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]"
                >
                  <label className="text-xs font-bold text-gray-700">
                    Category name
                    <input
                      name="name"
                      required
                      minLength={2}
                      maxLength={100}
                      defaultValue={category.name}
                      className={fieldClassName}
                    />
                  </label>
                  <label className="text-xs font-bold text-gray-700">
                    Description
                    <input
                      name="description"
                      required
                      minLength={5}
                      maxLength={500}
                      defaultValue={category.description}
                      className={fieldClassName}
                    />
                  </label>
                  <span className="hidden sm:block" />
                </form>
              </InlineEditForm>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-950">
                      {category.name}
                    </h3>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-600">
                      {itemCounts.get(category.id) ?? 0} items
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {category.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingId(category.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:border-cefPurple hover:text-cefPurple"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CollapsibleCategorySection({
  name,
  description,
  count,
  emptyText,
  children,
}: {
  name: string;
  description?: string;
  count: number;
  emptyText: string;
  children: ReactNode;
}) {
  return (
    <details
      open
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-slate-50 px-4 py-3.5 marker:hidden">
        <span className="flex min-w-0 items-center gap-2">
          <ChevronDown
            className="h-4 w-4 shrink-0 text-gray-500 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
          <span className="min-w-0">
            <span className="block truncate font-serif text-lg font-bold text-gray-950">
              {name}
            </span>
            {description && (
              <span className="mt-0.5 block text-xs text-gray-500">
                {description}
              </span>
            )}
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-600">
          {count}
        </span>
      </summary>
      <div className="divide-y divide-gray-100 border-t border-gray-100 px-4">
        {count === 0 ? (
          <p className="py-4 text-sm text-gray-500">{emptyText}</p>
        ) : (
          children
        )}
      </div>
    </details>
  );
}

export function ItemRow({
  title,
  subtitle,
  thumbnail,
  badges,
  actions,
  editing,
  children,
  onCancel,
  formId,
  saveLabel = "Save changes",
  busy,
}: {
  title: string;
  subtitle?: string;
  thumbnail?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  editing: boolean;
  children?: ReactNode;
  formId: string;
  onCancel: () => void;
  saveLabel?: string;
  busy: boolean;
}) {
  return (
    <article className="py-4">
      {editing ? (
        <InlineEditForm
          formId={formId}
          onCancel={onCancel}
          saveLabel={saveLabel}
          busy={busy}
        >
          {children}
        </InlineEditForm>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {thumbnail && (
              <div className="relative flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                {thumbnail}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">{badges}</div>
              <h4 className="mt-1 truncate font-semibold text-gray-950">
                {title}
              </h4>
              {subtitle && (
                <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>
      )}
    </article>
  );
}

export function InlineEditForm({
  children,
  onCancel,
  formId,
  saveLabel,
  busy,
}: {
  children: ReactNode;
  formId: string;
  onCancel: () => void;
  saveLabel: string;
  busy: boolean;
}) {
  return (
    <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4">
      {children}
      <div className="mt-4 flex justify-end gap-2 border-t border-purple-100 pt-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 disabled:opacity-50"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Cancel
        </button>
        <button
          type="submit"
          form={formId}
          disabled={busy}
          className="rounded-xl bg-cefPurple px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
        >
          {busy ? "Saving..." : saveLabel}
        </button>
      </div>
    </div>
  );
}
