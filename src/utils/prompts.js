export const getChurnAnalysisPrompt = (user) => `User: ${user.username}, Count: ${user.count}, Issues: ${JSON.stringify(user.issues)}`;

export const getFeatureTitlePrompt = (context, description) => `Context (Existing Features):\n${context}\n\nNew Feature Description: "${description}"\n\nTask: Generate a short, concise Persian title for this new feature based on its description. Return ONLY the title.`;

export const getAnalysisPrompt = (data) => `Data: ${JSON.stringify(data)}`;

export const getChatPrompt = (contextData, question) => `Context: ${JSON.stringify(contextData)}\n\nQuestion: ${question}`;

export const getTechnicalIssueClassificationPrompt = (description, modules, types) => `
Description: "${description}"

Available Modules: ${modules.join(', ')}
Available Types: ${types.join(', ')}

Task: Analyze the description and categorize it into one of the Available Modules and one of the Available Types.
Return ONLY a JSON object with keys "module" and "type".
Example: {"module": "UI/UX", "type": "باگ فنی"}
`;
