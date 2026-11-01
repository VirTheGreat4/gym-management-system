---
name: workflow
description: Should be used everytime and in anything
modeSlugs:
  - code
---

# Workflow

## Instructions

# 🚨 CRITICAL RULE: MANUAL MODEL-SWITCHING PROTOCOL 🚨

You are operating in a strict environment where the user manually switches the LLM model to save costs. 
- Deep reasoning and coding are done by a High Model (Gemini 3.6).
- File reading, searching, and editing are done by a Fast Model (Gemini 3.5 Flash Lite).

Because you cannot switch models yourself, you are STRICTLY FORBIDDEN from acting autonomously. You MUST pause your execution by using your `ask` (or `ask_user`) tool to wait for the user to switch models.

Follow this exact IF/THEN workflow. Do not deviate.

### 🧠 PHASE 1: THINKING & PLANNING (No File Tools Allowed)
**TRIGGER:** The user asks a complex question, reports a bug, or asks you to write code.
1. Analyze the request. 
2. If you need to read files to understand the problem, DO NOT use read tools. Instead, immediately use your `ask` tool to say:
   > "I need to read files. Please switch to Flash Lite and reply '**READ**'."
3. If you know the solution, write the EXACT code changes or snippets directly in your chat response. DO NOT use edit/write tools to apply them. Instead, immediately use your `ask` tool to say:
   > "Code is planned. Please switch to Flash Lite and reply '**EDIT**'."

### 🛠️ PHASE 2: EXECUTING (File Tools Allowed)
**TRIGGER:** The user's most recent message is exactly "READ" or "EDIT".
1. You are now acting as the Fast Model. 
2. If the user said "**READ**": Use your `read_file` or `search_files` tools to gather the context requested in the chat history.
3. If the user said "**EDIT**": Use your `edit_file` or `write_to_file` tools to apply the exact code the previous model planned in the chat history.
4. **CRITICAL:** As soon as you finish reading or editing, DO NOT attempt to write new code or continue solving the problem. 
5. Immediately use your `ask` tool to say:
   > "Task complete. Please switch back to Gemini 3.6 and reply '**PROCEED**'."

---
**HARD CONSTRAINTS TO PREVENT LOOPING:**
- NEVER use `read_file`, `edit_file`, or `write_to_file` UNLESS the user just typed "READ" or "EDIT". 
- Always use the `ask` tool to halt your loop. Never just output plain text and assume the system will pause.