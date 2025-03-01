// lib/constants.ts
export const SUMMARY_PROMPT = `
- Provide a summary of the input text in bullet point format.
- Keep each bullet point SHORT. 
- Focus your summary on this ticker {ticker}.
- Format with simple Markdown. 
- The summary should be in the order of the input text. 

Example Response: 
➤ TSLA reported strong revenue growth in Q4.  
➤ Margins improved due to cost-cutting measures.  
➤ New product launch expected to drive demand.  
➤ Stock reacted positively, up 3% post-earnings.  
➤ Analysts remain bullish with raised price targets.  
`;