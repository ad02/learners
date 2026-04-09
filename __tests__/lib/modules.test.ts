import {
  MODULES,
  getModuleBySlug,
  isModuleUnlocked,
  getModuleStatus,
  type ModuleProgress,
} from "@/lib/modules";

describe("MODULES", () => {
  test("has 9 modules", () => {
    expect(MODULES).toHaveLength(9);
  });

  test("modules are ordered 1-9", () => {
    MODULES.forEach((mod, i) => {
      expect(mod.order).toBe(i + 1);
    });
  });

  test("each module has required fields", () => {
    MODULES.forEach((mod) => {
      expect(mod.id).toBeTruthy();
      expect(mod.title).toBeTruthy();
      expect(mod.description).toBeTruthy();
      expect(mod.lessonCount).toBeGreaterThan(0);
      expect(mod.order).toBeGreaterThan(0);
    });
  });
});

describe("getModuleBySlug", () => {
  test("returns module for valid slug", () => {
    const mod = getModuleBySlug("01-vs-code");
    expect(mod).toBeDefined();
    expect(mod!.title).toBe("Your Computer is Your Workshop");
  });

  test("returns undefined for invalid slug", () => {
    expect(getModuleBySlug("nonexistent")).toBeUndefined();
  });
});

describe("isModuleUnlocked", () => {
  test("module 1 is always unlocked", () => {
    expect(isModuleUnlocked(1, [])).toBe(true);
  });

  test("module 2 is locked when module 1 is not completed", () => {
    expect(isModuleUnlocked(2, [])).toBe(false);
  });

  test("module 2 is locked when module 1 quiz score is below 80", () => {
    const progress: ModuleProgress[] = [
      { moduleOrder: 1, completed: true, quizScore: 60 },
    ];
    expect(isModuleUnlocked(2, progress)).toBe(false);
  });

  test("module 2 is unlocked when module 1 is completed with 80+ quiz", () => {
    const progress: ModuleProgress[] = [
      { moduleOrder: 1, completed: true, quizScore: 80 },
    ];
    expect(isModuleUnlocked(2, progress)).toBe(true);
  });

  test("module 5 requires module 4 completion", () => {
    const progress: ModuleProgress[] = [
      { moduleOrder: 1, completed: true, quizScore: 100 },
      { moduleOrder: 2, completed: true, quizScore: 90 },
      { moduleOrder: 3, completed: true, quizScore: 85 },
      { moduleOrder: 4, completed: false, quizScore: null },
    ];
    expect(isModuleUnlocked(5, progress)).toBe(false);
  });
});

describe("getModuleStatus", () => {
  test("returns 'locked' for locked module", () => {
    expect(getModuleStatus(2, [], 0)).toBe("locked");
  });

  test("returns 'available' for unlocked module with no progress", () => {
    expect(getModuleStatus(1, [], 0)).toBe("available");
  });

  test("returns 'in-progress' for module with some lessons done", () => {
    const progress: ModuleProgress[] = [
      { moduleOrder: 1, completed: false, quizScore: null },
    ];
    expect(getModuleStatus(1, progress, 2)).toBe("in-progress");
  });

  test("returns 'completed' for module with quiz passed", () => {
    const progress: ModuleProgress[] = [
      { moduleOrder: 1, completed: true, quizScore: 90 },
    ];
    expect(getModuleStatus(1, progress, 5)).toBe("completed");
  });
});
