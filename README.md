# Vardast Dashboard

## AI Integration

### Logic
The core logic for connecting to the Vardast AI API is located in:
`src/utils/vardast.js`

This file handles the API key, connection caching, and the fetch request to the AI endpoint.

### Prompts & Tools
All prompts and tool definitions sent to the AI Assistant are centralized in:
`src/utils/prompts.js`

The tools have been updated to support specific analysis sections with hardcoded system prompts:

-   **Technical Problem Analysis** (`getTechnicalAnalysisPrompt`): Sends ALL fields from technical issue reports (filtered by date). System Prompt: `follow ### Technical problem analysis instructions`
-   **Onboarding Analysis** (`getOnboardingAnalysisPrompt`): Sends ALL fields from onboarding reports (filtered by date). System Prompt: `follow ### Onboarding Analysis Guidelines`
-   **Feature Request Analysis** (`getFeatureAnalysisPrompt`): Sends ALL fields from feature request reports (filtered by date). System Prompt: `follow ### Feature Request Analysis Guidelines`
-   **Report/Meeting Analysis** (`getMeetingAnalysisPrompt`): Sends ALL fields from meeting reports (filtered by date). System Prompt: `follow ### Report Analysis Instructions`
-   **Churn Risk Analysis** (`getChurnRiskAnalysisPrompt`): Sends aggregated data (Technical, Refund, Freeze reports) filtered by date, along with the target user context. System Prompt: `follow ### Chern Risk Analysis Guidelines`
-   **Feature Title Generation** (`getFeatureTitleGenerationPrompt`): Sends Feature Title and Description from ALL feature request reports (no date filter). System Prompt: `follow ### Feature Title Generation Guidelines`
-   **Technical Classification** (`getTechnicalClassificationPrompt`): Sends the Description of the current form. System Prompt: `follow ### Get classification of technical issues`
-   **General AI ChatBot** (`getGeneralChatbotPrompt`): Sends the complete dataset including all tabs. System Prompt: `follow ### AI ChatBot`
