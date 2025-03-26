// backend/src/functions/claude/generateProjectPlan.js
const { Claude } = require('@anthropic-ai/claude-sdk');
const { DynamoDB } = require('aws-sdk');

exports.handler = async (event) => {
  // Parse input parameters
  const { projectId, targetAudience, platformType, developmentTimeframe, keyFeatures, additionalContext } = JSON.parse(event.body);

  // Initialize Claude client
  const claude = new Claude(process.env.CLAUDE_API_KEY);

  // Construct detailed prompt for plan generation
  const prompt = `
You are a senior product manager and technical architect helping to generate a comprehensive project plan for a software development project.

Project Context:
- Target Audience: ${targetAudience}
- Platform Type: ${platformType}
- Development Timeframe: ${developmentTimeframe}
- Key Features: ${keyFeatures.join(', ')}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Generate a structured project plan with the following requirements:
1. Break down the project into 3-5 major epics
2. For each epic, define 3-5 user stories
3. Provide a clear description for each epic and user story
4. Estimate effort and complexity for each epic
5. Suggest a high-level timeline
6. Identify potential technical challenges and mitigation strategies

Output Format (STRICT JSON):
{
  "projectName": "string",
  "projectDescription": "string",
  "totalEstimatedHours": number,
  "estimatedCompletionTimeframe": "string",
  "epics": [
    {
      "name": "string",
      "description": "string",
      "estimatedStartWeek": number,
      "estimatedEndWeek": number,
      "userStories": [
        {
          "title": "string",
          "description": "string",
          "acceptanceCriteria": ["string"],
          "estimatedHours": number
        }
      ]
    }
  ]
}

Respond ONLY with the JSON structure. Do not include any additional text or explanation.`;

  try {
    // Generate plan using Claude
    const response = await claude.complete({
      prompt,
      max_tokens_to_sample: 4000,
      model: 'claude-v1',
      stop_sequences: ['}]}\n'],
      temperature: 0.7
    });

    // Parse the JSON response
    const projectPlan = JSON.parse(response);

    // Save plan to DynamoDB
    const dynamodb = new DynamoDB.DocumentClient();
    await dynamodb.put({
      TableName: process.env.PROJECT_PLANS_TABLE,
      Item: {
        projectId,
        plan: projectPlan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(projectPlan)
    };
  } catch (error) {
    console.error('Plan generation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to generate project plan', 
        details: error.message 
      })
    };
  }
};