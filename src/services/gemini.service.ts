
import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

export interface WebsiteCode {
  html: string;
  css: string;
  javascript: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // IMPORTANT: The API key is sourced from environment variables.
    // Do not hardcode or expose the key in the client-side code.
    // This setup assumes the build process or environment handles `process.env.API_KEY`.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable not set.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateWebsiteCode(prompt: string): Promise<WebsiteCode> {
    const fullPrompt = `
      You are an expert web developer specializing in creating beautiful, responsive, and modern single-page websites.
      Based on the user's prompt, create a complete website.
      The response must be a JSON object with three keys: "html", "css", and "javascript".

      - "html": This should contain the body content of the website. Do not include <html>, <head>, or <body> tags.
      - "css": This should contain all the necessary CSS to style the website. It will be placed in a <style> tag in the head. Do not include <style> tags.
      - "javascript": This should contain any JavaScript for interactivity. It will be placed in a <script> tag before the closing </body> tag. Do not include <script> tags.

      User's prompt: "${prompt}"

      Generate the code now.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              html: { type: Type.STRING, description: 'The HTML body content of the website.' },
              css: { type: Type.STRING, description: 'The CSS styles for the website.' },
              javascript: { type: Type.STRING, description: 'The JavaScript for website interactivity.' },
            },
            required: ["html", "css", "javascript"],
          },
        },
      });

      const responseText = response.text.trim();
      const parsedJson = JSON.parse(responseText);
      
      return parsedJson as WebsiteCode;

    } catch (error) {
      console.error('Error generating website code:', error);
      throw new Error('Failed to generate website code from Gemini API.');
    }
  }
}
