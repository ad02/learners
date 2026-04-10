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
    <article className="prose prose-invert max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-accent-blue prose-strong:text-text-primary prose-code:text-accent-purple prose-pre:bg-bg-secondary prose-pre:border prose-pre:border-border">
      <MDXRemote source={source} components={components} />
    </article>
  );
}
