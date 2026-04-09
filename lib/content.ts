import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

export interface LessonMeta {
  slug: string;
  title: string;
  description: string;
  order: number;
  type: "lesson" | "quiz";
}

export function getModuleSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

export function getLessonsForModule(moduleSlug: string): LessonMeta[] {
  const moduleDir = path.join(CONTENT_DIR, moduleSlug);
  if (!fs.existsSync(moduleDir)) return [];

  const files = fs
    .readdirSync(moduleDir)
    .filter((f) => f.endsWith(".mdx"));

  const lessons: LessonMeta[] = files.map((file) => {
    const filePath = path.join(moduleDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);

    return {
      slug: file.replace(".mdx", ""),
      title: data.title || file.replace(".mdx", ""),
      description: data.description || "",
      order: data.order || 0,
      type: data.type || "lesson",
    };
  });

  return lessons.sort((a, b) => a.order - b.order);
}

export function getLessonContent(
  moduleSlug: string,
  lessonSlug: string
): { meta: LessonMeta; content: string } | null {
  const filePath = path.join(CONTENT_DIR, moduleSlug, `${lessonSlug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    meta: {
      slug: lessonSlug,
      title: data.title || lessonSlug,
      description: data.description || "",
      order: data.order || 0,
      type: data.type || "lesson",
    },
    content,
  };
}
