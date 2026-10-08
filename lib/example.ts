import { roadmapSchema, type Roadmap, type Advice } from "./roadmap";
const exampleSeed: Roadmap = roadmapSchema.parse({
  id: "example-climate-tech",
  input: { goal: "Full-stack developer at a climate-tech startup", currentSkills: ["HTML & CSS", "JavaScript"], hoursPerWeek: 10, targetMonths: 6 },
  title: "Full-stack developer",
  summary: "Build the web skills and climate-data portfolio to pursue a junior full-stack role at a climate-tech startup.",
  source: "example",
  createdAt: "2026-10-08T05:30:00.000Z",
  milestones: [
    { id:"web", title:"Web foundations", category:"skill", phase:"Foundations", summary:"Use semantic HTML, responsive CSS and accessible forms to make interfaces that work across devices.", hours:24, skills:["HTML & CSS"], prerequisites:[], deliverable:"An accessible, responsive landing page for a climate-data product.",status:"known" },
    { id:"javascript", title:"JavaScript essentials",category:"skill",phase:"Foundations",summary:"Understand async functions, data transformations and browser APIs before building a full-stack application.",hours:28,skills:["JavaScript"],prerequisites:["web"],deliverable:"Fetch and filter a public dataset with loading and error states.",status:"known" },
    { id:"react",title:"React & TypeScript",category:"skill",phase:"Build interfaces",summary:"Build reusable components and typed interfaces. Learn controlled forms, state and effects through a working data explorer.",hours:36,skills:["React","TypeScript"],prerequisites:["javascript"],deliverable:"A typed dashboard with search, filters and accessible form controls.",status:"todo" },
    { id:"api",title:"APIs & PostgreSQL",category:"skill",phase:"Build services",summary:"Design a REST API, model relational data, validate inputs and use parameterised database queries.",hours:32,skills:["Node.js","PostgreSQL","REST"],prerequisites:["javascript"],deliverable:"A tested API for locations and climate observations.",status:"todo" },
    { id:"climate",title:"Explore climate data",category:"skill",phase:"Find your niche",summary:"Understand units, missing observations and uncertainty in public weather or emissions datasets. Explain a dataset's limits in your project.",hours:12,skills:["Data literacy","Climate data"],prerequisites:["javascript"],deliverable:"A data dictionary and documented cleaning script for one public dataset.",status:"todo" },
    { id:"project",title:"Build a carbon dashboard",category:"project",phase:"Create proof",summary:"Combine your frontend, API and data skills in a climate dashboard with transparent assumptions and useful visual comparisons.",hours:40,skills:["React","Node.js","Data visualisation"],prerequisites:["react","api","climate"],deliverable:"A deployed dashboard, public code and a README documenting assumptions.",status:"todo" },
    { id:"quality",title:"Testing & deployment",category:"skill",phase:"Make it reliable",summary:"Test the core user flow, fix keyboard navigation and deploy with server-side secrets, sensible error handling and clear setup instructions.",hours:16,skills:["Testing","Deployment","Accessibility"],prerequisites:["project"],deliverable:"A stable live app with meaningful tests and a setup guide.",status:"todo" },
    { id:"contribute",title:"Ship an open-source contribution",category:"project",phase:"Create proof",summary:"Find a small issue in a relevant open-source project, discuss the proposed fix with its maintainers and submit a focused contribution.",hours:16,skills:["Git","Collaboration"],prerequisites:["project"],deliverable:"A submitted contribution with a concise explanation of the change.",status:"todo" },
    { id:"portfolio",title:"Tell your project story",category:"project",phase:"Get interview-ready",summary:"Explain the problem, your architecture, implementation decisions and results. Prepare a short demo with evidence of what you built.",hours:8,skills:["Communication","Portfolio"],prerequisites:["quality","contribute"],deliverable:"Two clear project case studies and a three-minute demo.",status:"todo" },
    { id:"role",title:"Apply for junior full-stack roles",category:"role",phase:"Your next chapter",summary:"Target junior full-stack roles and frontend internships with backend exposure. Match real job descriptions to your portfolio and practise technical interviews.",hours:12,skills:["Interviews","Applications"],prerequisites:["portfolio"],deliverable:"A targeted application shortlist and rehearsed project explanations.",status:"todo" },
  ],
});
const exampleTasks: Record<string, [string, string][]> = {
  web: [
    ["Structure the climate-product page", "Create a semantic landing page with an introduction, three feature cards, and labeled location and date controls."],
    ["Make the layout responsive", "Adapt the page for narrow and wide screens. Check long location names, readable text, and a visible focus state."],
    ["Verify keyboard operation", "Navigate every control without a mouse and check a 200% zoom layout. Record the issues you fixed."],
  ],
  javascript: [
    ["Model the observations", "Create sample climate records with location, date, value, and unit. Reject missing or invalid required fields."],
    ["Fetch and filter data", "Load records through a data request. Add location and date filters and show the number of matching observations."],
    ["Exercise the interface states", "Verify loading, no results, a failed request, and a successful response. Explain what the user sees in each case."],
  ],
  react: [
    ["Build typed dashboard components", "Define a typed climate-observation record. Build reusable location cards, a search input, and a date filter with clear props."],
    ["Connect the data and controls", "Load sample observations, apply search and date filters from shared state, and keep the displayed count consistent."],
    ["Verify accessibility and data states", "Check keyboard operation, malformed records, no matching observations, and a failed request. Run the TypeScript check."],
  ],
  api: [
    ["Model locations and observations", "Create related database tables with a location reference, measurement value, unit, and observation date. Add a migration and sample data."],
    ["Build and validate the endpoints", "Implement location and observation endpoints with parameterized queries and filters. Reject invalid dates and missing locations."],
    ["Verify the API contract", "Test a valid observation, an invalid payload, an unknown location, and a filtered empty result. Record expected responses."],
  ],
  climate: [
    ["Write the data dictionary", "Choose a dataset with a stated source. Document each column's unit, time coverage, missing-value convention, and meaning."],
    ["Clean a reproducible sample", "Write a script that handles missing observations, inconsistent types, and duplicate records. Keep a log of changes and preserve the source."],
    ["Explain the limitations", "Describe coverage gaps and uncertainty. State which comparisons your sample supports and which it cannot support."],
  ],
  project: [
    ["Define the dashboard comparison", "Choose one climate-data question and specify the input filters, displayed measures, units, and three acceptance cases."],
    ["Connect the complete user flow", "Build the dashboard, connect it to the observation API, and display comparisons with clearly stated data assumptions."],
    ["Publish and demonstrate", "Deploy a working demo and record the acceptance cases. Share code and a README with the data source, assumptions, and limitations."],
  ],
  quality: [
    ["Test the main data journey", "Automate loading observations, applying a filter, and checking the resulting display. Add checks for malformed input and API failure."],
    ["Repair accessibility and configuration", "Check the dashboard using a keyboard and larger text. Verify runtime secrets stay on the server and errors have useful messages."],
    ["Verify the published app", "Open a direct route in a fresh browser session, exercise the main flow, and document the production setup and recovery procedure."],
  ],
  contribute: [
    ["Reproduce a small issue", "Choose a contribution-friendly project, read its guidance, and reproduce a bounded bug or documentation issue locally."],
    ["Prepare a focused fix", "Implement the smallest useful change, add relevant verification, and explain the issue and resulting behavior."],
    ["Submit the contribution", "Open a pull request that follows the project's instructions. Record the submission and respond to review; do not claim acceptance before it happens."],
  ],
  portfolio: [
    ["Write two evidence-based case studies", "Describe your dashboard and contribution with the problem, your own work, architecture or decisions, and verification evidence."],
    ["Record a three-minute demo", "Show a real dashboard interaction, the data assumptions, and a handled error. Include working project and code links."],
    ["Practise project questions", "Write and rehearse answers about one difficult bug, one design tradeoff, testing, data quality, and the next improvement."],
  ],
  role: [
    ["Build a relevant role shortlist", "Compare three junior full-stack or frontend-with-backend roles. Record required skills and the evidence your projects provide."],
    ["Tailor your application materials", "Prepare a concise profile and project summaries that match one shortlisted role using truthful evidence of your work."],
    ["Rehearse the technical walkthrough", "Practise a project demonstration and five role-specific questions. Record gaps and one concrete next step for each gap."],
  ],
};
export const exampleRoadmap: Roadmap = {
  ...exampleSeed,
  milestones: exampleSeed.milestones.map(milestone => ({
    ...milestone,
    tasks: exampleTasks[milestone.id].map(([title, description], index) => ({id:`step-${index + 1}`, title, description, done:false})),
  })),
};
export const exampleAdvice: Advice = {
  learningSteps: [
    "Build a small component with typed props, then extract a reusable card and filter control.",
    "Use state for a search input and fetch data with loading, empty and error states.",
    "Add an accessible form and explain why each state belongs in its chosen component.",
  ],
  project: {
    title:"A weekend energy explorer",
    brief:"Build a small React and TypeScript dashboard that compares electricity use across three example households. Clearly label the data as illustrative.",
    steps:["Define typed data records with units and dates.","Build a searchable household list and comparison chart.","Add loading, empty and error states; test keyboard navigation.","Deploy it and write a README explaining the data assumptions."],
    deliverable:"A live dashboard, a public repository and a short explanation of your component design.",
  },
  interviewQuestions:["When should state live in a parent component?","How would you prevent stale network responses updating the UI?","How does TypeScript help validate assumptions, and what still needs runtime validation?"],
};
