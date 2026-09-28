/**
 * FR-04 & C-03: Rule-based recommendation matching engine (Strictly Non-ML).
 *
 * Weight Distribution:
 * - Academic Program: 40%
 * - Location: 20%
 * - Skill Intersection: 40%
 * Total = 100%
 */
export function calculateMatchScore(student, posting) {
  // 1. Program Match (40%)
  let programScore = 0;
  if (
    posting.requiredProgram === 'Any IT' ||
    posting.requiredProgram === student.academicProgram
  ) {
    programScore = 40;
  }

  // 2. Location Match (20%)
  let locationScore = 0;
  const studentLoc = (student.preferredLocation || '').trim().toLowerCase();
  const postingLoc = (posting.location || '').trim().toLowerCase();

  if (
    posting.isRemote ||
    studentLoc === 'remote' ||
    studentLoc === postingLoc ||
    studentLoc.includes(postingLoc) ||
    postingLoc.includes(studentLoc)
  ) {
    locationScore = 20;
  }

  // 3. Skill Intersection (40%)
  const requiredSkills = posting.requiredSkills || [];
  const studentSkills = student.technicalSkills || [];

  const matchedSkills = [];
  const missingSkills = [];

  requiredSkills.forEach((req) => {
    const isMatched = studentSkills.some(
      (s) => s.trim().toLowerCase() === req.trim().toLowerCase()
    );
    if (isMatched) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  let skillsScore = 0;
  if (requiredSkills.length === 0) {
    skillsScore = 40;
  } else {
    const ratio = matchedSkills.length / requiredSkills.length;
    skillsScore = Math.round(ratio * 40);
  }

  const totalScore = Math.min(100, Math.round(programScore + locationScore + skillsScore));

  return {
    programScore,
    locationScore,
    skillsScore,
    totalScore,
    matchedSkills,
    missingSkills,
  };
}
