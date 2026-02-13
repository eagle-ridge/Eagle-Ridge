## Summary

- **`llms.txt`** — LLM-readable site summary following the [llmstxt.org](https://llmstxt.org/) standard. Covers pages, services, compliance frameworks, audiences, and contact info.
- **`.github/workflows/validate-llms-txt.yml`** — CI check that runs on PRs touching HTML or llms.txt. Validates structure (H1, blockquote, Pages section), verifies all URLs return 200, and warns when HTML changes without a corresponding llms.txt update.
- **`CLAUDE.md`** — Updated file table to document both new files.

## Test plan

- [ ] Verify `llms.txt` is accessible at eagleridge.io/llms.txt after merge
- [ ] Open a test PR modifying an HTML file without touching llms.txt — confirm drift warning appears
- [ ] Open a test PR with a broken URL in llms.txt — confirm the check fails
