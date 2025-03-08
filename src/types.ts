export interface Tab {
  id: string;
  name: string;
  content: string;
}

export interface UserSettings {
  id?: string;
  user_id?: string;
  email: string;
  emailPassword: string;
  openaiKey: string;
  recipientEmail: string;
  preferredModel: string;
}

export interface LineContent {
  text: string;
  checked?: boolean;
}

export type OpenAIModel = {
  id: string;
  name: string;
  description: string;
};

export const OPENAI_MODELS: OpenAIModel[] = [
  {
    id: "gpt-4o",
    name: "GPT-4O",
    description: "Most advanced model for complex tasks"
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4O Mini",
    description: "Faster, lighter version of GPT-4O"
  }
];