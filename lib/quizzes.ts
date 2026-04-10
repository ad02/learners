export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface QuizData {
  moduleId: string;
  lessonId: string;
  moduleOrder: number;
  lessonOrder: number;
  questions: QuizQuestion[];
}

const quizzes: Record<string, QuizData> = {
  "01-vs-code": {
    moduleId: "01-vs-code",
    lessonId: "05-quiz",
    moduleOrder: 1,
    lessonOrder: 5,
    questions: [
      {
        question: "What is VS Code?",
        options: [
          "A web browser",
          "A code editor",
          "An operating system",
          "A programming language",
        ],
        correct: 1,
        explanation:
          "VS Code (Visual Studio Code) is a free code editor made by Microsoft — like Microsoft Word but for writing code.",
      },
      {
        question: "What is the terminal?",
        options: [
          "A type of monitor",
          "A place to type commands to your computer",
          "A web browser plugin",
          "A file format",
        ],
        correct: 1,
        explanation:
          "The terminal is where you type commands — like texting your computer instead of clicking buttons.",
      },
      {
        question: "What does a file extension tell you?",
        options: [
          "How big the file is",
          "When the file was created",
          "What kind of file it is",
          "Who created the file",
        ],
        correct: 2,
        explanation:
          "The extension (like .txt, .html, .js) tells your computer what kind of file it is and how to open it.",
      },
      {
        question: "How do you open the terminal in VS Code?",
        options: [
          "File > New Window",
          "Press Ctrl + backtick",
          "Click the blue button",
          "Right-click the desktop",
        ],
        correct: 1,
        explanation:
          "Press Ctrl + backtick (the key below Escape) to open VS Code's built-in terminal.",
      },
      {
        question: "What is a folder also called?",
        options: ["A container", "A directory", "A package", "A module"],
        correct: 1,
        explanation:
          "Folders are also called directories — they hold files and other folders, like a filing cabinet.",
      },
    ],
  },
  "03-prompting": {
    moduleId: "03-prompting",
    lessonId: "05-quiz",
    moduleOrder: 3,
    lessonOrder: 5,
    questions: [
      {
        question: "What is AI in simple terms?",
        options: [
          "A robot that looks like a human",
          "Software that can learn patterns and make predictions",
          "A search engine",
          "A type of computer hardware",
        ],
        correct: 1,
        explanation:
          "AI is software that learns patterns from data and can make predictions or generate content — like a very smart assistant that has read millions of documents.",
      },
      {
        question: "What makes a good prompt?",
        options: [
          "Using as few words as possible",
          "Being specific about what you want, with context and examples",
          "Using technical jargon",
          "Asking yes or no questions only",
        ],
        correct: 1,
        explanation:
          "Good prompts are specific and give context — like giving directions to a taxi driver. 'Take me to the airport' is better than just saying 'drive.'",
      },
      {
        question:
          "What is the prompt formula taught in this module?",
        options: [
          "Question + Answer",
          "Role + Task + Context + Format",
          "Who + What + When",
          "Input + Output",
        ],
        correct: 1,
        explanation:
          "The prompt formula is Role + Task + Context + Format. Tell the AI who to be, what to do, give it background info, and say how you want the answer.",
      },
      {
        question: "What does 'iterating' on a prompt mean?",
        options: [
          "Deleting the prompt and starting over",
          "Improving the prompt step by step based on results",
          "Copying someone else's prompt",
          "Making the prompt longer",
        ],
        correct: 1,
        explanation:
          "Iterating means tweaking and improving your prompt based on what you got back — like adjusting a recipe after tasting it.",
      },
      {
        question: "Which is a better prompt?",
        options: [
          "'Write something about dogs'",
          "'Write a 200-word blog post about the top 3 benefits of adopting rescue dogs, aimed at first-time pet owners'",
          "'Dogs are good. Write about that.'",
          "'Tell me about dogs please'",
        ],
        correct: 1,
        explanation:
          "The second prompt is specific about the topic, length, angle, and audience. More detail gives the AI a clearer target to hit.",
      },
    ],
  },
  "04-claude-code": {
    moduleId: "04-claude-code",
    lessonId: "05-quiz",
    moduleOrder: 4,
    lessonOrder: 5,
    questions: [
      {
        question: "What is Claude Code?",
        options: [
          "A website builder",
          "An AI assistant that runs in your terminal",
          "A programming language",
          "A type of VS Code extension",
        ],
        correct: 1,
        explanation:
          "Claude Code is an AI assistant that works right in your terminal — you type instructions in plain English and it helps you build, fix, and explain code.",
      },
      {
        question: "How do you start Claude Code?",
        options: [
          "Double-click an icon on the desktop",
          "Open a web browser",
          "Type 'claude' in your terminal",
          "Install it from the app store",
        ],
        correct: 2,
        explanation:
          "You start Claude Code by typing 'claude' in your terminal. It launches right there — no browser or separate app needed.",
      },
      {
        question:
          "What is the best way to give Claude Code instructions?",
        options: [
          "Use single-word commands",
          "Write in a programming language",
          "Describe what you want in plain English, with context",
          "Copy-paste error messages only",
        ],
        correct: 2,
        explanation:
          "Claude Code understands plain English. The more context you give — like what you are building and what you have tried — the better the results.",
      },
      {
        question: "Which is a common Claude Code workflow?",
        options: [
          "Describe a feature → Claude writes the code → you review and approve",
          "Claude reads your mind and writes code automatically",
          "You write all the code and Claude just saves it",
          "Claude only works with Python files",
        ],
        correct: 0,
        explanation:
          "The typical workflow is: you describe what you want, Claude writes the code, and you review it before approving. You stay in control.",
      },
      {
        question: "What can Claude Code help you with?",
        options: [
          "Only writing new code",
          "Writing code, fixing bugs, explaining code, and running commands",
          "Only fixing bugs",
          "Only answering questions",
        ],
        correct: 1,
        explanation:
          "Claude Code is versatile — it can write new code, debug existing code, explain what code does, and even run terminal commands for you.",
      },
    ],
  },
  "05-web-basics": {
    moduleId: "05-web-basics",
    lessonId: "05-quiz",
    moduleOrder: 5,
    lessonOrder: 5,
    questions: [
      {
        question: "What is a website, in simple terms?",
        options: [
          "A file on your computer",
          "A collection of pages stored on a server that anyone can visit via the internet",
          "An app on your phone",
          "A type of email",
        ],
        correct: 1,
        explanation:
          "A website is a collection of pages living on a server (a computer that is always online) that people access through their web browser.",
      },
      {
        question: "What does HTML do?",
        options: [
          "Makes websites look colorful",
          "Defines the structure and content of a web page",
          "Makes websites interactive",
          "Connects to databases",
        ],
        correct: 1,
        explanation:
          "HTML is the skeleton of a web page — it defines the structure like headings, paragraphs, images, and links. Think of it as the blueprint of a house.",
      },
      {
        question: "What is a domain name?",
        options: [
          "The password for a website",
          "The human-readable address of a website, like google.com",
          "A type of web browser",
          "The code that runs a website",
        ],
        correct: 1,
        explanation:
          "A domain name is the address you type into your browser — like 'google.com.' It is the human-friendly version of a server's IP address.",
      },
      {
        question: "What does DNS stand for and what does it do?",
        options: [
          "Digital Network System — it speeds up websites",
          "Domain Name System — it translates domain names into IP addresses",
          "Data Navigation Service — it organizes files",
          "Direct Network Signal — it connects computers",
        ],
        correct: 1,
        explanation:
          "DNS (Domain Name System) is like a phone book for the internet — it translates domain names (google.com) into IP addresses (142.250.80.46) so computers can find each other.",
      },
      {
        question: "What are the three main languages of the web?",
        options: [
          "Python, Java, and C++",
          "HTML, CSS, and JavaScript",
          "Word, Excel, and PowerPoint",
          "PHP, Ruby, and Go",
        ],
        correct: 1,
        explanation:
          "HTML (structure), CSS (styling), and JavaScript (interactivity) are the three core languages every web browser understands.",
      },
    ],
  },
  "06-wordpress": {
    moduleId: "06-wordpress",
    lessonId: "05-quiz",
    moduleOrder: 6,
    lessonOrder: 5,
    questions: [
      {
        question: "What is WordPress?",
        options: [
          "A programming language",
          "A content management system for building websites without code",
          "A web browser",
          "An email service",
        ],
        correct: 1,
        explanation:
          "WordPress is a content management system (CMS) — it lets you build and manage websites using a visual interface instead of writing code from scratch.",
      },
      {
        question: "What is the WordPress Dashboard?",
        options: [
          "The public homepage of your site",
          "The admin area where you manage your site's content and settings",
          "A code editor",
          "A place to buy domains",
        ],
        correct: 1,
        explanation:
          "The Dashboard is your control center — where you create content, change settings, install plugins, and manage everything about your WordPress site.",
      },
      {
        question:
          "What is the difference between Pages and Posts in WordPress?",
        options: [
          "There is no difference",
          "Pages are for static content (like About Us), Posts are for time-based content (like blog entries)",
          "Pages are free, Posts cost money",
          "Posts are for images, Pages are for text",
        ],
        correct: 1,
        explanation:
          "Pages are for content that rarely changes (About, Contact). Posts are for content published over time (blog articles, news). Think of pages as signs on a building and posts as newspaper articles.",
      },
      {
        question:
          "What is the difference between Themes and Plugins?",
        options: [
          "They are the same thing",
          "Themes control how your site looks, Plugins add new features",
          "Themes are free and Plugins are paid",
          "Themes are for blogs and Plugins are for stores",
        ],
        correct: 1,
        explanation:
          "Themes change the appearance (colors, layout, fonts) while Plugins add functionality (contact forms, SEO tools, online stores). Theme = paint and wallpaper, Plugin = new appliances.",
      },
      {
        question: "What does 'installing a plugin' do?",
        options: [
          "Changes your site's colors",
          "Adds new functionality to your WordPress site",
          "Deletes your content",
          "Moves your site to a new server",
        ],
        correct: 1,
        explanation:
          "Installing a plugin adds a new feature to your site — like adding an app to your phone. For example, a forms plugin lets visitors submit contact forms.",
      },
    ],
  },
  "07-apis": {
    moduleId: "07-apis",
    lessonId: "05-quiz",
    moduleOrder: 7,
    lessonOrder: 5,
    questions: [
      {
        question: "What is an API?",
        options: [
          "A type of website",
          "A way for two pieces of software to talk to each other",
          "A programming language",
          "A database",
        ],
        correct: 1,
        explanation:
          "An API (Application Programming Interface) is like a waiter in a restaurant — it takes your request to the kitchen (another system) and brings back the result.",
      },
      {
        question: "What is an API key used for?",
        options: [
          "To make your website load faster",
          "To prove your identity so the API knows who is making the request",
          "To encrypt your website",
          "To create new web pages",
        ],
        correct: 1,
        explanation:
          "An API key is like a membership card — it identifies you so the service knows who is making requests and can control access.",
      },
      {
        question: "What is a webhook?",
        options: [
          "A tool for building websites",
          "A way for one service to notify another when something happens",
          "A type of API key",
          "A web browser extension",
        ],
        correct: 1,
        explanation:
          "A webhook is like a doorbell — when an event happens (like a form submission), it automatically notifies another service. Instead of checking constantly, you get told when something happens.",
      },
      {
        question: "What can you do with the WordPress REST API?",
        options: [
          "Only read blog posts",
          "Create, read, update, and delete WordPress content from external tools",
          "Only change the theme",
          "Only install plugins",
        ],
        correct: 1,
        explanation:
          "The WordPress REST API lets you do almost anything you can do in the Dashboard — create posts, update pages, manage users — but from outside WordPress, using code or automation tools.",
      },
      {
        question:
          "What is the difference between an API call and a webhook?",
        options: [
          "There is no difference",
          "An API call is when YOU ask for data; a webhook is when data is SENT to you automatically",
          "Webhooks are faster than API calls",
          "API calls are free and webhooks are paid",
        ],
        correct: 1,
        explanation:
          "An API call is like calling a restaurant to ask if they have a table. A webhook is like the restaurant calling YOU when your table is ready. One is pull, the other is push.",
      },
    ],
  },
  "08-automation": {
    moduleId: "08-automation",
    lessonId: "05-quiz",
    moduleOrder: 8,
    lessonOrder: 5,
    questions: [
      {
        question: "What is automation in simple terms?",
        options: [
          "Writing code from scratch",
          "Making tasks happen automatically without manual work",
          "A type of programming language",
          "Building a website",
        ],
        correct: 1,
        explanation:
          "Automation is setting up a process so it runs on its own — like setting a coffee maker to brew at 7am instead of doing it manually every morning.",
      },
      {
        question: "What are 'triggers' and 'actions' in an automation?",
        options: [
          "Triggers are errors, actions are fixes",
          "A trigger is the event that starts the automation, an action is what happens next",
          "They are types of programming languages",
          "Triggers send emails, actions delete them",
        ],
        correct: 1,
        explanation:
          "A trigger is the 'when' (when a form is submitted, when it is 9am). An action is the 'then' (then send an email, then create a post). Trigger = cause, Action = effect.",
      },
      {
        question: "Which of these is an automation tool?",
        options: [
          "Microsoft Word",
          "n8n, Make, or Zapier",
          "Google Chrome",
          "VS Code",
        ],
        correct: 1,
        explanation:
          "n8n, Make (formerly Integromat), and Zapier are all automation tools — they let you connect different services and create workflows without writing code.",
      },
      {
        question: "What is a 'workflow' in automation?",
        options: [
          "A single step that runs once",
          "A series of connected steps that run in sequence to complete a task",
          "A type of spreadsheet",
          "A backup of your files",
        ],
        correct: 1,
        explanation:
          "A workflow is a chain of steps — like a recipe. Step 1: get the data. Step 2: process it. Step 3: save the result. Step 4: notify someone. Each step flows into the next.",
      },
      {
        question: "Why is automation useful for beginners?",
        options: [
          "It requires advanced coding skills",
          "It saves time on repetitive tasks and reduces human error",
          "It only works for large companies",
          "It replaces the need to learn anything else",
        ],
        correct: 1,
        explanation:
          "Automation saves you from doing the same task over and over, and it makes fewer mistakes than doing things manually. Even beginners can set up powerful automations with visual tools.",
      },
    ],
  },
  "09-capstone": {
    moduleId: "09-capstone",
    lessonId: "05-quiz",
    moduleOrder: 9,
    lessonOrder: 5,
    questions: [
      {
        question:
          "In a typical automation workflow, what comes first?",
        options: [
          "An action",
          "A notification",
          "A trigger",
          "An AI step",
        ],
        correct: 2,
        explanation:
          "Every automation starts with a trigger — the event that kicks things off, like a form submission, a schedule, or an incoming email.",
      },
      {
        question:
          "How can AI (like Claude) be used in an automation workflow?",
        options: [
          "Only to write code",
          "To process, summarize, categorize, or transform data between steps",
          "Only to send notifications",
          "Only to create websites",
        ],
        correct: 1,
        explanation:
          "AI sits in the middle of a workflow to add intelligence — it can summarize content, categorize data, rewrite text, or make decisions about what should happen next.",
      },
      {
        question:
          "What does the WordPress REST API allow in an automation?",
        options: [
          "Only reading existing posts",
          "Creating, updating, and managing WordPress content from external tools automatically",
          "Only changing the website theme",
          "Only deleting content",
        ],
        correct: 1,
        explanation:
          "The WordPress REST API lets automations create posts, update pages, and manage content — so your workflow can publish directly to WordPress without you logging in.",
      },
      {
        question:
          "What is the benefit of combining webhooks, AI, APIs, and notifications?",
        options: [
          "It makes your website look better",
          "It creates end-to-end automations that handle entire processes without manual work",
          "It speeds up your internet connection",
          "It is only useful for developers",
        ],
        correct: 1,
        explanation:
          "Combining these tools creates a full pipeline — something triggers the process, AI adds intelligence, APIs move data between services, and notifications keep humans informed. That is a complete automation.",
      },
      {
        question: "What is the most important takeaway from this course?",
        options: [
          "You need to memorize every API endpoint",
          "Automation is only for programmers",
          "By connecting simple tools together, anyone can build powerful automations",
          "AI will do everything for you without any input",
        ],
        correct: 2,
        explanation:
          "The key lesson is that you do not need to be a programmer to automate tasks. By connecting simple tools — triggers, AI, APIs, and notifications — anyone can build workflows that save hours of manual work.",
      },
    ],
  },
  "02-git": {
    moduleId: "02-git",
    lessonId: "05-quiz",
    moduleOrder: 2,
    lessonOrder: 5,
    questions: [
      {
        question: "What is Git?",
        options: [
          "A website",
          "A version control system",
          "A programming language",
          "A code editor",
        ],
        correct: 1,
        explanation:
          "Git is a version control system — like a time machine that remembers every version of your project.",
      },
      {
        question: "What does 'git commit' do?",
        options: [
          "Deletes your files",
          "Saves a checkpoint of your changes",
          "Uploads to the internet",
          "Opens a new file",
        ],
        correct: 1,
        explanation:
          "A commit is like sealing an envelope — it saves a snapshot of your changes with a message describing what you did.",
      },
      {
        question: "What is GitHub?",
        options: [
          "A code editor",
          "A search engine",
          "A place to store code online",
          "An operating system",
        ],
        correct: 2,
        explanation:
          "GitHub is like Google Drive but for code — it stores your projects online so they're safe and shareable.",
      },
      {
        question: "What is a branch in Git?",
        options: [
          "A copy of your project to work on safely",
          "A type of file",
          "A Git error",
          "A terminal command",
        ],
        correct: 0,
        explanation:
          "A branch is like a parallel universe for your code — you can make changes without affecting the main version.",
      },
      {
        question: "What does 'git push' do?",
        options: [
          "Downloads files",
          "Sends your commits to GitHub",
          "Creates a new file",
          "Deletes a branch",
        ],
        correct: 1,
        explanation:
          "Push sends your committed changes to GitHub — like mailing your sealed envelope to the post office.",
      },
    ],
  },
};

export function getQuizData(moduleSlug: string): QuizData | null {
  return quizzes[moduleSlug] || null;
}
