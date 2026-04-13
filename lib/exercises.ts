export type ExerciseData =
  | { component: "PromptSandbox"; props: { exercise: string; badExample?: string; hint?: string } }
  | { component: "Terminal"; props: { steps: Array<{ prompt: string; expectedCommands: string[]; response: string; hint: string }> } }
  | { component: "CodePlayground"; props: { starterCode?: string; solution?: string } }
  | { component: "ApiExplorer"; props: { endpoints: Array<{ method: string; url: string; requiredHeaders?: Record<string, string>; response: { status: number; statusText: string; body: Record<string, unknown>; explanation: string } }> } }
  | { component: "WorkflowBuilder"; props: { availableBlocks: Array<{ id: string; type: "trigger" | "ai" | "action" | "notify"; label: string; description: string; icon: string }>; expectedFlow?: Array<"trigger" | "ai" | "action" | "notify"> } };

const exercises: Record<string, ExerciseData> = {
  // Module 3: Prompting
  "03-prompting/02-good-vs-bad-prompts": {
    component: "PromptSandbox",
    props: {
      exercise: "compare-prompts",
      badExample: "Write something about marketing",
      hint: "Try adding: who the AI should be, what you need, how long, what tone",
    },
  },
  "03-prompting/03-the-prompt-formula": {
    component: "PromptSandbox",
    props: {
      exercise: "prompt-formula",
      hint: "Include all 4 parts: Role, Context, Task, and Format",
    },
  },

  // Module 4: Claude Code
  "04-claude-code/02-setup": {
    component: "Terminal",
    props: {
      steps: [
        {
          prompt: "~ $",
          expectedCommands: ["claude", "claude code"],
          response: "Welcome to Claude Code! How can I help you today?",
          hint: "Type 'claude' to start Claude Code",
        },
        {
          prompt: "claude>",
          expectedCommands: ["help", "/help"],
          response: "Available commands:\n  /help - Show this help\n  /clear - Clear conversation\n  /exit - Exit Claude Code",
          hint: "Type 'help' to see what commands are available",
        },
      ],
    },
  },
  "04-claude-code/03-first-conversation": {
    component: "Terminal",
    props: {
      steps: [
        {
          prompt: "claude>",
          expectedCommands: ["create a file called hello.txt", "create hello.txt", "make a file called hello.txt", "create a file called hello.txt with the text hello world"],
          response: "I'll create a new file called hello.txt.\n\n┌─ Create file: hello.txt ─────────┐\n│  + Hello World                   │\n└──────────────────────────────────┘\n\nDo you want to apply this change? (y/n) y\n\u2713 Created hello.txt",
          hint: "Ask Claude to create a file called hello.txt",
        },
        {
          prompt: "claude>",
          expectedCommands: ["show me the file", "cat hello.txt", "read hello.txt", "open hello.txt", "show me hello.txt", "what's in hello.txt"],
          response: "Contents of hello.txt:\n\nHello World",
          hint: "Ask Claude to show you the file contents",
        },
        {
          prompt: "claude>",
          expectedCommands: ["change hello world to hi there", "change it to hi there", "edit hello.txt", "change the text to hi there", "update hello.txt to say hi there", "replace hello world with hi there"],
          response: "I'll update the text in hello.txt.\n\n┌─ Edit file: hello.txt ───────────┐\n│  - Hello World                   │\n│  + Hi there                      │\n└──────────────────────────────────┘\n\nDo you want to apply this change? (y/n) y\n\u2713 Updated hello.txt",
          hint: "Ask Claude to change the text to 'Hi there' — practice editing a file",
        },
        {
          prompt: "claude>",
          expectedCommands: ["/clear", "clear", "/help", "help"],
          response: "Conversation cleared. Project context maintained.\nWhat would you like to work on?",
          hint: "Try a slash command: type /clear to reset the conversation",
        },
      ],
    },
  },
  "04-claude-code/04-common-workflows": {
    component: "PromptSandbox",
    props: {
      exercise: "claude-code-workflow",
      badExample: "fix it",
      hint: "Tell Claude what's broken, where it is, and what the expected behavior should be",
    },
  },

  // Module 5: Web Basics
  "05-web-basics/03-html-basics": {
    component: "CodePlayground",
    props: {
      starterCode: "<h1>My First Page</h1>\n<p>Hello! This is my website.</p>\n\n<!-- Try adding a list below -->\n",
      solution: "<h1>My First Page</h1>\n<p>Hello! This is my website.</p>\n\n<ul>\n  <li>Item one</li>\n  <li>Item two</li>\n  <li>Item three</li>\n</ul>",
    },
  },

  // Module 7: APIs — exercises are now real (Groq API via browser DevTools,
  // real WordPress.com REST API via browser). See lesson MDX for walkthroughs.

  // Module 8: Automation
  "08-automation/04-building-a-workflow": {
    component: "WorkflowBuilder",
    props: {
      availableBlocks: [
        { id: "webhook", type: "trigger", label: "Webhook", description: "Form submitted", icon: "\ud83d\udce8" },
        { id: "claude", type: "ai", label: "Claude AI", description: "Summarize content", icon: "\ud83e\udd16" },
        { id: "wordpress", type: "action", label: "WordPress", description: "Create post", icon: "\ud83d\udcdd" },
        { id: "slack", type: "notify", label: "Slack", description: "Send message", icon: "\ud83d\udd14" },
      ],
      expectedFlow: ["trigger", "ai", "action", "notify"],
    },
  },

  // Module 9: Capstone
  "09-capstone/02-template-a": {
    component: "WorkflowBuilder",
    props: {
      availableBlocks: [
        { id: "form-webhook", type: "trigger", label: "Form Webhook", description: "Form submitted", icon: "\ud83d\udce8" },
        { id: "claude-summarize", type: "ai", label: "Claude AI", description: "Summarize content", icon: "\ud83e\udd16" },
        { id: "wp-create-post", type: "action", label: "WordPress", description: "Create draft post", icon: "\ud83d\udcdd" },
        { id: "slack-notify", type: "notify", label: "Slack", description: "Notify team", icon: "\ud83d\udd14" },
      ],
      expectedFlow: ["trigger", "ai", "action", "notify"],
    },
  },
  "09-capstone/03-template-b": {
    component: "WorkflowBuilder",
    props: {
      availableBlocks: [
        { id: "schedule", type: "trigger", label: "Daily Schedule", description: "Every day at 9am", icon: "\u23f0" },
        { id: "api-fetch", type: "action", label: "Fetch Data", description: "Get from API", icon: "\ud83d\udce1" },
        { id: "claude-format", type: "ai", label: "Claude AI", description: "Format summary", icon: "\ud83e\udd16" },
        { id: "wp-post", type: "action", label: "WordPress", description: "Create post", icon: "\ud83d\udcdd" },
        { id: "git-commit", type: "action", label: "GitHub", description: "Commit config", icon: "\ud83d\udce6" },
      ],
      expectedFlow: ["trigger", "action", "ai", "action", "action"],
    },
  },
  "09-capstone/04-template-c": {
    component: "WorkflowBuilder",
    props: {
      availableBlocks: [
        { id: "email-webhook", type: "trigger", label: "Email Received", description: "New support email", icon: "\ud83d\udce7" },
        { id: "claude-classify", type: "ai", label: "Claude AI", description: "Categorize ticket", icon: "\ud83e\udd16" },
        { id: "wp-update", type: "action", label: "WordPress", description: "Update tracker", icon: "\ud83d\udccb" },
        { id: "notify-person", type: "notify", label: "Notify", description: "Alert team member", icon: "\ud83d\udd14" },
      ],
      expectedFlow: ["trigger", "ai", "action", "notify"],
    },
  },
};

export function getExerciseData(moduleSlug: string, lessonSlug: string): ExerciseData | null {
  return exercises[`${moduleSlug}/${lessonSlug}`] || null;
}
