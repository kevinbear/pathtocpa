import Link from "next/link";

type Props = {
  emoji: string;
  title: string;
  description: string;
  milestone: string;
  willInclude?: string[];
};

export default function PagePlaceholder({
  emoji,
  title,
  description,
  milestone,
  willInclude,
}: Props) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-3xl">
          {emoji}
        </div>
        <div>
          <span className="pill bg-slate-100 text-slate-500">{milestone}</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">{description}</p>
        </div>
      </div>

      {willInclude && willInclude.length > 0 && (
        <div className="card mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            What this page will include
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {willInclude.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-brand-500">▸</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-10 text-sm text-slate-500">
        ← Back to the{" "}
        <Link href="/" className="font-medium text-brand-700 underline">
          home page
        </Link>
        .
      </p>
    </main>
  );
}
