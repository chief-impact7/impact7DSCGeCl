# 🤖 Claude Instruction
- **⚠️ GIT RESTRICTION:** DO NOT execute `git commit` or `git push` commands. Git management is handled exclusively by Gemini (Anti-Gravity) and the User. Focus only on code modification and testing.
- **Reference:** `gemini.md` (Master Plan), `gemini_notes.md` (Gemini's current work)
- **Your Workspace:** `claude_notes.md` (Write your thoughts/errors here)
- **Final Report:** Append your work results to `user_log.js`.

## ⚠️ Data Format for `user_log.js`
반드시 아래 JS 객체 포맷을 지켜서 배열의 마지막에 추가해:
{
  date: "YYYY-MM-DD HH:mm",
  author: "Claude",
  task: "작업 요약",
  files: ["수정된/파일/경로"],
  details: "상세 내용 및 특이사항"
}