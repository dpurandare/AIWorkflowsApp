# Information Retrieval Workflows on n8n server

Various Workflows available on n8n. These workflows are available on the Jade Business Services n8n instance which is available at <https://n8n.jade-biz.com>
Those workflows are exposed as API and this document explains all available APIs.

## There are three main types of workflows:
- Person Information research and enrichment
- Company Information research and enrichment
- Presentation Generation

---

## Person Information Research and Enrichment

### Workflow 1: Person Search Report Generator
- Workflow Name : API-Person-Researcher
- Description: This workflow uses OpenAI, Google Gemini and SerpAPI to search for information on a specific person. You need to provide adequate information in order to distinctly identify the person. If you fail to do that the information may not be accurate. It is common to find multiple people sharing same name.
- This form takes input for carrying out person search and produce a report. The reports are stored on the google drive with the update in a Google Sheet. Also, when the workflow is called through API, the return value has the contents of the result which could be consumed without worrying about accessing the Google Drive.
- POST URL: <https://n8n.jade-biz.com/webhook/d84df566-c0d4-4a83-94c5-f9d69837ac72>
- Body: raw, JSON in following example format

```json
{
  "Person Name": "Abhijit Joshi",
  "Qualifying Information to uniquely identify the person": "He worked in KPIT, he lives in USA, he is from Pune India."
}
```

- For now the API is not secure, in future we move to basic authentication.
- The workflow can be executed by reaching out to this WebForm: <https://n8n.jade-biz.com/form/e8ea2255-fe31-4014-b8fb-eed89c992e81>

### Workflow 2: Person Information Enrichment using Apollo.ai
- Workflow Name: API-PersonEnrichmentApollo
- Description: This workflow uses Apollo.ai for providing enriched information for an individual. Provide as much information possible so that the person is uniquely identified. First Name and Last Name are mandatory and if you do not provide those the workflow will fail.
- Note: In case you do not know one of this, the flow is of no use to you. If there is any requirement to accommodate such cases where person has only First or Last name, we will do something, for now, we need both. When you run this through API, you will get the result in the return value. When it is ran using WebForm the results will be on the Google Drive.
- POST URL: <https://n8n.jade-biz.com/webhook/ccb7ab3b-e2d9-47c4-a303-3787b8a0e4f6>
- Body raw JSON example:

```json
{
  "First Name": "Sarang",
  "Last Name": "Purandare",
  "LinkedIn URL": "",
  "Email": "",
  "Present or Past organization": "Mindtree"
}
```

- This workflow also has a WebForm: <https://n8n.jade-biz.com/form/77e3c76e-c4a3-43b3-b864-132228c55fc3>

---

## Company Information research and enrichment

### Workflow 1: Company Researcher
- Workflow Name: API-Company-Researcher
- Description: This workflow employs typical researcher, reviewer pattern of information research and enrichment for specific company. This uses OpenAI and Google Gemini in the AI Agents and used the SerpAPI tool for internet search. When called through API the return value to the API will have the result. When called using WebForm the data will be on Google Drive. Provide as much information possible so that you get proper response. If you need specific details about the company, mention those in the Qualifying Information.
- POST URL: <https://n8n.jade-biz.com/webhook/9ae63b1b-d223-4fd7-84f0-e36d250bbbe2>
- Body raw JSON example:

```json
{
  "Company Name": "JSW Energy",
  "Qualifying Information to uniquely identify the company": "Indian company in wind energy"
}
```

- WebForm: <https://n8n.jade-biz.com/form/462c8d77-399e-4f05-ba69-6b7bb28dfb74>

### Workflow 2: Company Information Search Agent
- Workflow Name: API-CompanySearchAgent
- Description: This workflow uses parallel information search by a Gemini AI Agent using SerpAPI and Basic LLM Chain using Google Gemini that uses implicit information and the Google Search by Gemini. The information provided by these two is merged by a third agent. When called the API the results are in the return value.
- POST URL: <https://n8n.jade-biz.com/webhook/fe8ec947-1792-42f7-bf6b-5d4427c34349>
- Body raw JSON example:

```json
{
  "Company Name": "Suzlon",
  "Additional Input": "Indian company"
}
```

- WebForm URL: <https://n8n.jade-biz.com/form/9a48c82f-7b4f-4a85-b29b-26690d56754d>

---

## Presentation Generation

### Workflow 1:
- Workflow Name: API-Presentation-Creator
- Description: This workflow generates a presentation using the OpenAI, Gemini, SerpApi and Gamma AI.
- This workflow uses the researcher, reviewer patter to search for the useful information for the presentation and use the Gamma AI service to create the presentation deck. This API call returns the details of the generation such as the Presentation name, download URL, view URL, status, etc. The generated presentation needs to be downloaded using the download URL.
- Be as detailed as possible with the information you provide for the presentation generation for better results.
- POST URL: <https://n8n.jade-biz.com/webhook/d817dc70-357e-4be6-a6af-50dd9a7191af>
- Body raw JSON example:

```json
{
  "Topic": "Use of AI Agents in Web Applications development",
  "Message to communicate": "Progress made so far in AI based Web Development, Tools and technologies available, Agentic Frameworks available, case studies",
  "Target Audience": "Web Developers, Programmers, Software Architects",
  "Specific Areas you like to be covered": "Various frameworks available, advancements in Web Development using AI Agents, Comparison, Agents development",
  "Page Count": 15
}
```

- WebForm URL: <https://n8n.jade-biz.com/form/b6e5ad7c-3616-417f-9208-8f4fe1b2b909>

### Workflow 2:
- Workflow Name: API-Tailored-Presentation
- Description: This workflow is similar to the Presentation Creator workflow however there is a significant change in the input. We can provide the information about the target company, and target person to whom the presentation is going to be targeted. The workflow researches the contents for the presentation and the AI Agent tailors the contents for the specific target company and person. In some cases you may only know the target company and have that information available (as in the example below). The workflow returns the details of the presentation status and download links when the API call returns.
- POST URL: <https://n8n.jade-biz.com/webhook/220a05d4-4cee-483a-b8de-2428e18d34b4>
- Body raw JSON example:

```json
{
"topic": "Data governance in Power Plants",
"message_to_communicate": "Data governance issues in non conventional energy plants, challenges, solutions, case studies, does and don'ts",
"target_audience": "CXO, IT Directors",
"specific_areas_to_cover": "Challenges, Solutions, Use of AI, Quality control, Security",
"page_count": 10,
"target_person_details": "No specific person targetted, CXO and Director level audiance",
"target_company_details": "Company Research Report: Suzlon Energy Limited. Qualification Status: Qualified. Firmographics: Sector - Renewable Energy (Wind Energy OEM, Equipment, and Services / Independent Power Producer). Public company listed on BSE and NSE (ticker: SUZLON). Estimated revenue approx. ₹6,500–₹7,500 Crore / ~$850M–$950M USD (FY24). Employee count: 6,662+. Business Health: 5-year trajectory is growing. Recent M&A activity focused on debt restructuring and divestment of non-core assets to refocus on core wind turbine manufacturing and O&M services. Key competitors: Siemens Gamesa, Vestas, GE Renewable Energy, Inox Wind. Strategy and Risk: CapEx projects include expansion of manufacturing capacity for the new 3MW+ turbine series and investment in O&M digital service centers and R&D for next-generation turbine blade technology. Primary business risks include significant historical debt burden (currently being restructured), supply chain volatility in steel and composites, and intense competition in the Indian wind auction market. Regulatory compliance includes adherence to MNRE standards, grid integration regulations, and complex cross-border tax and regulatory litigation. IT and Data Landscape: Hyperscaler partner is AWS, currently migrating core workloads to cloud. Transitioning from legacy on-premise silos to a cloud-based monitoring framework for fleet management, with heavy reliance on IoT data and SCADA integration. Data leadership: Vivek Suman, Group CIO. Active GenAI use case: predictive maintenance for turbine blades using remote monitoring data and machine learning. Operational Systems: CMMS platform is SAP S/4HANA (Enterprise Asset Management). CMS platform is proprietary SCADA (Suzlon Windfarm Management System). Forecasting needs include energy yield prediction, wind pattern power generation forecasting, turbine failure forecasting, predictive maintenance for gearboxes and blades, and supply chain logistics optimization. Procurement: Primary IT vendors are SAP, AWS, and Microsoft. Boutique propensity: Medium."
}
```

- WebForm URL: <https://n8n.jade-biz.com/form/8f1333b9-3d6d-41ec-9cf7-3a9f10f541bb>

### Workflow 3:
- Workflow Name: API-CustomServicesPresentationContentsForTarget
- Description: This workflow takes the company information, the person information as input from user and accesses our services information document from Google Drive.
- The workflow analyzes the target company information, target person person information and our services information and suggests what services we can offer to the target. It also gives a skeleton and contents for the presentation deck that can be used to prepare a presentation.
- POST URL: <https://n8n.jade-biz.com/webhook/5c9e0ac0-72c3-40ba-9a55-5c55e9609e79>
- Body raw JSON example:

```json
{
  "Company Information": "Based on the research provided by both agents, here is the merged report for **Truzon Solar**.\r\n\r\n### **Company Research Report: Truzon Solar**\r\n\r\n#### **1. Qualification Status**\r\n*   **Qualified:** No\r\n*   **Disqualification Reason:** The company does not meet the required $100M USD annual revenue threshold. Truzon Solar (Suntek Energy Systems Pvt. Ltd.) is a mid-sized to small-scale solar firm. Estimates place their revenue significantly below enterprise scale, ranging from under $10M to less than $50M USD.\r\n\r\n#### **2. Firmographics**\r\n*   **Company Name:** Truzon Solar (Suntek Energy Systems Pvt. Ltd.)\r\n*   **Sector Classification:** Solar EPC / Renewable Energy (Residential, Commercial, and Light Industrial)\r\n*   **Public_or_Private:** Private\r\n*   **Estimated Revenue:** < $50M USD (Market data suggests it may be specifically < $10M)\r\n*   **Employee Count:** 10–50 employees\r\n\r\n#### **3. Business Health**\r\n*   **5-Year Trajectory:** Unknown\r\n*   **Recent M&A Activity:** None reported\r\n*   **Key Competitors:** Sunrun, Tesla Energy, and various local solar installers/EPC firms in the Indian and regional markets.\r\n\r\n#### **4. Strategy and Risk**\r\n*   **Announced CapEx Projects:** None identified\r\n*   **Primary Business Risks:** \r\n    *   Market saturation in the residential solar sector.\r\n    *   Sensitivity to interest rate fluctuations affecting consumer financing.\r\n    *   Regulatory changes in net-metering policies.\r\n*   **Regulatory Compliance Issues:** None reported\r\n\r\n#### **5. IT and Data Landscape**\r\n*   **Hyperscaler Partner:** None / Not disclosed\r\n*   **Data Architecture Notes:** Likely utilizes basic CRM systems (such as Salesforce or HubSpot) for lead tracking and customer management. Lacks a centralized enterprise data lake or sophisticated data warehouse architecture.\r\n*   **Data Leadership:** None identified\r\n*   **AI Initiative Leadership:** None identified\r\n*   **Active GenAI Use Cases:** None identified\r\n\r\n#### **6. Operational Systems**\r\n*   **CMMS Platform:** None identified\r\n*   **CMS Platform:** None identified\r\n*   **Specific Forecasting Needs:** Basic sales pipeline forecasting and inventory management for hardware (panels, inverters).\r\n\r\n#### **7. Procurement**\r\n*   **Primary IT Vendors:** None identified\r\n*   **Boutique Propensity:** Low to Unknown\r\n",
  "Person Information": "Here’s a clear, well‑organized profile of Jakkula Srinivas, based entirely on publicly available information related to Truzon Solar.\r\n\r\n🌟 Who is Jakkula Srinivas?\r\nJakkula Srinivas is the Chief Executive Officer (CEO) of Truzon Solar, one of India’s rapidly growing solar EPC companies. He is positioned as a key leader driving the company’s national expansion and clean‑energy mission. \r\n\r\n👤 Professional Background\r\n🏢 CEO – Truzon Solar\r\nLeads company strategy, growth, and operations.\r\n\r\nFocuses on rooftop, industrial, commercial, ground‑mounted, and agri‑solar sectors.\r\n\r\nAligns offerings with major Indian renewable‑energy policies such as PM-KUSUM and PM Surya Ghar Muft Bijli Yojana.\r\n\r\nDrives digital transformation and customer success.\r\n\r\nStrengthens Truzon’s brand as a solar pioneer.\r\n\r\n🌍 Previous Roles\r\nRegional Advisor – MPT (Myanmar)\r\n\r\nSales Planning Lead – Jio\r\n\r\nZonal Business Manager – Telenor India\r\n\r\nOver two decades of experience in leadership, operations, and business development across telecom and energy sectors.\r\n\r\n🌞 His Role in Truzon Solar’s Growth\r\nOversees a company with 6000+ solar projects delivered and 2 lakh+ customers.\r\n\r\nExpanding presence across rural, industrial, and commercial markets.\r\n\r\nAdvocates for sustainability, rural electrification, and MSME empowerment through solar adoption.\r\n\r\n🎥 Public Appearances\r\nFeatured in the inauguration of Truzon Solar’s new Andhra Pradesh office.\r\n\r\nAppears in company videos promoting clean‑energy initiatives.\r\n\r\n🏆 Recognition & Investments\r\nRecently announced strategic investments into Truzon Solar by Indian cricket stars Suryakumar Yadav and Tilak Varma, strengthening the company’s credibility and growth trajectory.\r\n\r\n🧩 Truzon Solar at a Glance\r\nFounded in 2008; recognized by TGREDCO and MNRE (Govt. of India).\r\n\r\n10,000+ solar projects, 500+ employees.\r\n\r\nStrong presence across India with award‑winning EPC capabilities.\r\n\r\n📇 Management Listing\r\nListed as Chief Executive Officer in Truzon Solar’s management directory."
}
```

- WebForm URL: <https://n8n.jade-biz.com/form/59567474-c903-42a3-95c9-8f2aba01236f>
