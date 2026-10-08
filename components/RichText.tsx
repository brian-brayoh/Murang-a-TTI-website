import { renderBody } from "@/lib/html";

// Renders editor content (or old plain-text content) with the site's typography.
export default function RichText({ body, className = "" }: { body: string; className?: string }) {
  return <div className={`rich ${className}`} dangerouslySetInnerHTML={{ __html: renderBody(body) }} />;
}
