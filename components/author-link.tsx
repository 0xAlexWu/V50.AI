import Link from "next/link";

interface AuthorLinkProps {
  handle: string;
  className?: string;
}

export function AuthorLink({ handle, className }: AuthorLinkProps) {
  return (
    <Link href={`/authors/${encodeURIComponent(handle)}`} className={className ?? "text-accent hover:underline"}>
      {handle}
    </Link>
  );
}
