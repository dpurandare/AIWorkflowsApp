from typing import Dict, Any

WORKFLOWS: Dict[str, Dict[str, Any]] = {
    "person-researcher": {
        "name": "Person Search Report Generator",
        "workflow_name": "API-Person-Researcher",
        "description": (
            "Searches for information on a specific person using OpenAI, Google Gemini, "
            "and SerpAPI. Provide enough qualifying information to uniquely identify the person."
        ),
        "category": "Person Research",
        "url": "https://n8n.jade-biz.com/webhook/d84df566-c0d4-4a83-94c5-f9d69837ac72",
        "has_download": False,
    },
    "person-enrichment-apollo": {
        "name": "Person Information Enrichment (Apollo.ai)",
        "workflow_name": "API-PersonEnrichmentApollo",
        "description": (
            "Provides enriched information for an individual using Apollo.ai. "
            "First Name and Last Name are mandatory."
        ),
        "category": "Person Research",
        "url": "https://n8n.jade-biz.com/webhook/ccb7ab3b-e2d9-47c4-a303-3787b8a0e4f6",
        "has_download": False,
    },
    "company-researcher": {
        "name": "Company Researcher",
        "workflow_name": "API-Company-Researcher",
        "description": (
            "Researches and enriches information for a specific company using OpenAI, "
            "Google Gemini, and SerpAPI. Provide qualifying information for best results."
        ),
        "category": "Company Research",
        "url": "https://n8n.jade-biz.com/webhook/9ae63b1b-d223-4fd7-84f0-e36d250bbbe2",
        "has_download": False,
    },
    "company-search-agent": {
        "name": "Company Information Search Agent",
        "workflow_name": "API-CompanySearchAgent",
        "description": (
            "Uses parallel AI agents (Gemini + SerpAPI) for comprehensive company "
            "information search. Results are merged by a third agent."
        ),
        "category": "Company Research",
        "url": "https://n8n.jade-biz.com/webhook/fe8ec947-1792-42f7-bf6b-5d4427c34349",
        "has_download": False,
    },
    "presentation-creator": {
        "name": "Presentation Creator",
        "workflow_name": "API-Presentation-Creator",
        "description": (
            "Generates a presentation using OpenAI, Gemini, SerpAPI, and Gamma AI. "
            "Returns download and view URLs for the generated deck."
        ),
        "category": "Presentation Generation",
        "url": "https://n8n.jade-biz.com/webhook/d817dc70-357e-4be6-a6af-50dd9a7191af",
        "has_download": True,
    },
    "tailored-presentation": {
        "name": "Tailored Presentation",
        "workflow_name": "API-Tailored-Presentation",
        "description": (
            "Generates a presentation tailored to a specific target company and person. "
            "AI agents customise the content for the audience. Returns download and view URLs."
        ),
        "category": "Presentation Generation",
        "url": "https://n8n.jade-biz.com/webhook/220a05d4-4cee-483a-b8de-2428e18d34b4",
        "has_download": True,
    },
    "custom-services-presentation": {
        "name": "Custom Services Presentation",
        "workflow_name": "API-CustomServicesPresentationContentsForTarget",
        "description": (
            "Analyses target company and person information against our services catalogue "
            "to suggest offerings and produce a presentation content skeleton."
        ),
        "category": "Presentation Generation",
        "url": "https://n8n.jade-biz.com/webhook/5c9e0ac0-72c3-40ba-9a55-5c55e9609e79",
        "has_download": False,
    },
}
