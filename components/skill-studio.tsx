"use client";

import { useMemo, useState } from "react";
import { Copy, Download, Eye, FileText, RotateCcw, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getCategoryLabel, type Locale, type Messages } from "@/lib/i18n";
import {
  DEFAULT_STUDIO_DRAFT,
  STUDIO_TEMPLATE_ORDER,
  STUDIO_TEMPLATES,
  buildSkillMarkdown,
  buildStudioFileName,
  getStudioCopy,
  slugifySkillName,
  type StudioDraft,
  type StudioTemplateId
} from "@/lib/studio";
import { cn } from "@/lib/utils";

interface SkillStudioProps {
  locale: Locale;
  messages: Messages;
}

type PreviewMode = "rendered" | "markdown";

const textareaClass =
  "min-h-[120px] w-full rounded-[1.2rem] border border-white/62 bg-white/68 px-4 py-3 text-sm text-foreground shadow-[0_18px_30px_-24px_rgba(20,34,56,0.5),inset_0_1px_0_rgba(255,255,255,0.84)] outline-none backdrop-blur-xl transition placeholder:text-slate-500 focus:border-[#7aa8cf] focus:bg-white/82 focus:shadow-[0_22px_34px_-24px_rgba(20,34,56,0.42),inset_0_1px_0_rgba(255,255,255,0.88)]";

function Field({
  label,
  help,
  children
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900">{label}</span>
      </div>
      {children}
      {help ? <p className="text-xs leading-5 text-slate-500">{help}</p> : null}
    </label>
  );
}

export function SkillStudio({ locale, messages }: SkillStudioProps) {
  const copy = getStudioCopy(locale);
  const [draft, setDraft] = useState<StudioDraft>(DEFAULT_STUDIO_DRAFT);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("rendered");
  const [copied, setCopied] = useState(false);

  const markdown = useMemo(() => buildSkillMarkdown(draft), [draft]);
  const fileName = useMemo(() => buildStudioFileName(draft), [draft]);

  function updateField<K extends keyof StudioDraft>(key: K, value: StudioDraft[K]) {
    setDraft((current) => {
      if (key === "name") {
        const nextName = String(value);
        const currentAutoSlug = slugifySkillName(current.name);
        const shouldSyncSlug = !current.slug || current.slug === currentAutoSlug;
        return {
          ...current,
          name: nextName,
          slug: shouldSyncSlug ? slugifySkillName(nextName) : current.slug
        };
      }

      return {
        ...current,
        [key]: value
      };
    });
  }

  function applyTemplate(templateId: StudioTemplateId) {
    const template = STUDIO_TEMPLATES[templateId];
    setDraft((current) => ({
      ...current,
      ...template,
      name: current.name,
      slug: current.slug,
      author: current.author
    }));
  }

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  function downloadMarkdown() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const categoryOptions = ["General", "Automation", "Coding", "Research", "Security", "Web3"] as const;

  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[1.75rem] p-5 sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/62 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
              <Sparkles className="h-3.5 w-3.5" />
              {copy.templateTitle}
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{copy.templateDescription}</p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => setDraft(DEFAULT_STUDIO_DRAFT)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {copy.reset}
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {STUDIO_TEMPLATE_ORDER.map((templateId) => (
            <button
              key={templateId}
              type="button"
              onClick={() => applyTemplate(templateId)}
              className="inline-flex items-center rounded-full border border-white/62 bg-white/62 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition hover:bg-white/84"
            >
              {copy.templates[templateId]}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="surface-card rounded-[1.75rem] p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="font-[var(--font-serif)] text-[2rem] tracking-[-0.045em] text-slate-950">{copy.formTitle}</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">{copy.formDescription}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={copy.fieldName}>
              <Input
                value={draft.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder={copy.placeholders.name}
              />
            </Field>
            <Field label={copy.fieldSlug}>
              <Input
                value={draft.slug}
                onChange={(event) => updateField("slug", slugifySkillName(event.target.value))}
                placeholder={copy.placeholders.slug}
              />
            </Field>
            <Field label={copy.fieldAuthor}>
              <Input
                value={draft.author}
                onChange={(event) => updateField("author", event.target.value)}
                placeholder={copy.placeholders.author}
              />
            </Field>
            <Field label={copy.fieldCategory}>
              <select
                value={draft.category}
                onChange={(event) => updateField("category", event.target.value as StudioDraft["category"])}
                className="h-12 w-full rounded-[1.2rem] border border-white/62 bg-white/68 px-4 text-sm text-foreground shadow-[0_18px_30px_-24px_rgba(20,34,56,0.5),inset_0_1px_0_rgba(255,255,255,0.84)] outline-none backdrop-blur-xl transition focus:border-[#7aa8cf] focus:bg-white/82"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {getCategoryLabel(category, messages)}
                  </option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label={copy.fieldSummary}>
                <Input
                  value={draft.summary}
                  onChange={(event) => updateField("summary", event.target.value)}
                  placeholder={copy.placeholders.summary}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label={copy.fieldDescription}>
                <textarea
                  value={draft.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder={copy.placeholders.description}
                  className={cn(textareaClass, "min-h-[140px]")}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label={copy.fieldTags} help={copy.tagsHelp}>
                <Input
                  value={draft.tags}
                  onChange={(event) => updateField("tags", event.target.value)}
                  placeholder={copy.placeholders.tags}
                />
              </Field>
            </div>
            <Field label={copy.fieldUseCases} help={copy.listHelp}>
              <textarea
                value={draft.useCases}
                onChange={(event) => updateField("useCases", event.target.value)}
                placeholder={copy.placeholders.list}
                className={textareaClass}
              />
            </Field>
            <Field label={copy.fieldTriggers} help={copy.listHelp}>
              <textarea
                value={draft.triggers}
                onChange={(event) => updateField("triggers", event.target.value)}
                placeholder={copy.placeholders.list}
                className={textareaClass}
              />
            </Field>
            <Field label={copy.fieldPrerequisites} help={copy.listHelp}>
              <textarea
                value={draft.prerequisites}
                onChange={(event) => updateField("prerequisites", event.target.value)}
                placeholder={copy.placeholders.list}
                className={textareaClass}
              />
            </Field>
            <Field label={copy.fieldTools} help={copy.listHelp}>
              <textarea
                value={draft.tools}
                onChange={(event) => updateField("tools", event.target.value)}
                placeholder={copy.placeholders.tools}
                className={textareaClass}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label={copy.fieldInstallCommand} help={copy.installHelp}>
                <Input
                  value={draft.installCommand}
                  onChange={(event) => updateField("installCommand", event.target.value)}
                  placeholder={copy.placeholders.installCommand}
                />
              </Field>
            </div>
            <Field label={copy.fieldWorkflow} help={copy.listHelp}>
              <textarea
                value={draft.workflow}
                onChange={(event) => updateField("workflow", event.target.value)}
                placeholder={copy.placeholders.list}
                className={textareaClass}
              />
            </Field>
            <Field label={copy.fieldSafety} help={copy.listHelp}>
              <textarea
                value={draft.safetyNotes}
                onChange={(event) => updateField("safetyNotes", event.target.value)}
                placeholder={copy.placeholders.list}
                className={textareaClass}
              />
            </Field>
            <Field label={copy.fieldExamples} help={copy.listHelp}>
              <textarea
                value={draft.examples}
                onChange={(event) => updateField("examples", event.target.value)}
                placeholder={copy.placeholders.list}
                className={textareaClass}
              />
            </Field>
            <Field label={copy.fieldConfig} help={copy.configHelp}>
              <textarea
                value={draft.configSnippet}
                onChange={(event) => updateField("configSnippet", event.target.value)}
                placeholder={copy.placeholders.config}
                className={cn(textareaClass, "font-mono text-[13px]")}
              />
            </Field>
          </div>
        </section>

        <section className="surface-card rounded-[1.75rem] p-5 sm:p-6 xl:sticky xl:top-24 xl:self-start">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-[var(--font-serif)] text-[2rem] tracking-[-0.045em] text-slate-950">{copy.previewTitle}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{copy.previewDescription}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-full" onClick={() => void copyMarkdown()}>
                <Copy className="mr-2 h-4 w-4" />
                {copied ? copy.copied : copy.copyMarkdown}
              </Button>
              <Button className="rounded-full" onClick={downloadMarkdown}>
                <Download className="mr-2 h-4 w-4" />
                {copy.downloadMarkdown}
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge>{draft.category}</Badge>
            <Badge>{fileName}</Badge>
            {draft.author.trim() ? <Badge>{draft.author.trim()}</Badge> : null}
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => setPreviewMode("rendered")}
              className={cn(
                "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition",
                previewMode === "rendered"
                  ? "bg-[linear-gradient(135deg,#123f63,#1d6f81)] text-white shadow-[0_18px_28px_-20px_rgba(18,63,99,0.95)]"
                  : "border border-white/62 bg-white/62 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] hover:bg-white/84"
              )}
            >
              <Eye className="mr-2 h-4 w-4" />
              {copy.renderedTab}
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("markdown")}
              className={cn(
                "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition",
                previewMode === "markdown"
                  ? "bg-[linear-gradient(135deg,#123f63,#1d6f81)] text-white shadow-[0_18px_28px_-20px_rgba(18,63,99,0.95)]"
                  : "border border-white/62 bg-white/62 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] hover:bg-white/84"
              )}
            >
              <FileText className="mr-2 h-4 w-4" />
              {copy.markdownTab}
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/62 bg-white/64 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
            {previewMode === "markdown" ? (
              <pre className="max-h-[70vh] overflow-auto p-4 text-[13px] leading-6 text-slate-800">{markdown}</pre>
            ) : (
              <div className="prose-v50 max-h-[70vh] overflow-auto p-4 sm:p-6">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-4">
                        {children}
                      </a>
                    )
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
