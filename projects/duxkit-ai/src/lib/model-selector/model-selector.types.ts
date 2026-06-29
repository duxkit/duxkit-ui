export type ModelSelectorProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'mistral'
  | 'xai'
  | 'perplexity'
  | 'deepseek'
  | 'openrouter'
  | 'amazon-bedrock'
  | 'azure'
  | 'groq'
  | 'togetherai'
  | 'huggingface'
  | 'vercel'
  | 'github-models'
  | 'github-copilot'
  | 'fireworks-ai'
  | 'nvidia'
  | 'cerebras'
  | 'cloudflare-workers-ai'
  | 'moonshotai'
  | 'zai'
  | 'zhipuai'
  | 'alibaba'
  | 'llama'
  | (string & {});

export interface ModelSelectorModel {
  readonly id: string;
  readonly name: string;
  readonly provider: ModelSelectorProvider;
  readonly providerLabel?: string;
  readonly providerSlug?: ModelSelectorProvider;
  readonly description?: string;
  readonly aliases?: readonly string[];
  readonly shortcut?: string;
  readonly disabled?: boolean;
}

export interface ModelSelectorGroupData {
  readonly provider: ModelSelectorProvider;
  readonly heading: string;
  readonly models: readonly ModelSelectorModel[];
}

export function createModelSelectorSearchValue(model: ModelSelectorModel): string {
  return [
    model.id,
    model.name,
    model.provider,
    model.providerLabel,
    model.providerSlug,
    model.description,
    ...(model.aliases ?? []),
  ]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ');
}

export function groupModelSelectorModels(
  models: readonly ModelSelectorModel[],
): readonly ModelSelectorGroupData[] {
  const groups = new Map<ModelSelectorProvider, ModelSelectorModel[]>();
  const headings = new Map<ModelSelectorProvider, string>();

  for (const model of models) {
    const providerModels = groups.get(model.provider);

    if (providerModels === undefined) {
      groups.set(model.provider, [model]);
      headings.set(model.provider, model.providerLabel ?? model.provider);
    } else {
      providerModels.push(model);
    }
  }

  return Array.from(groups.entries()).map(([provider, groupedModels]) => ({
    provider,
    heading: headings.get(provider) ?? provider,
    models: groupedModels,
  }));
}

export function modelSelectorFuzzyFilter(value: string, search: string): boolean {
  const normalizedValue = normalizeModelSelectorSearchText(value);
  const tokens = normalizeModelSelectorSearchText(search).split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return true;
  }

  return tokens.every(
    (token) => normalizedValue.includes(token) || isOrderedCharacterMatch(normalizedValue, token),
  );
}

function normalizeModelSelectorSearchText(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function isOrderedCharacterMatch(value: string, token: string): boolean {
  let valueIndex = 0;

  for (const tokenCharacter of token) {
    valueIndex = value.indexOf(tokenCharacter, valueIndex);

    if (valueIndex === -1) {
      return false;
    }

    valueIndex += 1;
  }

  return true;
}
