# CLAUDE.md - Eagle Ridge Advisory Project

*This file provides guidance to Claude Code when working with this repository*

## Project Overview

**Eagle Ridge Advisory** - Landing page for technology consulting firm specializing in PE/VC portfolio companies.

- **Repository**: https://github.com/eagle-ridge/Eagle-Ridge
- **Tech Stack**: HTML, CSS, JavaScript (static site)

## Repository Structure
```
Eagle-Ridge/
├── CLAUDE.md           # This file - Claude Code context
├── eagleridge_landing.html  # Main landing page
├── ERA - 1.png        # Logo image
└── .git/              # Git repository
```

## Git Workflow - ALWAYS Follow This

### CRITICAL: Never Work on Main Branch
```bash
# ALWAYS check current branch first
git branch

# ALWAYS create feature branch for changes
git checkout -b feature/descriptive-name

# ALWAYS pull latest changes first
git pull origin main
```

### Safe Commit Process
```bash
# Review changes before committing
git diff

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Action: Clear description of what changed"

# Push to feature branch
git push origin feature/descriptive-name

# Create PR on GitHub - NEVER push directly to main
```

## Development Workflow

### Local Development
```bash
# For static HTML, open directly in browser
open eagleridge_landing.html

# Or use a local server (if python available)
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Testing Before Commit
- Open HTML in multiple browsers
- Test responsive design on mobile
- Validate HTML markup
- Check all links work
- Test image loading

## Code Style & Standards

### HTML/CSS Guidelines
- Use semantic HTML5 elements
- Maintain consistent indentation
- Keep inline styles minimal (use style tags or external CSS)
- Optimize images before adding to repo
- Write accessible markup (alt text, ARIA labels, etc.)

### File Naming
- Use lowercase with hyphens for files
- Be descriptive but concise
- Avoid spaces in filenames (use hyphens or underscores)

## GitHub Best Practices

### Branch Naming
```bash
feature/add-contact-form
fix/logo-alignment
update/hero-copy
refactor/css-structure
```

### Commit Messages
```bash
# Good commit messages
"Add contact form with validation"
"Fix: Correct logo image path"
"Update hero section copy"
"Refactor: Consolidate CSS styles"

# Avoid vague messages
"updates"
"fix stuff"
"changes"
```

### Pull Request Workflow
```bash
# Create PR from command line (requires gh CLI)
gh pr create --title "Feature: Description" --body "Details about changes"

# View PR status
gh pr status

# Merge after approval
gh pr merge
```

## Security Best Practices

### NEVER Commit These Items
```bash
.env                    # Environment variables
config/secrets.yml      # Any secrets or API keys
*.log                   # Log files
.vscode/settings.json   # May contain local paths/tokens
node_modules/           # Dependencies (if using npm)
```

### Safe Practices
- No hardcoded API keys or tokens
- Use environment variables for sensitive data
- Review git history before making repo public
- Use `.gitignore` for local config files

## Common Tasks & Commands

### Creating New Files
```bash
# New page
touch new-page.html

# New stylesheet
touch assets/css/styles.css

# New directory
mkdir assets/images
```

### Git Operations
```bash
# View commit history
git log --oneline

# Check what changed
git diff

# Undo uncommitted changes
git checkout -- filename.html

# View branch info
git branch -v

# Delete local branch
git branch -d feature/branch-name
```

### GitHub CLI Commands
```bash
# View repository info
gh repo view

# List open PRs
gh pr list

# View PR details
gh pr view 123

# Create issue
gh issue create
```

## Emergency Procedures

### If Something Breaks
```bash
# Revert last commit (if not pushed)
git reset --soft HEAD~1

# Revert specific file
git checkout -- filename.html

# Revert after pushing
git revert HEAD
```

### If You Accidentally Commit to Main
```bash
# Move changes to new branch
git branch feature/my-changes
git reset --hard origin/main
git checkout feature/my-changes
```

## Claude Code Best Practices

### Effective Prompts
```bash
# Good prompts - specific and contextual
"Add a contact form section to the landing page"
"Update the hero section copy to emphasize cybersecurity"
"Fix responsive layout issues on mobile"

# Avoid vague prompts
"make it better"
"add features"
```

### Multi-Step Workflow Pattern
1. **Explore**: Read existing files and understand structure
2. **Plan**: Create detailed plan without writing code
3. **Implement**: Execute the plan
4. **Test**: Verify changes work correctly
5. **Commit**: Create descriptive commit and push to feature branch

## Quick Reference

### Essential Commands
```bash
git status              # Check current status
git branch              # View branches
git diff                # Review changes
git add .               # Stage all changes
git commit -m "msg"     # Commit changes
git push origin branch  # Push to remote
gh pr create            # Create pull request
```

### File Paths
- Landing page: `eagleridge_landing.html`
- Logo: `ERA - 1.png`
- Project docs: `CLAUDE.md` (this file)

---

*This file is version-controlled. Update it as the project evolves.*
