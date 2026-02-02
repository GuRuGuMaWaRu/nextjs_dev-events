"use client";

export default function EventError({ error }: { error: Error }) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="text-destructive">
      <p>Something went wrong.</p>
      {isDev && error.stack && (
        <pre className="text-sm text-wrap">{error.stack}</pre>
      )}
    </div>
  );
}
