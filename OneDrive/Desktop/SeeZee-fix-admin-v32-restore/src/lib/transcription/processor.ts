import Anthropic from '@anthropic-ai/sdk';
import { db } from '@/server/db';
import fs from 'fs';
import path from 'path';

// Force read API key from .env.local to bypass VS Code terminal caching
function getOpenAIKeyFromEnvFile(): string | null {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/OPENAI_API_KEY=(.+)/);
      if (match) {
        return match[1].trim();
      }
    }
  } catch (e) {
    console.error('Failed to read .env.local:', e);
  }
  return null;
}

// Initialize OpenAI lazily to ensure fresh API key
function getOpenAIClient() {
  const OpenAI = require('openai').default;
  
  // Try .env.local first (bypasses VS Code terminal cache), fall back to process.env
  const apiKey = getOpenAIKeyFromEnvFile() || process.env.OPENAI_API_KEY;
  
  // Debug logging (remove after verification)
  console.log('🔑 OpenAI Key Check:', {
    prefix: apiKey?.slice(0, 8),
    suffix: apiKey?.slice(-4),
    length: apiKey?.length,
    hasKey: !!apiKey,
    source: getOpenAIKeyFromEnvFile() ? '.env.local file' : 'process.env'
  });
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }
  
  return new OpenAI({
    apiKey: apiKey,
  });
}

// Initialize Anthropic lazily
function getAnthropicClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

export async function processRecording(recordingId: string) {
  try {
    console.log(`Processing recording ${recordingId}...`);
    console.log(`Using OpenAI API key ending in: ...${process.env.OPENAI_API_KEY?.slice(-6)}`);

    // Get recording from database
    const recording = await db.recording.findUnique({
      where: { id: recordingId }
    });

    if (!recording) {
      throw new Error('Recording not found');
    }

    // Update status to PROCESSING
    await db.recording.update({
      where: { id: recordingId },
      data: { status: 'PROCESSING' }
    });

    // Get file path (should be in /public/uploads or similar)
    const filePath = recording.filePath.startsWith('/') 
      ? recording.filePath.substring(1) 
      : recording.filePath;
    
    const absolutePath = path.join(process.cwd(), 'public', filePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    // Read file as stream
    const audioFile = fs.createReadStream(absolutePath);

    console.log('Transcribing with Whisper...');

    // Get fresh OpenAI client
    const openai = getOpenAIClient();

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      language: 'en'
    });

    console.log('Transcription complete. Generating summary...');

    // Generate summary with Claude
    const summary = await generateSummary(transcription.text);

    console.log('Extracting action items...');

    // Extract action items with Claude
    const actionItems = await extractActionItems(transcription.text);

    console.log('Generating project brief...');

    // Generate project brief with Claude
    const projectBrief = await generateProjectBrief(transcription.text);

    console.log('Auto-categorizing recording...');

    // Auto-categorize the recording based on content
    const category = await categorizeRecording(transcription.text);

    console.log('Updating database...');

    // Update database
    await db.recording.update({
      where: { id: recordingId },
      data: {
        status: 'TRANSCRIBED',
        transcript: transcription.text,
        summary: summary,
        actionItems: actionItems as any,
        projectBrief: projectBrief as any,
        category: category as any,
        duration: (transcription as any).duration || 0,
        transcribedAt: new Date()
      }
    });

    console.log(`✅ Recording ${recordingId} processed successfully!`);

    return {
      success: true,
      transcript: transcription.text,
      summary,
      actionItems
    };

  } catch (error) {
    console.error(`Error processing recording ${recordingId}:`, error);

    // Update status to ERROR (errorMessage field doesn't exist in schema)
    try {
      await db.recording.update({
        where: { id: recordingId },
        data: {
          status: 'ERROR',
        }
      });
    } catch (updateError) {
      console.error('Failed to update recording status to ERROR:', updateError);
    }

    throw error;
  }
}

async function generateSummary(transcript: string): Promise<string> {
  const anthropic = getAnthropicClient();
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Summarize this client meeting transcript in 2-3 concise paragraphs.

Focus on:
- Main topics discussed
- Client needs and requirements
- Decisions made
- Timeline or budget mentioned
- Next steps agreed upon

TRANSCRIPT:
${transcript}

Provide a clear, professional summary.`
    }]
  });

  const textContent = message.content[0];
  return textContent.type === 'text' ? textContent.text : '';
}

async function extractActionItems(transcript: string): Promise<any[]> {
  const anthropic = getAnthropicClient();
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `Extract action items from this meeting transcript.

Return ONLY a JSON array in this exact format:
[
  {
    "task": "Description of task",
    "assignee": "Who is responsible (Sean, Zach, Client, or Unknown)",
    "deadline": "Deadline if mentioned, or 'Not specified'",
    "priority": "High, Medium, or Low"
  }
]

If no action items exist, return: []

TRANSCRIPT:
${transcript}

Return ONLY the JSON array, no other text.`
    }]
  });

  try {
    // Remove markdown code blocks if present
  const result = message.content[0];
  let jsonText = (result.type === 'text' ? result.text : '').trim();
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const actionItems = JSON.parse(jsonText);
    return Array.isArray(actionItems) ? actionItems : [];
  } catch (error) {
    console.error('Failed to parse action items:', error);
    return [];
  }
}

async function generateProjectBrief(transcript: string): Promise<any> {
  const anthropic = getAnthropicClient();
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `Generate a structured project brief from this client meeting transcript.

Return ONLY a JSON object in this exact format:
{
  "title": "Project Name",
  "description": "Brief project description",
  "requirements": ["Requirement 1", "Requirement 2", ...],
  "timeline": "Estimated timeline",
  "budget": "Budget range or 'To be determined'",
  "technologies": ["Tech 1", "Tech 2", ...],
  "deliverables": ["Deliverable 1", "Deliverable 2", ...]
}

Extract all relevant information from the transcript. If something isn't mentioned, use reasonable defaults or "Not specified".

TRANSCRIPT:
${transcript}

Return ONLY the JSON object, no other text.`
    }]
  });

  try {
    const result = message.content[0];
    let jsonText = (result.type === 'text' ? result.text : '').trim();
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Failed to parse project brief:', error);
    return {
      title: "Project Brief",
      description: "See transcript for details",
      requirements: [],
      timeline: "Not specified",
      budget: "Not specified"
    };
  }
}

async function categorizeRecording(transcript: string): Promise<string> {
  const anthropic = getAnthropicClient();
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 50,
    messages: [{
      role: 'user',
      content: `Categorize this meeting transcript into ONE of these categories:

DISCOVERY_CALL - Initial client meeting, learning about their needs
DESIGN_REVIEW - Reviewing designs, mockups, visual feedback
TECHNICAL_DISCUSSION - Code, development, technical planning
PROJECT_UPDATE - Progress updates, status meetings
BRAINSTORMING - Creative ideation, planning sessions
TRAINING - Teaching client how to use something
SUPPORT - Troubleshooting, fixing issues
INTERNAL - Team-only meeting (no client)
OTHER - Doesn't fit above categories

Return ONLY the category name, nothing else.

TRANSCRIPT:
${transcript.substring(0, 3000)}

Category:`
    }]
  });

  try {
    const result = message.content[0];
    const category = (result.type === 'text' ? result.text : '').trim().toUpperCase();
    
    const validCategories = [
      'DISCOVERY_CALL', 'DESIGN_REVIEW', 'TECHNICAL_DISCUSSION', 
      'PROJECT_UPDATE', 'BRAINSTORMING', 'TRAINING', 
      'SUPPORT', 'INTERNAL', 'OTHER'
    ];
    
    if (validCategories.includes(category)) {
      return category;
    }
    
    // Try to match partial responses
    for (const validCat of validCategories) {
      if (category.includes(validCat)) {
        return validCat;
      }
    }
    
    return 'OTHER';
  } catch (error) {
    console.error('Failed to categorize recording:', error);
    return 'OTHER';
  }
}
