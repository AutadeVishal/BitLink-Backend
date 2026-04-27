const clampSkillLevel = (value, fallback = 5) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return Math.max(1, Math.min(10, Math.round(parsed)));
};

const normalizeSkillEntry = (entry, fallbackLevel = 5) => {
  if (typeof entry === "string") {
    const skillName = entry.trim();
    if (!skillName) {
      return null;
    }
    return { name: skillName, level: clampSkillLevel(fallbackLevel, 5) };
  }

  if (!entry || typeof entry !== "object") {
    return null;
  }

  const rawName = typeof entry.name === "string" ? entry.name.trim() : "";
  if (!rawName) {
    return null;
  }

  return {
    name: rawName,
    level: clampSkillLevel(entry.level, fallbackLevel)
  };
};

const normalizeSkillList = (skills = [], fallbackLevel = 5) => {
  const incomingSkills = Array.isArray(skills) ? skills : [];
  const skillMap = new Map();

  incomingSkills.forEach((entry) => {
    const normalized = normalizeSkillEntry(entry, fallbackLevel);
    if (!normalized) {
      return;
    }

    const key = normalized.name.toLowerCase();
    const existing = skillMap.get(key);

    if (!existing) {
      skillMap.set(key, normalized);
      return;
    }

    existing.level = Math.max(existing.level, normalized.level);
  });

  return Array.from(skillMap.values());
};

const mergeSkillsWithBaseLevel = (existingSkills = [], incomingSkills = [], baseLevel = 5) => {
  const safeBaseLevel = clampSkillLevel(baseLevel, 5);
  const mergedMap = new Map();

  normalizeSkillList(existingSkills, safeBaseLevel).forEach((skill) => {
    mergedMap.set(skill.name.toLowerCase(), { ...skill });
  });

  normalizeSkillList(incomingSkills, safeBaseLevel).forEach((skill) => {
    const key = skill.name.toLowerCase();
    const levelToApply = Math.max(skill.level, safeBaseLevel);
    const existing = mergedMap.get(key);

    if (!existing) {
      mergedMap.set(key, { name: skill.name, level: levelToApply });
      return;
    }

    existing.level = Math.max(existing.level, levelToApply);
  });

  return Array.from(mergedMap.values());
};

const toSkillNameList = (skills = []) => normalizeSkillList(skills).map((skill) => skill.name);

module.exports = {
  clampSkillLevel,
  mergeSkillsWithBaseLevel,
  normalizeSkillEntry,
  normalizeSkillList,
  toSkillNameList
};