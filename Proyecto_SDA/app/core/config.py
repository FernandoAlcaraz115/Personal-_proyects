from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str = ""
    gemini_api_key: str = ""
    serper_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"
    default_llm_provider: str = "ollama"
    default_model: str = "llama3"

    class Config:
        env_file = ".env"


settings = Settings()
