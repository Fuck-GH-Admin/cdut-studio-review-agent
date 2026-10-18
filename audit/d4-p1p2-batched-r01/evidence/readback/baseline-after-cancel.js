const summaries = await window.reviewAPI.listCases()
return { caseCount: summaries.length, cases: summaries.map(({id,title,templateId,createdAt}) => ({id,title,templateId,createdAt})) }
