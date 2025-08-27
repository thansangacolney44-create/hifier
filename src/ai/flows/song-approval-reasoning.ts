'use server';

/**
 * @fileOverview A flow for reasoning about song approval based on title, description, and tags.
 *
 * - songApprovalReasoning - A function that handles the song approval reasoning process.
 * - SongApprovalReasoningInput - The input type for the songApprovalReasoning function.
 * - SongApprovalReasoningOutput - The return type for the songApprovalReasoning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SongApprovalReasoningInputSchema = z.object({
  title: z.string().describe('The title of the song.'),
  description: z.string().describe('The description of the song.'),
  tags: z.array(z.string()).describe('The tags associated with the song.'),
});
export type SongApprovalReasoningInput = z.infer<
  typeof SongApprovalReasoningInputSchema
>;

const SongApprovalReasoningOutputSchema = z.object({
  reasoning: z
    .string()
    .describe(
      'The detailed reasoning for approving or rejecting the song based on its title, description, and tags.'
    ),
  verdict: z
    .enum(['approve', 'reject'])
    .describe('The final verdict on whether to approve or reject the song.'),
});
export type SongApprovalReasoningOutput = z.infer<
  typeof SongApprovalReasoningOutputSchema
>;

export async function songApprovalReasoning(
  input: SongApprovalReasoningInput
): Promise<SongApprovalReasoningOutput> {
  return songApprovalReasoningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'songApprovalReasoningPrompt',
  input: {schema: SongApprovalReasoningInputSchema},
  output: {schema: SongApprovalReasoningOutputSchema},
  prompt: `You are an AI assistant tasked with providing reasoning for approving or rejecting a song upload on a music platform.

  Based on the song's title, description, and tags, provide a detailed reasoning for your verdict. Consider factors such as relevance, appropriateness, and adherence to platform guidelines.

  Title: {{{title}}}
  Description: {{{description}}}
  Tags: {{#each tags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Reasoning: Give a detailed explanation for the verdict.
  Verdict: Provide the final verdict, choosing from 'approve' or 'reject'.`,
});

const songApprovalReasoningFlow = ai.defineFlow(
  {
    name: 'songApprovalReasoningFlow',
    inputSchema: SongApprovalReasoningInputSchema,
    outputSchema: SongApprovalReasoningOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
