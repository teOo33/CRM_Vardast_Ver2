export const getChurnAnalysisPrompt = (user, issues, frozen, refunds) => {
    // فیلتر کردن رکوردهای مربوط به این کاربر خاص
    const userIssues = issues.filter(i => i.username === user.username);
    const userFrozen = frozen.filter(f => f.username === user.username);
    const userRefunds = refunds.filter(r => r.username === user.username);

    return `
    User: ${user.username}
    
    Technical Issues:
    ${JSON.stringify(userIssues)}
    
    Frozen Reports:
    ${JSON.stringify(userFrozen)}
    
    Refund Requests:
    ${JSON.stringify(userRefunds)}
    
    Follow the ###Cherne Risk Calculation Instructions
    `;
};

export const getFeatureTitlePrompt = (context, description) => `
Context (Existing Features):
${context}

New Feature Description: "${description}"

Follow the ###Feature Title Generation Guidelines
`;

export const getAnalysisPrompt = (type, data) => {
    let typeName = '';
    switch(type) {
        case 'general': typeName = 'Technical Issues'; break;
        case 'onboarding': typeName = 'Onboarding Reports'; break;
        case 'features': typeName = 'Feature Requests'; break;
        case 'meetings': typeName = 'Meeting Reports'; break;
        default: typeName = 'Data';
    }
    return `
    Data Type: ${typeName}
    Data: ${JSON.stringify(data)}
    
    Follow ###Comprehensive data analysis
    `;
};

// --- بدون تغییر ---
export const getChatPrompt = (contextData, question) => `Context: ${JSON.stringify(contextData)}\n\nQuestion: ${question}`;

// --- بدون تغییر ---
export const getTechnicalIssueClassificationPrompt = (description, modules, types) => `
Description: "${description}"

Available Modules: ${modules.join(', ')}
Available Types: ${types.join(', ')}

Task: Analyze the description and categorize it into one of the Available Modules and one of the Available Types.
Return ONLY a JSON object with keys "module" and "type".
Example: {"module": "UI/UX", "type": "باگ فنی"}
`;