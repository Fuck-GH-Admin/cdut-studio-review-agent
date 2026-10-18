const cases = await window.reviewAPI.listCases()
return cases.map(({ id, title, type, applicant, academicYear, documentCount, isDemo }) => ({
  id, title, type, applicant, academicYear, documentCount, isDemo,
}))
