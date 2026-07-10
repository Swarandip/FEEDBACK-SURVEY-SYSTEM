/**
 * Whether a student user may view/submit this feedback form.
 * @param {object} form - lean form document
 * @param {object} user - { _id or id, role, semester }
 */
function canStudentAccessForm(form, user) {
  if (!form || !user) return false;
  if (user.role !== 'student') return false;

  const audience = form.target_audience || 'student';
  if (audience !== 'student' && audience !== 'all') return false;

  const userId = String(user._id || user.id || '');
  const targetIds = form.target_student_ids || [];

  if (Array.isArray(targetIds) && targetIds.length > 0) {
    const allowed = targetIds.some((id) => String(id) === userId);
    if (!allowed) return false;
  }

  const sems = form.target_semesters || [];
  if (sems.length > 0) {
    const userSem = user.semester;
    if (userSem == null || !sems.includes(Number(userSem))) return false;
  }

  return true;
}

module.exports = { canStudentAccessForm };
