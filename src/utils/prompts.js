export const getTechnicalAnalysisPrompt = (data) => {
    return `follow ### Technical problem analysis instructions

Data: ${JSON.stringify(data)}`;
};

export const getOnboardingAnalysisPrompt = (data) => {
    return `follow ### Onboarding Analysis Guidelines

Data: ${JSON.stringify(data)}`;
};

export const getFeatureAnalysisPrompt = (data) => {
    return `follow ### Feature Request Analysis Guidelines

Data: ${JSON.stringify(data)}`;
};

export const getMeetingAnalysisPrompt = (data) => {
    return `follow ### Report Analysis Instructions

Data: ${JSON.stringify(data)}`;
};

export const getChurnRiskAnalysisPrompt = (user, issues, refunds, frozen) => {
    const data = {
        target_user: user,
        technical_issues: issues,
        refund_reports: refunds,
        freeze_reports: frozen
    };
    return `follow ### Chern Risk Analysis Guidelines

Data: ${JSON.stringify(data)}`;
};

export const getFeatureTitleGenerationPrompt = (features, description) => {
    // Send only the Feature Title and Description fields from ALL feature request reports.
    const simplifiedFeatures = features.map(f => ({ title: f.title, description: f.desc_text }));
    
    return `follow ### Feature Title Generation Guidelines

Existing Features: ${JSON.stringify(simplifiedFeatures)}

New Feature Description: "${description}"`;
};

export const getTechnicalClassificationPrompt = (description) => {
    return `follow ### Get classification of technical issues

Description: "${description}"`;
};

export const getGeneralChatbotPrompt = (allData, question) => {
    return `follow ### AI ChatBot

Context: ${JSON.stringify(allData)}

User Message: ${question}`;
};
