import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <p className="mb-2 text-7xl font-black text-brand-300 dark:text-brand-700">404</p>
      <h1 className="mb-3 text-2xl font-bold text-brand-900 dark:text-brand-100">
        This page doesn't exist.
      </h1>
      <p className="mb-8 text-brand-600 dark:text-brand-400">
        But my resume does. And it's pretty good.
      </p>
      <Link
        href="/"
        className="rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        View Resume →
      </Link>
    </div>
  );
}
