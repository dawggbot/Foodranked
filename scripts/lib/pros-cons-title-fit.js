const PROS_CONS_TITLE_MAX_CHARS = 64;
const PROS_CONS_TITLE_MAX_LINES = 3;
const PROS_CONS_TITLE_TEXTBOX = {
  width: 65,
  fontSize: 5,
  textBoxHeight: 18,
  clipBleed: 2
};

function normalizeProsConsTitle(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function prosConsTitleLength(value) {
  return Array.from(String(value ?? '')).length;
}

function prosConsTitleTextIssues(value) {
  const original = String(value ?? '');
  const normalized = normalizeProsConsTitle(original);
  const issues = [];

  if (!normalized) {
    issues.push({ code: 'missing', message: 'title is required' });
    return issues;
  }

  if (original !== normalized) {
    issues.push({ code: 'spacing', message: 'title must be trimmed and single-spaced' });
  }

  const length = prosConsTitleLength(normalized);
  if (length > PROS_CONS_TITLE_MAX_CHARS) {
    issues.push({
      code: 'too_long',
      message: `title must be ${PROS_CONS_TITLE_MAX_CHARS} characters or fewer`,
      length,
      max: PROS_CONS_TITLE_MAX_CHARS
    });
  }

  return issues;
}

module.exports = {
  PROS_CONS_TITLE_MAX_CHARS,
  PROS_CONS_TITLE_MAX_LINES,
  PROS_CONS_TITLE_TEXTBOX,
  normalizeProsConsTitle,
  prosConsTitleLength,
  prosConsTitleTextIssues
};
