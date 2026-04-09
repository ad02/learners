import {
  getLessonsForModule,
  getLessonContent,
  getModuleSlugs,
} from "@/lib/content";

describe("getModuleSlugs", () => {
  test("returns array of module folder names", () => {
    const slugs = getModuleSlugs();
    expect(slugs).toContain("01-vs-code");
    expect(slugs).toContain("02-git");
    expect(slugs.length).toBeGreaterThanOrEqual(2);
  });
});

describe("getLessonsForModule", () => {
  test("returns sorted lessons for a valid module", () => {
    const lessons = getLessonsForModule("01-vs-code");
    expect(lessons.length).toBeGreaterThan(0);
    expect(lessons[0].slug).toBe("01-what-is-vscode");
    expect(lessons[0].title).toBeTruthy();
    expect(lessons[0].order).toBe(1);
  });

  test("lessons are sorted by order", () => {
    const lessons = getLessonsForModule("01-vs-code");
    for (let i = 1; i < lessons.length; i++) {
      expect(lessons[i].order).toBeGreaterThan(lessons[i - 1].order);
    }
  });

  test("returns empty array for nonexistent module", () => {
    const lessons = getLessonsForModule("nonexistent");
    expect(lessons).toEqual([]);
  });

  test("identifies quiz lessons", () => {
    const lessons = getLessonsForModule("01-vs-code");
    const quiz = lessons.find((l) => l.type === "quiz");
    expect(quiz).toBeDefined();
    expect(quiz!.slug).toContain("quiz");
  });
});

describe("getLessonContent", () => {
  test("returns content and meta for valid lesson", () => {
    const result = getLessonContent("01-vs-code", "01-what-is-vscode");
    expect(result).not.toBeNull();
    expect(result!.meta.title).toBeTruthy();
    expect(result!.content).toBeTruthy();
  });

  test("returns null for nonexistent lesson", () => {
    const result = getLessonContent("01-vs-code", "nonexistent");
    expect(result).toBeNull();
  });
});
