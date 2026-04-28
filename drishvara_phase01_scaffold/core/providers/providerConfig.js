const providerConfig = {
  provider: process.env.DRISHVARA_PROVIDER || 'openai',
  model: process.env.DRISHVARA_MODEL || 'gpt-5',
  temperature: Number(process.env.DRISHVARA_TEMPERATURE || 0.2),
  maxTokens: Number(process.env.DRISHVARA_MAX_TOKENS || 4000),
};

export default providerConfig;
