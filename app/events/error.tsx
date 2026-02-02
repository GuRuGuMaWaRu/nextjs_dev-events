"use client";

export default function Error({ error }: { error: Error }) {
  return (
    <div className="text-destructive">
      <pre className="text-sm text-wrap">{error.stack}</pre>
    </div>
  );
}
