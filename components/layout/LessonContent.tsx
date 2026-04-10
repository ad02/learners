import { MDXRemote } from "next-mdx-remote/rsc";
import {
  Quiz,
  Terminal,
  PromptSandbox,
  CodePlayground,
  ApiExplorer,
  WorkflowBuilder,
} from "@/components/interactive";

const components = {
  Quiz,
  Terminal,
  PromptSandbox,
  CodePlayground,
  ApiExplorer,
  WorkflowBuilder,
};

interface LessonContentProps {
  source: string;
}

export function LessonContent({ source }: LessonContentProps) {
  return (
    <article className="prose max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-accent-blue prose-strong:text-text-primary prose-code:text-accent-purple prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:border prose-pre:border-gray-200 prose-pre:rounded-xl">
      <MDXRemote source={source} components={components} />
    </article>
  );
}
