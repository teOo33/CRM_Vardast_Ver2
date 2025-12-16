# Vardast Dashboard

## AI Integration

### Logic
The core logic for connecting to the Vardast AI API is located in:
`src/utils/vardast.js`

This file handles the API key, connection caching, and the fetch request to the AI endpoint.

### Prompts
All prompts sent to the AI Assistant are centralized in:
`src/utils/prompts.js`

You can modify the prompts in this file to change how the AI analyzes churn, generates feature titles, classifies technical issues, or responds in the chat.

- `getChurnAnalysisPrompt`: Used in Dashboard for User Churn Analysis.
- `getFeatureTitlePrompt`: Used in Feature Request form to generate titles.
- `getAnalysisPrompt`: Used in the AI Analysis tab.
- `getChatPrompt`: Used in the AI Chat box.
- `getTechnicalIssueClassificationPrompt`: Used in the Technical Issue form for auto-filling fields.
