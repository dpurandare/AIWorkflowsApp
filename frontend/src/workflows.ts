export interface WorkflowField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number'
  required: boolean
  placeholder?: string
  hint?: string
  rows?: number
}

export interface WorkflowConfig {
  id: string
  name: string
  description: string
  category: string
  has_download: boolean
  fields: WorkflowField[]
}

export const WORKFLOW_CONFIGS: Record<string, WorkflowConfig> = {
  'person-researcher': {
    id: 'person-researcher',
    name: 'Person Search Report Generator',
    description:
      'Searches for information on a specific person using OpenAI, Google Gemini, and SerpAPI. Provide enough qualifying information to uniquely identify the person.',
    category: 'Person Research',
    has_download: false,
    fields: [
      {
        key: 'Person Name',
        label: 'Person Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Abhijit Joshi',
      },
      {
        key: 'Qualifying Information to uniquely identify the person',
        label: 'Qualifying Information',
        type: 'textarea',
        required: true,
        rows: 4,
        placeholder: 'e.g. He worked in KPIT, he lives in USA, he is from Pune India.',
        hint: 'Provide enough detail to uniquely identify this person — multiple people may share the same name.',
      },
    ],
  },

  'person-enrichment-apollo': {
    id: 'person-enrichment-apollo',
    name: 'Person Information Enrichment (Apollo.ai)',
    description:
      'Provides enriched information for an individual using Apollo.ai. First Name and Last Name are mandatory.',
    category: 'Person Research',
    has_download: false,
    fields: [
      { key: 'First Name', label: 'First Name', type: 'text', required: true, placeholder: 'e.g. Sarang' },
      { key: 'Last Name', label: 'Last Name', type: 'text', required: true, placeholder: 'e.g. Purandare' },
      { key: 'LinkedIn URL', label: 'LinkedIn URL', type: 'text', required: false, placeholder: 'https://linkedin.com/in/...' },
      { key: 'Email', label: 'Email', type: 'text', required: false, placeholder: 'person@example.com' },
      {
        key: 'Present or Past organization',
        label: 'Present or Past Organization',
        type: 'text',
        required: false,
        placeholder: 'e.g. Mindtree',
      },
    ],
  },

  'company-researcher': {
    id: 'company-researcher',
    name: 'Company Researcher',
    description:
      'Researches and enriches information for a specific company using OpenAI, Google Gemini, and SerpAPI.',
    category: 'Company Research',
    has_download: false,
    fields: [
      { key: 'Company Name', label: 'Company Name', type: 'text', required: true, placeholder: 'e.g. JSW Energy' },
      {
        key: 'Qualifying Information to uniquely identify the company',
        label: 'Qualifying Information',
        type: 'textarea',
        required: false,
        rows: 4,
        placeholder: 'e.g. Indian company in wind energy',
        hint: 'Provide details to uniquely identify the company and any specific areas you want researched.',
      },
    ],
  },

  'company-search-agent': {
    id: 'company-search-agent',
    name: 'Company Information Search Agent',
    description:
      'Uses parallel AI agents (Gemini + SerpAPI) for comprehensive company information search. Results are merged by a third agent.',
    category: 'Company Research',
    has_download: false,
    fields: [
      { key: 'Company Name', label: 'Company Name', type: 'text', required: true, placeholder: 'e.g. Suzlon' },
      {
        key: 'Additional Input',
        label: 'Additional Input',
        type: 'textarea',
        required: false,
        rows: 3,
        placeholder: 'e.g. Indian company in wind energy',
      },
    ],
  },

  'presentation-creator': {
    id: 'presentation-creator',
    name: 'Presentation Creator',
    description:
      'Generates a presentation using OpenAI, Gemini, SerpAPI, and Gamma AI. Returns download and view URLs for the generated deck.',
    category: 'Presentation Generation',
    has_download: true,
    fields: [
      {
        key: 'Topic',
        label: 'Topic',
        type: 'text',
        required: true,
        placeholder: 'e.g. Use of AI Agents in Web Applications development',
      },
      {
        key: 'Message to communicate',
        label: 'Message to Communicate',
        type: 'textarea',
        required: true,
        rows: 4,
        placeholder: 'Key messages and themes for the presentation',
        hint: 'Be as detailed as possible for better results.',
      },
      {
        key: 'Target Audience',
        label: 'Target Audience',
        type: 'text',
        required: true,
        placeholder: 'e.g. Web Developers, Programmers, Software Architects',
      },
      {
        key: 'Specific Areas you like to be covered',
        label: 'Specific Areas to Cover',
        type: 'textarea',
        required: false,
        rows: 3,
        placeholder: 'List specific topics or sections you want included',
      },
      {
        key: 'Page Count',
        label: 'Page Count',
        type: 'number',
        required: true,
        placeholder: '15',
      },
    ],
  },

  'tailored-presentation': {
    id: 'tailored-presentation',
    name: 'Tailored Presentation',
    description:
      'Generates a presentation tailored to a specific target company and person. AI agents customise the content for the audience. Returns download and view URLs.',
    category: 'Presentation Generation',
    has_download: true,
    fields: [
      { key: 'topic', label: 'Topic', type: 'text', required: true, placeholder: 'e.g. Data governance in Power Plants' },
      {
        key: 'message_to_communicate',
        label: 'Message to Communicate',
        type: 'textarea',
        required: true,
        rows: 4,
        placeholder: 'Key messages and themes',
      },
      {
        key: 'target_audience',
        label: 'Target Audience',
        type: 'text',
        required: true,
        placeholder: 'e.g. CXO, IT Directors',
      },
      {
        key: 'specific_areas_to_cover',
        label: 'Specific Areas to Cover',
        type: 'textarea',
        required: false,
        rows: 3,
        placeholder: 'e.g. Challenges, Solutions, Use of AI, Quality control, Security',
      },
      {
        key: 'page_count',
        label: 'Page Count',
        type: 'number',
        required: true,
        placeholder: '10',
      },
      {
        key: 'target_person_details',
        label: 'Target Person Details',
        type: 'textarea',
        required: false,
        rows: 3,
        placeholder: 'Details about the specific person this presentation targets (leave blank if targeting a general audience)',
      },
      {
        key: 'target_company_details',
        label: 'Target Company Details',
        type: 'textarea',
        required: true,
        rows: 8,
        placeholder: 'Paste the company research report here',
        hint: 'Run the Company Researcher workflow first to generate a detailed company profile.',
      },
    ],
  },

  'custom-services-presentation': {
    id: 'custom-services-presentation',
    name: 'Custom Services Presentation',
    description:
      'Analyses target company and person against our services catalogue to suggest relevant offerings and produce a presentation content skeleton.',
    category: 'Presentation Generation',
    has_download: false,
    fields: [
      {
        key: 'Company Information',
        label: 'Company Information',
        type: 'textarea',
        required: true,
        rows: 10,
        placeholder: 'Paste the company research report here',
        hint: 'Use the Company Researcher or Company Search Agent workflow first to generate a detailed profile.',
      },
      {
        key: 'Person Information',
        label: 'Person Information',
        type: 'textarea',
        required: true,
        rows: 10,
        placeholder: 'Paste the person research report here',
        hint: 'Use the Person Researcher workflow first to generate a detailed profile.',
      },
    ],
  },
}
