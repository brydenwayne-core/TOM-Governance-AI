# Original design conversation

User-supplied design excerpts. Historical context; canonical specifications live in docs/application. Product and service claims in these excerpts are not independently verified.

## Attachment: Concept and strategy

What you're describing is a multi-agent AI governance advisory system, and I think it has particularly compelling potential for Tom of Finland Foundation (ToFF) and TOM House.

Rather than building a conventional chatbot that offers one generalized opinion, you would be creating a structured environment in which five independent AI board advisors evaluate the same organizational challenge through five different strategic lenses.

Each advisor would have its own responsibilities, decision-making principles, policies, constraints, and measures of success.

The most interesting part of your concept is that the advisors wouldn't necessarily agree. In fact, their disagreements could be one of the application's most valuable features.

For example, a decision that makes financial sense might conflict with the Foundation's commitment to artistic freedom, historical preservation, or community accessibility.

Your application could expose those tensions before leadership makes a decision.

## 1. The proposed application: TOM Governance AI

CONCEPTUAL ARCHITECTURE

Organizational scenario

A proposal, challenge, investment, policy, or strategic decision

Shared governance foundation

Mission • Vision • Values • Bylaws • Policies • Financial context

01

Mission & Culture

Identity, values, artistic freedom

02

Finance & Sustainability

Budget, funding, long-term viability

03

Governance & Risk

Fiduciary duties, legal and policy controls

04

Programs & Preservation

Collections, artists, education, archives

05

Community & Growth

Engagement, partnerships, donor development

Board synthesis and decision support

Areas of agreement • Conflicts • Risk analysis • Recommendations • Proposed action plan

These are proposed AI advisory roles, not representations of ToFF's actual board members or formally adopted governance structure.

## 2. What makes each AI board member different?

The key is to give each advisor more than a personality or a job title.

I would define each using a structured governance profile containing:

* Mandate: What organizational interests does this advisor protect?

* Decision principles: Which values govern its reasoning?

* Policies: What rules must it follow?

* Constraints: What can it never recommend without further authorization?

* Evidence requirements: What information must support its conclusions?

* Success metrics: How does it evaluate whether a proposal is beneficial?

* Escalation rules: When must a question be referred to human leadership, legal counsel, or the actual board?

All five advisors would share the same authoritative organizational documents, but each would interpret the consequences through its assigned mandate.

For example, the finance advisor could favor a revenue-generating event, while the preservation advisor raises concerns about the impact of increased visitor traffic on historical collections.

Neither perspective is inherently wrong. The system's value comes from making those trade-offs explicit.

## 3. Example: How the board would evaluate a real scenario

Imagine presenting the following question:

> TOM House is considering expanding its educational programming and offering paid historical tours, artist workshops, and special events to generate additional revenue. Should the Foundation proceed?

Each AI advisor would independently evaluate the proposal.

| AI advisor              | Example position        | Primary concern                                              |
| ----------------------- | ----------------------- | ------------------------------------------------------------ |
| Mission & Culture       | Support with conditions | Preserve the Foundation's identity and freedom of expression |
| Finance                 | Favor a pilot           | Validate operating margins and recurring revenue             |
| Governance & Risk       | Conditional approval    | Confirm insurance, authorization, and compliance             |
| Programs & Preservation | Limited pilot           | Protect collections and historic spaces                      |
| Community & Growth      | Favor expansion         | Increase visibility, participation, and accessibility        |

Illustrative positions only, not actual ToFF recommendations.

The system would then produce a consolidated recommendation, potentially proposing a 90-day pilot with attendance limits, revenue targets, preservation safeguards, and a formal review.

Importantly, it should also preserve dissenting opinions rather than manufacture consensus.

## 4. How to build this using ChatGPT

You don't need to train a new foundational AI model. You need to configure an existing model with a governance framework, specialized advisor instructions, organizational knowledge, and a structured evaluation workflow.

There are three practical development stages.

Phase 1 — Prototype in ChatGPT

Start with a dedicated ChatGPT Project containing five advisor profiles, shared governance instructions, and approved organizational reference documents. A single model can simulate the five perspectives sequentially.

Recommended starting point

Phase 2 — Independent AI advisors

Build a small application using the OpenAI API. Each advisor receives the same scenario but separate instructions, independently produces a structured assessment, and passes it to a synthesis component. This provides stronger separation between perspectives.

Phase 3 — Quantitative decision intelligence

Introduce weighted scoring, decision history, evidence tracking, scenario comparisons, and dashboards. Salesforce Nonprofit Cloud or a custom Salesforce application could eventually manage organizational programs, decision records, donors, and impact measures.

One important product update: OpenAI is retiring the legacy custom-GPT approach and directing new reusable workflows toward Plugins. New GPT creation is no longer available on personal ChatGPT plans. For your immediate prototype, a ChatGPT Project is a sensible starting point; a Plugin or API-based application can follow when you need more control.

![](https://www.google.com/s2/favicons?domain=https://help.openai.com\&sz=32)

OpenAI Help Center

+1

## 5. Your future scoring engine

I particularly like your idea of eventually introducing weighted priorities.

Here's a preliminary scoring model we could use to evaluate proposals:

Illustrative decision scoring

Prototype

Weighted proposal score

# 4.25

/ 5.00

Adjust the importance and rating of each dimension to explore different outcomes.

Mission alignment

30% weight

Proposal rating

12345

Financial sustainability

20% weight

Proposal rating

12345

Governance and risk

20% weight

Proposal rating

12345

Preservation impact

15% weight

Proposal rating

12345

Community benefit

15% weight

Proposal rating

12345

Reset exampleThese are proposed weights and hypothetical ratings, not approved Foundation priorities. Mandatory legal, safety, and mission constraints should operate as gates rather than be overridden by a high score.

In a mature system, each advisor could provide its own ratings with supporting evidence. The application would calculate the weighted outcome while explaining why the advisors scored the proposal differently.

## 6. A critical architectural distinction

I would separate your system into three governance layers:

Layer A — Organizational truth: Verified mission statements, bylaws, policies, approved strategic plans, financial information, and other source documents. The system must distinguish actual ToFF policy from proposed policy.

Layer B — Advisor reasoning: Each AI board member applies its independent perspective. Advisors should identify assumptions, uncertainty, evidence gaps, and conflicting obligations.

Layer C — Decision authority: The application produces recommendations, but actual organizational leadership retains decision-making authority. No simulated advisor should claim to be a real director, cast an official vote, or approve spending.

This also makes the system more credible as a potential nonprofit governance tool beyond ToFF. Its framework could eventually be customized for other arts, cultural heritage, and LGBTQ+ community organizations.

## 7. Where I would begin

I would start by building the five detailed board-member profiles and the shared governance charter. Then we could test the model against three realistic TOM House scenarios, examine how the perspectives differ, and refine the constraints before introducing scoring.

You can begin without writing Apex, Python, or JavaScript. Your Salesforce architecture experience becomes especially valuable when we eventually introduce policy metadata, permission models, structured decision records, and integration with organizational data.

One design decision I'd like your input on:

How should your five AI board members interact?

Independent assessments

Each advisor analyzes the scenario separately, followed by a consolidated report.

Interactive board deliberation

Advisors independently evaluate the scenario, then challenge each other's recommendations before reaching a proposed path forward.

Hybrid governance model

Independent assessments, structured debate, documented dissent, and a final recommendation with measurable next steps.

Continue designing the board

My preference is the hybrid governance model. It offers the greatest potential to expose strategic tensions, preserve minority viewpoints, and turn complex nonprofit challenges into actionable, evidence-based decisions.


## Attachment: Hybrid framework

# TOM Governance AI

Hybrid Multi-Agent Governance Framework · Version 0.1

We'll design TOM Governance AI as a virtual nonprofit board advisory system tailored to Tom of Finland Foundation and TOM House, with five independent AI advisors, a structured deliberation process, documented dissent, and an evidence-based final recommendation.

The design principle is simple: five distinct perspectives, one shared organizational mission, and no artificial consensus.

## 1. The governance model

Scenario submission

Proposal, challenge, investment, program, or policy

Governance knowledge base

Mission, bylaws, approved policies, strategic objectives, financial and program data

Mission & Identity

Financial Stewardship

Governance & Risk

Arts & Preservation

Community & Development

Structured board deliberation

Challenge assumptions, identify conflicts, revise positions

Decision intelligence report

Recommendation • Dissent • Evidence • Risk • Action plan • Metrics

## 2. The five AI board members

Each advisor has a defined mandate, priorities, and constraints.

01

Mission & Identity Advisor

Protect the Foundation's mission, cultural identity, values, and commitment to freedom of artistic expression.

Core question: Does this proposal strengthen the mission, or gradually compromise it?

Constraint: Cannot support an initiative that violates a verified, non-negotiable mission requirement.

02

Financial Stewardship Advisor

Evaluate financial sustainability, funding diversification, operating costs, reserves, and long-term viability.

Core question: Can the Foundation responsibly sustain this initiative without destabilizing existing programs?

Constraint: Must flag unsupported revenue assumptions, unfunded obligations, and material financial exposure.

03

Governance & Risk Advisor

Evaluate board authority, fiduciary responsibility, compliance, organizational policies, and accountability.

Core question: Who has the authority to approve this, and what governance controls must exist?

Constraint: Cannot treat an AI recommendation as formal authorization or substitute for professional legal advice.

04

Arts & Preservation Advisor

Protect historical collections, artistic integrity, archives, intellectual property, and educational programs.

Core question: What is the impact on the Foundation's cultural legacy and its responsibility to future generations?

Constraint: Must identify conservation, collections, provenance, and intellectual-property risks before supporting implementation.

05

Community & Development Advisor

Advance community participation, inclusive access, volunteer engagement, partnerships, and philanthropic development.

Core question: Who benefits, who might be excluded, and how does the initiative create meaningful community value?

Constraint: Must evaluate accessibility, stakeholder trust, and potential unintended community harms.

These are proposed advisory mandates. We will validate them against the Foundation's actual mission, bylaws, policies, and strategic priorities before treating them as organizational rules.

## 3. The hybrid deliberation protocol

I recommend a six-stage process.

1. Scenario intake and evidence review

   Identify the decision, organizational objectives, affected stakeholders, relevant documents, missing information, and any mandatory approval requirements.

2. Independent assessments

   Each advisor develops its position without seeing the other advisors' initial conclusions. Every assessment includes benefits, risks, assumptions, evidence, and a preliminary recommendation.

3. Structured deliberation

   Advisors review one another's positions, challenge unsupported assumptions, and identify competing priorities. The process should encourage substantive disagreement rather than automatic agreement.

4. Position revision and dissent

   Each advisor can maintain or revise its position. The system preserves original conclusions, changes in reasoning, unresolved objections, and minority recommendations.

5. Decision synthesis

   A neutral facilitator compares recommendations, identifies feasible options, applies mandatory governance constraints, and develops a proposed path forward. It does not silently override dissent.

6. Action plan and accountability

   Produce recommended next steps, proposed owners, dependencies, milestones, success measures, and conditions requiring actual leadership approval.

## 4. Standard decision report

Every scenario should produce the same core deliverables.

| Section                     | Output                                                                 |
| --------------------------- | ---------------------------------------------------------------------- |
| Executive summary           | Decision context and recommended direction                             |
| Independent perspectives    | Five separate advisor assessments                                      |
| Deliberation record         | Challenges, responses, and changed positions                           |
| Dissent register            | Unresolved concerns and minority recommendations                       |
| Risk and opportunity matrix | Likelihood, impact, mitigation, and potential benefits                 |
| Final recommendation        | Proposed decision, rationale, and conditions                           |
| Implementation roadmap      | Actions, dependencies, suggested owners, and milestones                |
| Measurement framework       | Financial ROI, mission impact, community benefit, and operational KPIs |

The report should also distinguish verified facts, advisor interpretations, assumptions, and recommendations.

## 5. How we'll implement Version 0.1 in ChatGPT

The initial implementation can operate inside a dedicated ChatGPT Project using a master governance instruction set and five specialized advisor definitions.

For this first version, the model will run the five perspectives sequentially, with the initial assessments kept separate before deliberation. This is a useful prototype, although it does not provide the same isolation as five independently executed API agents.

We'll structure the configuration into four logical components:

* Governance Charter: Shared mission, values, evidence standards, decision authority, and non-negotiable rules.

* Advisor Profiles: Five separate sets of responsibilities, reasoning principles, and constraints.

* Deliberation Protocol: Rules governing independent assessments, debate, revisions, dissent, and synthesis.

* Decision Report Schema: A consistent output format for evaluating every scenario.

Later, we can move these definitions into structured configuration files, introduce independent agent execution, and connect a scoring engine or Salesforce-based decision repository.

## 6. The first organizational decision

Before we write the actual master instructions, there is one architectural choice that matters.

Should TOM Governance AI be designed exclusively around the Foundation's verified governance documents, or should it also have the ability to explore innovative strategies beyond current organizational practices?

Policy-bound governance

All recommendations must remain within documented organizational policies and approved strategic priorities.

Exploratory strategic advisory

Advisors can explore new organizational models and strategies while clearly identifying governance changes required.

Dual-mode governance — recommended

A compliance-focused assessment of what is currently permissible, followed by a separate strategic assessment of what could become possible through authorized organizational change.

Establish governance model

I favor dual-mode governance for TOM House because it would help distinguish decisions the Foundation can responsibly make today from opportunities that may require new policies, resources, partnerships, or board authorization.

That distinction would make TOM Governance AI more than a simulated board discussion: it would become a structured tool for institutional learning, strategic planning, and responsible organizational transformation.


## Attachment: Governance charter

# TOM Governance AI — Governance Charter v0.1

We will establish dual-mode governance as the foundational operating principle of TOM Governance AI.

The system will distinguish between two forms of advice:

* Mode A — Current-State Governance: What Tom of Finland Foundation can do under its verified mission, bylaws, approved policies, delegated authorities, and available resources.

* Mode B — Strategic Possibilities: What the Foundation could pursue through new programs, policies, funding models, partnerships, or governance changes, subject to appropriate human authorization.

Both modes will operate within the same five-advisor framework, but they will produce separately identified findings.

## Master Governance Charter

TOM Governance AI

Draft v0.1

Purpose

Provide structured, evidence-based strategic advice to support the stewardship, sustainability, cultural mission, and community impact of Tom of Finland Foundation and TOM House.

Authority

TOM Governance AI is an advisory system. It is not the Foundation's legal board, does not impersonate actual directors, and cannot approve expenditures, authorize policy changes, or make binding organizational decisions.

Shared principles

1. Mission fidelity and artistic freedom

2. Financial responsibility and sustainability

3. Governance integrity and accountability

4. Cultural preservation and educational value

5. Community inclusion and social impact

6. Evidence-based reasoning and transparency

7. Independent judgment and documented dissent

Non-negotiable operating rules

* Never invent an organizational policy, financial fact, legal requirement, or board decision.

* Distinguish verified information from assumptions and proposed policy.

* Identify missing evidence before making consequential recommendations.

* Preserve dissent and material objections.

* Do not allow financial or strategic scoring to override mandatory compliance, safety, or mission constraints.

* Escalate matters requiring legal, financial, conservation, or organizational approval.

The Foundation's actual governing documents will take precedence over these proposed design principles wherever applicable.

## Five advisor configurations

Mission & Cultural Identity

TOM-01

PRIMARY PRIORITY: Mission integrity

Mandate: Artistic freedom, institutional identity, organizational values, historical legacy.

Operating policy: Evaluate each proposal for mission alignment and potential mission drift.

Constraint: Cannot endorse an initiative that conflicts with a verified mission restriction.

Strategic exploration

Explore new ways to advance artistic freedom and cultural relevance.

Financial Stewardship

TOM-02

PRIMARY PRIORITY: Financial resilience

Mandate: Revenue, reserves, fundraising, operating costs, financial risk, sustainability.

Operating policy: Require documented assumptions, realistic financial projections, and resource analysis.

Constraint: Must identify unfunded commitments and material exposure before recommending implementation.

Strategic exploration

Explore earned revenue, grants, donor programs, and diversified funding models.

Governance & Institutional Risk

TOM-03

PRIMARY PRIORITY: Responsible governance

Mandate: Bylaws, delegated authority, fiduciary duties, compliance, organizational accountability.

Operating policy: Identify who has decision authority and which controls or approvals apply.

Constraint: Cannot present a recommendation as an official approval or legal determination.

Strategic exploration

Explore governance modernization, policy development, and stronger oversight.

Arts, Archives & Preservation

TOM-04

PRIMARY PRIORITY: Cultural stewardship

Mandate: Collections, archives, artist relationships, exhibitions, conservation, educational programming.

Operating policy: Evaluate preservation risks, collection integrity, and long-term educational benefit.

Constraint: Must flag unresolved conservation, provenance, access, and intellectual-property concerns.

Strategic exploration

Explore digital collections, archival partnerships, artist programs, and education.

Community Engagement & Development

TOM-05

PRIMARY PRIORITY: Inclusive impact

Mandate: Community relationships, donors, volunteers, accessibility, partnerships, program participation.

Operating policy: Evaluate stakeholder benefits, accessibility, trust, and social return on investment.

Constraint: Must identify exclusion risks and unsupported claims of community benefit.

Strategic exploration

Explore audience development, community partnerships, volunteer programs, and philanthropic engagement.

## Dual-mode decision workflow

Scenario submitted

Common evidence package and decision question

Mode A

Current-State Governance

Assess verified policies, existing authority, resources, and constraints.

Output: Permissible, conditional, prohibited, or undetermined.

Mode B

Strategic Possibilities

Explore new opportunities, required changes, investment, and organizational benefits.

Output: Options, dependencies, risks, and potential value.

Five independent advisor assessments

Separate initial reasoning and recommendations

Structured deliberation

Cross-examination, revised positions, unresolved dissent

Final advisory recommendation

Current-state decision • Future-state roadmap • Approval gates • Metrics

## Deliberation and dissent rules

The five advisors must first complete their independent assessments. During deliberation, each advisor can challenge another advisor's evidence, assumptions, risks, or recommended actions.

Each advisor then records whether its position was maintained or revised, why it changed, and whether any material objections remain.

A neutral synthesis function must report:

* Areas of agreement and disagreement.

* Material dissent, including the dissenting advisor's rationale.

* Conditions required before proceeding.

* Alternative strategies and their trade-offs.

* A recommended course of action and proposed measurable outcomes.

A majority position does not automatically override mission, legal, safety, or preservation concerns. The system must explicitly identify any unresolved governance gates.

## Standard scenario input

This is the information the application will accept when evaluating a proposal.

Scenario or proposal

Desired organizational outcome

Planning horizon

90-day pilot

12-month strategy

Three-year transformation

Assessment scope

Both governance modes

Current-state only

Strategic possibilities only

Run first board assessment

## What we need to make this Foundation-specific

The architecture is now defined, but the policy layer is still provisional. The next important milestone is incorporating the Foundation's authoritative source material: mission and values, bylaws, governance policies, approved strategic plans, program descriptions, and relevant financial information.

I recommend we build a source-of-truth register that records each document's title, effective date, approval status, authority, and which advisors rely on it. That will allow TOM Governance AI to explain not only what it recommends, but precisely why.

This creates the foundation for a system that can support both the Foundation's immediate operational decisions and its longer-term transformation—while preserving artistic freedom, responsible stewardship, and inclusive community impact.


## Attachment: Development strategy

# TOM Governance AI — Codex Development Strategy

Given your plan to use Codex, GitHub, GitHub Actions, and GitHub Pages, I recommend treating TOM Governance AI as a software engineering project with a defined architecture, version-controlled governance rules, automated testing, and an incremental delivery roadmap.

The most important architectural decision is to separate the governance intelligence from the application interface.

Your five AI advisors should not simply be five prompts embedded in a web page. They should be individually configurable components governed by a shared policy framework, an orchestration engine, and a structured decision-reporting system.

This approach also aligns well with your Salesforce architecture experience: think of the advisor configurations as metadata, the orchestration engine as business logic, and the decision reports as auditable records.

## 1. Recommended technology architecture

GitHub Pages — React application

Scenario intake • Advisor dashboard • Deliberation timeline • Decision reports

Authenticated HTTPS requests

Secure backend API

Authentication • Orchestration • OpenAI API • Policy enforcement • Persistence

Five AI advisors

Independent analysis

Deliberation engine

Challenges and revisions

Governance rules

Policy and evidence checks

Decision repository

Audit and reporting

I recommend the following stack:

| Layer                        | Technology                                |
| ---------------------------- | ----------------------------------------- |
| Frontend                     | React, TypeScript, Vite                   |
| UI styling                   | Tailwind CSS                              |
| Static hosting               | GitHub Pages                              |
| AI orchestration             | Python, FastAPI, Pydantic                 |
| AI provider                  | OpenAI API                                |
| Governance definitions       | YAML, validated against schemas           |
| Data storage                 | SQLite locally; PostgreSQL for production |
| Automation                   | GitHub Actions                            |
| Unit and integration testing | Vitest, pytest                            |
| End-to-end testing           | Playwright                                |

Important: GitHub Pages only hosts static content. It cannot securely execute your AI orchestration backend. You will need a separate backend service, or an alternative serverless environment, for API calls and confidential organizational data.

I would not use GitHub Actions as the live AI execution engine. Actions are ideal for CI/CD, validation, tests, and deployments—not interactive, potentially long-running board deliberations.

## 2. Organize the GitHub repository before asking Codex to write code

I would create a new repository named `tom-governance-ai`, organized as a monorepo.

tom-governance-ai/

```
tom-governance-ai/
├── AGENTS.md
├── README.md
├── docs/
│   ├── product-requirements.md
│   ├── architecture.md
│   ├── governance-charter.md
│   ├── decision-workflow.md
│   ├── security-model.md
│   └── implementation-roadmap.md
├── governance/
│   ├── advisors/
│   │   ├── mission.yaml
│   │   ├── finance.yaml
│   │   ├── governance-risk.yaml
│   │   ├── preservation.yaml
│   │   └── community.yaml
│   ├── policies/
│   └── schemas/
├── frontend/
│   ├── src/
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── agents/
│   │   ├── orchestration/
│   │   ├── governance/
│   │   └── reports/
│   └── tests/
├── tests/
│   └── scenarios/
└── .github/
    ├── workflows/
    │   ├── ci.yml
    │   └── deploy-pages.yml
    └── ISSUE_TEMPLATE/
```

The critical file is `AGENTS.md`. Codex uses it to understand repository-specific engineering conventions and expectations across development sessions.

![](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub

+1

I would also place the exported conversation in `docs/reference/` as historical design context, then have Codex transform it into the canonical specifications above. This avoids relying on a long conversation as the permanent source of truth.

## 3. Build the application through six controlled milestones

## 01

Architecture and specifications

Create AGENTS.md, product requirements, architecture decisions, governance charter, and advisor configuration schemas.

Deliverable: A reviewable technical foundation before coding.

## 02

Interactive frontend

Develop the dashboard, five advisor profiles, scenario submission form, and dual-mode governance interface with mock data.

Deliverable: A working GitHub Pages prototype without API credentials.

## 03

Governance intelligence engine

Implement advisor execution, evidence validation, independent assessments, debate, dissent tracking, and final synthesis.

Deliverable: A locally executable, testable AI workflow.

## 04

Secure backend and persistence

Add authentication, API access, document controls, decision history, and backend deployment.

Deliverable: A functional application with protected AI execution.

## 05

GitHub Actions and quality gates

Automate builds, linting, type checking, unit tests, scenario regression tests, and Pages deployment.

Deliverable: Repeatable deployments and controlled changes.

## 06

Pilot and scoring engine

Test realistic TOM House scenarios, validate recommendations, and add configurable metrics and decision comparisons.

Deliverable: A governance advisory platform ready for structured evaluation.

Each milestone should become a GitHub issue or small collection of issues, with its own branch and pull request. Require passing tests and review before merging into `main`.

## 4. The exact first prompt I would give Codex

This is where I would begin. Rather than asking Codex to build the entire application immediately, instruct it to establish the engineering foundation and identify architectural decisions.

Codex — Initial repository prompt

Copy

Paste this into Codex with the imported conversation available in the repository or workspace.

The prompt above is designed to prevent a common problem with AI-assisted development: generating a large amount of code before the architecture and acceptance criteria are settled.

## 5. How I would structure the AI orchestration

For your application, I would initially use the OpenAI Responses API with application-controlled orchestration. This gives you precise control over execution order, schemas, validation, and persistence.

Later, the OpenAI Agents SDK is a viable option for reusable agents, tools, and handoffs.

![](https://www.google.com/s2/favicons?domain=https://developers.openai.com\&sz=32)

OpenAI API

The execution sequence should be:

```
Scenario
   ↓
Evidence and policy validation
   ↓
Five isolated initial assessments
   ↓
Structured challenge round
   ↓
Five revised assessments
   ↓
Dissent and constraint evaluation
   ↓
Neutral synthesis
   ↓
Decision report
```

Use Pydantic models to validate every AI-generated assessment before allowing it into the next stage. Store the advisor ID, configuration version, model identifier, evidence references, timestamps, and both original and revised conclusions.

Also establish an important safeguard: organizational source documents must be treated as evidence, not executable instructions. A document should never be able to redefine an advisor's governing rules simply because it contains instructions addressed to an AI.

## 6. GitHub Actions deployment strategy

I recommend two independent workflows.

| Workflow           | Trigger                    | Purpose                                |
| ------------------ | -------------------------- | -------------------------------------- |
| `ci.yml`           | Pull requests and pushes   | Run frontend and backend quality gates |
| `deploy-pages.yml` | Approved changes to `main` | Build and publish the frontend         |

GitHub's official Pages workflow supports building a static site, uploading the artifact, and deploying it through Actions.

![](https://www.google.com/s2/favicons?domain=https://docs.github.com\&sz=32)

GitHub Docs

Use branch protection, minimal workflow permissions, dependency scanning, and protected deployment environments.

For Vite, configure the correct repository-relative base path so assets load properly from a GitHub Pages project URL.

Security consideration: Do not place OpenAI API keys in React environment variables or any Pages build artifact. OpenAI explicitly advises against deploying secret API credentials to browsers.

![](https://www.google.com/s2/favicons?domain=https://help.openai.com\&sz=32)

OpenAI Help Center

Until authentication and backend authorization exist, keep the public Pages application limited to synthetic examples and mock governance decisions.

## 7. My recommendation for the first working release

I would intentionally make the first milestone a fully interactive mock governance board, before connecting the OpenAI API.

The initial user experience would include a scenario submission screen, five advisor cards, current-state and future-state assessments, a deliberation timeline, dissent records, and a consolidated decision report.

Mock responses would be deterministic, allowing you to verify the entire user journey and visual design without incurring API costs.

Once that experience is stable, Codex can replace the mock execution adapter with the real backend orchestration engine.

This provides a clean separation between the application's presentation layer and its intelligence layer, while keeping your architecture adaptable to future nonprofit use cases.

The eventual opportunity is to make the platform configurable enough that TOM House becomes the first implementation of a reusable governance advisory framework, rather than building an application that can only ever serve one organization.

The next action I recommend: Create `tom-governance-ai` as a new GitHub repository, import this conversation as reference material, and give Codex the initial planning prompt above. Review the architecture and milestone backlog before authorizing feature development.


## Attachment: Document architecture

I recommend expanding the repository's `docs/` structure to support two distinct purposes:

1. Application documentation: Architecture, requirements, governance specifications, and developer guidance.

2. Organizational knowledge documents: Simulated mission statements, vision, values, bylaws, policies, strategic plans, and other materials that TOM Governance AI will eventually ingest and evaluate.

The second category is particularly important. It allows us to develop and test the five AI advisors against realistic but fictional organizational information before introducing actual Tom of Finland Foundation documents.

## Updated repository structure

```
tom-governance-ai/
├── AGENTS.md
├── README.md
│
├── docs/
│   ├── application/
│   │   ├── product-requirements.md
│   │   ├── architecture.md
│   │   ├── governance-charter.md
│   │   ├── decision-workflow.md
│   │   ├── security-model.md
│   │   └── implementation-roadmap.md
│   │
│   ├── organization/
│   │   ├── mock/
│   │   │   ├── mission.md
│   │   │   ├── vision.md
│   │   │   ├── values.md
│   │   │   ├── bylaws.md
│   │   │   ├── strategic-plan.md
│   │   │   ├── financial-policies.md
│   │   │   ├── collections-policy.md
│   │   │   ├── community-engagement.md
│   │   │   └── board-governance.md
│   │   │
│   │   ├── templates/
│   │   │   ├── document-template.md
│   │   │   └── policy-template.md
│   │   │
│   │   └── README.md
│   │
│   └── reference/
│       └── original-design-conversation.md
│
├── governance/
│   ├── advisors/
│   │   ├── mission.yaml
│   │   ├── finance.yaml
│   │   ├── governance-risk.yaml
│   │   ├── preservation.yaml
│   │   └── community.yaml
│   ├── policies/
│   └── schemas/
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── agents/
│   │   ├── orchestration/
│   │   ├── documents/
│   │   │   ├── ingestion/
│   │   │   ├── parsing/
│   │   │   ├── validation/
│   │   │   ├── indexing/
│   │   │   └── retrieval/
│   │   ├── governance/
│   │   └── reports/
│   └── tests/
│
├── tests/
│   ├── scenarios/
│   └── fixtures/
│
└── .github/
    ├── workflows/
    │   ├── ci.yml
    │   └── deploy-pages.yml
    └── ISSUE_TEMPLATE/
```

## Document processing architecture

I would design the document subsystem around a retrieval-augmented generation (RAG) approach. Rather than relying on the model to remember organizational policies, the application retrieves relevant passages from approved documents when evaluating each scenario.

Organizational documents

Mock Markdown now • PDF, DOCX and other uploads later

Document processing pipeline

Upload → Parse → Validate → Classify → Index

Governance knowledge repository

Document version • Approval status • Effective date • Source references

Mission & Identity

Financial Stewardship

Governance & Risk

Arts & Preservation

Community & Development

Evidence-backed governance assessment

Recommendations linked to relevant document passages

### Document metadata

Each mock document should contain structured metadata so the processing engine can distinguish an organizational fact from a fictional test policy or unapproved proposal.

For example:

YAML

```
document_id: TOM-MOCK-001
title: Organizational Mission Statement
organization: TOM Governance AI Demo
document_type: mission
version: "1.0"
status: simulated
approval_status: not_applicable
effective_date: null
classification: public_demo
source_type: repository
authoritative: false
applicable_advisors:
  - mission
  - governance-risk
  - community
```

This establishes a useful distinction between document authenticity and document applicability. A simulated policy can be treated as binding within a fictional test scenario, but it must never be presented as an actual policy adopted by Tom of Finland Foundation.

For future production documents, add ingestion timestamps, file hashes, source locations, approval evidence, supersession relationships, and access-control classifications.

## Updated instructions for Codex

Writing

Update the TOM Governance AI repository architecture to introduce a comprehensive organizational document management and processing subsystem.

**Requirements**

1. Separate application engineering documentation (`docs/application/`) from organizational knowledge documents (`docs/organization/`).

2. Create a collection of clearly labeled fictional organizational documents covering mission, vision, values, bylaws, strategic planning, financial governance, collection preservation, community engagement, and board governance.

3. Define reusable document templates and a standardized metadata schema.

4. Introduce a modular backend document-processing architecture supporting ingestion, parsing, validation, indexing, and retrieval.

5. Design for future authenticated uploads of PDF, DOCX, Markdown, and plain-text documents.

6. Support document versioning, effective dates, approval status, classification, and source traceability.

7. Ensure the five AI advisors can retrieve and cite relevant document passages during their independent assessments and deliberations.

8. Support dual-mode governance by distinguishing currently applicable organizational rules from exploratory strategic proposals.

9. Keep mock documents clearly separated from verified organizational documents. Never present fictional content as authentic Foundation policy.

10. Ensure confidential uploaded documents and generated indexes are excluded from the public GitHub repository and GitHub Pages deployment.

11. Add automated tests for document classification, retrieval, version precedence, citation integrity, and conflicting policies.

12. Update `AGENTS.md`, the architecture documentation, and the implementation backlog to reflect these requirements.

**Implementation sequence**

First update the repository structure and technical specifications. Then generate the fictional organizational document collection and validation schemas. Implement the document ingestion and retrieval pipeline in a subsequent milestone.

Preserve the existing five-advisor hybrid governance architecture and do not begin full application implementation until the updated design is reviewed.

## One additional recommendation

I would make the organizational document collection organization-agnostic from the beginning.

For example, rather than hardcoding TOM House's mission into the Mission Advisor, have that advisor retrieve the mission statement associated with the selected organization and its approved document version.

That creates an important long-term architectural advantage: TOM Governance AI could eventually support multiple nonprofit organizations, each with its own mission, policies, board structure, and strategic priorities, without rewriting the underlying AI application.

It also makes the document management subsystem the foundation for future Salesforce integrations, organizational knowledge management, and auditable governance decision support.
