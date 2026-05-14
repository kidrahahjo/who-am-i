#!/usr/bin/env node

/**
 * Generate today's lessons by spawning `claude` CLI subprocesses.
 * Reads topics from ~/.know/topics.json
 * Writes markdown files to src/content/lessons/
 *
 * Usage: node scripts/generate-lessons.mjs
 * Or:    npm run learn
 *
 * Requires: claude CLI installed and authenticated
 */

import { spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const LESSONS_DIR = join(__dirname, '..', 'src', 'content', 'lessons');
const TOPICS_FILE = join(homedir(), '.know', 'topics.json');

// ── Load topics ──────────────────────────────────────────────────────────────

if (!existsSync(TOPICS_FILE)) {
  console.error(`\nTopics file not found: ${TOPICS_FILE}`);
  console.error(`Create ~/.know/topics.json — see README for format.\n`);
  process.exit(1);
}

const topics = JSON.parse(readFileSync(TOPICS_FILE, 'utf-8'));

// ── Setup ────────────────────────────────────────────────────────────────────

const today = new Date().toISOString().slice(0, 10);
mkdirSync(LESSONS_DIR, { recursive: true });

// ── Claude subprocess ────────────────────────────────────────────────────────

function runClaude(prompt) {
  return new Promise((resolve, reject) => {
    const proc = spawn('claude', [
      '-p',
      prompt,
      '--output-format', 'text',
      '--model', 'sonnet',
      '--allowedTools', 'WebFetch', 'WebSearch',
    ], {
      timeout: 120_000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => { stdout += d; });
    proc.stderr.on('data', (d) => { stderr += d; });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `claude exited with code ${code}`));
      } else {
        resolve(stdout);
      }
    });

    proc.on('error', reject);
  });
}

// ── Generate ─────────────────────────────────────────────────────────────────

async function generateLesson(topic) {
  const filename = `${today}-${topic.id}.md`;
  const filepath = join(LESSONS_DIR, filename);

  if (existsSync(filepath)) {
    console.log(`  skip  ${topic.name} — already exists`);
    return;
  }

  console.log(`  ...   ${topic.name} — researching`);

  // For educational topics (not news), avoid repeating past lessons
  let historyBlock = '';
  if (topic.noRepeat) {
    const pastTitles = readdirSync(LESSONS_DIR)
      .filter(f => f.endsWith(`-${topic.id}.md`))
      .map(f => {
        const content = readFileSync(join(LESSONS_DIR, f), 'utf-8');
        const match = content.match(/^title:\s*"(.+)"/m);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    if (pastTitles.length > 0) {
      historyBlock = `\nYou have already covered these in past lessons — do NOT repeat them, teach something new:\n${pastTitles.map(t => `- ${t}`).join('\n')}\n`;
    }
  }

  const prompt = `You are a personal knowledge assistant. Research and write a concise, high-quality daily lesson.

Topic: ${topic.name}
Task: ${topic.prompt}
${historyBlock}
Rules:
- Write in clear, direct prose. No filler, no fluff.
- Use specific facts, numbers, names, and dates.
- Keep it between 400-800 words.
- Use markdown formatting (headers, lists, bold) for readability.
- Do NOT include the title in the body — it goes in frontmatter.
- Today's date is ${today}.
- Use your tools to search the web and get current, real information. Do not make things up.

Respond with ONLY a JSON object, no markdown wrapping:
{
  "title": "A specific, compelling title for today's lesson",
  "summary": "One sentence summary, max 120 chars",
  "reading_time": "X min",
  "body": "The full markdown body of the lesson"
}`;

  try {
    const stdout = await runClaude(prompt);

    // Parse JSON from response
    let jsonStr = stdout.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Try to find JSON object in the response
      const match = jsonStr.match(/\{[\s\S]*"title"[\s\S]*"body"[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error(jsonStr.slice(0, 200));
      }
    }

    const markdown = `---
title: "${parsed.title.replace(/"/g, '\\"')}"
date: "${today}"
topic: "${topic.id}"
reading_time: "${parsed.reading_time}"
summary: "${parsed.summary.replace(/"/g, '\\"')}"
---

${parsed.body}
`;

    writeFileSync(filepath, markdown);
    console.log(`  done  ${topic.name}`);
  } catch (err) {
    console.error(`  FAIL  ${topic.name}: ${err.message}`);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log(`\nGenerating lessons for ${today}\n`);

// Run sequentially to avoid overwhelming the CLI
for (const topic of topics) {
  await generateLesson(topic);
}

console.log(`\nLessons in: src/content/lessons/`);
console.log(`Preview: npm run dev`);
console.log(`Deploy:  git add . && git commit -m "lessons ${today}" && git push\n`);
