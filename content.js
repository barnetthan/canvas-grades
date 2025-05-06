function injectGrades(courseIdToGradeMap) {
  const courseCards = document.querySelectorAll('.ic-DashboardCard__header');

  courseCards.forEach(card => {
    const link = card.querySelector('a.ic-DashboardCard__link');
    if (!link) return;

    const href = link.getAttribute('href');
    const match = href.match(/\/courses\/(\d+)/);
    const courseId = match ? match[1] : null;

    if (courseId && courseIdToGradeMap[courseId]) {
      const grade = courseIdToGradeMap[courseId];

      const heroDiv = card.querySelector('.ic-DashboardCard__header_hero');
      if (heroDiv && !heroDiv.querySelector('.grade-badge')) {
        const gradeTag = document.createElement('div');
        gradeTag.className = 'grade-badge';
        gradeTag.textContent = `Grade: ${grade}`;
        gradeTag.style.position = 'absolute';
        gradeTag.style.top = '8px';
        gradeTag.style.left = '8px';
        gradeTag.style.background = 'rgba(255, 255, 255, 0.7)';
        gradeTag.style.padding = '4px 6px';
        gradeTag.style.borderRadius = '6px';
        gradeTag.style.fontSize = '14px';
        gradeTag.style.fontWeight = 'bold';
        gradeTag.style.color = 'black';
        gradeTag.style.zIndex = '2';

        heroDiv.style.position = 'relative';
        heroDiv.appendChild(gradeTag);
      }
    }
  });
}

function fetchAndInjectGrades() {
  fetch('/grades')
    .then(res => res.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const rows = doc.querySelectorAll('tr');

      const courseIdToGradeMap = {};

      rows.forEach(row => {
        const linkEl = row.querySelector('.course a');
        const percentEl = row.querySelector('.percent');

        if (linkEl && percentEl) {
          const href = linkEl.getAttribute('href');
          const match = href.match(/\/courses\/(\d+)/);
          const courseId = match ? match[1] : null;

          if (courseId) {
            const grade = percentEl.textContent.trim();
            courseIdToGradeMap[courseId] = grade;
          }
        }
      });

      injectGrades(courseIdToGradeMap);
    })
    .catch(err => console.error('Error fetching grades:', err));
}

// Observe DOM changes and re-inject when needed
const observer = new MutationObserver(() => {
  if (window.location.pathname === '/') {
    fetchAndInjectGrades();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial run
if (window.location.pathname === '/') {
  fetchAndInjectGrades();
}
