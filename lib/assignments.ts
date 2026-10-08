import type { CatalogItem, Topic } from "./easecareer-catalog";
import type { Milestone } from "./roadmap";

export type AssignmentTask = { id: string; title: string; description: string };
export type Assignment = {
  title: string;
  hours: number;
  tasks: AssignmentTask[];
  deliverable: string;
  checks: string[];
};
type TaskSeed = readonly [title: string, description: string];
function brief(title: string, hours: number, tasks: TaskSeed[], deliverable: string, checks: string[]): Assignment {
  return {title, hours, tasks: tasks.map(([title, description], i) => ({id: `step-${i + 1}`, title, description})), deliverable, checks};
}

const assignments: Record<string, Assignment> = {
  internet: brief("Trace a real web request", 2, [
    ["Map the request journey", "Choose a website. Draw the browser, DNS lookup, server, and response, and explain the purpose of each step."],
    ["Inspect the network traffic", "Reload with the Network panel open. Record the document request, one stylesheet, and one script with their status, content type, and size."],
    ["Explain a failure", "Block one request in your browser tools, reload, and record which part of the page breaks and why."],
  ], "An annotated request diagram and a three-request investigation report.", ["The diagram follows the request and response.", "The recorded requests include real headers and status codes.", "The failure explanation identifies the affected resource."]),
  http: brief("Investigate a JSON API", 2, [
    ["Send and compare requests", "Use an API client against a public read-only API or your local API. Capture a valid GET, a missing route, and a request with invalid input."],
    ["Read the response contract", "For each response, record the status code, content type, body shape, and relevant cache headers."],
    ["Write the client behavior", "Specify what your UI should show for success, invalid input, missing data, and a failed request. Do not treat every non-200 response as the same error."],
  ], "A request collection and a response-to-UI behavior table.", ["The request collection can be replayed.", "Each response has an explanation.", "The client handles at least three different outcomes."]),
  browser: brief("Publish and debug a profile page", 3, [
    ["Create a local page", "Make an HTML page with a stylesheet and a small script. Confirm all three resources load in the Network panel."],
    ["Publish the page", "Deploy the static files on a host you choose. Record the public HTTPS address and check a direct reload."],
    ["Diagnose a broken asset", "In a local copy, change a stylesheet path to a missing file. Use the console and network response to find and fix the problem."],
  ], "A working page URL and a short debugging log.", ["The public URL opens without local files.", "The page loads its script and stylesheet.", "The log explains how the missing asset was found."]),
  html: brief("Build an accessible portfolio page", 4, [
    ["Structure the page", "Create header, navigation, main, project, and footer sections. Include three project summaries and a sensible heading order."],
    ["Add a usable contact form", "Add labeled name, email, and message fields with native required-field validation. Explain that the demo does not actually send email."],
    ["Check without a mouse", "Tab through every link and field, check the focus order, and add useful alternatives for meaningful images."],
  ], "An HTML portfolio page with three projects and a labeled contact form.", ["Every form field has a visible associated label.", "Keyboard users can reach every control.", "The page has one main landmark and a clear heading hierarchy."]),
  css: brief("Make a responsive project gallery", 4, [
    ["Build the desktop layout", "Style a gallery of six project cards with CSS Grid. Set consistent spacing, type sizes, and image proportions."],
    ["Adapt the layout", "Make the gallery work at 360px, 768px, and 1280px widths. Use one column where the cards would become too narrow."],
    ["Test awkward content", "Try a long title, a missing image, and 200% browser zoom. Fix clipping, horizontal overflow, and unreadable text."],
  ], "A responsive gallery with screenshots at three viewport widths.", ["The narrow layout has no unintended horizontal scrolling.", "Long titles stay inside their cards.", "Content and controls remain usable at 200% zoom."]),
  javascript: brief("Build a persistent task tracker", 6, [
    ["Implement the task actions", "Use a form to add a task, edit its title, mark it done, and delete it. Reject blank titles and use stable task IDs."],
    ["Add filters and persistence", "Provide All, Active, and Completed filters. Save the task list in browser storage and restore it after a reload."],
    ["Handle failure and empty states", "Show an empty-list message. Catch invalid stored JSON or unavailable storage and keep the interface usable with a clear message."],
  ], "A JavaScript task tracker with editable tasks, filters, and reload persistence.", ["Task actions still work after filtering.", "A reload restores the list.", "Blank input and malformed saved data are handled."]),
  git: brief("Deliver a change through a pull request", 3, [
    ["Create a focused history", "Put a small project in a repository. Make separate commits for setup, a feature, and a fix, with clear messages."],
    ["Resolve a practice conflict", "Use two local branches to edit the same line. Merge them, resolve the conflict, and verify the final file."],
    ["Prepare a reviewable change", "Open a pull request for a small improvement. Include the purpose, setup steps, and the behavior you checked."],
  ], "A repository, a resolved merge conflict, and a reviewable pull request.", ["The repository contains no API keys or credentials.", "The commit history tells a clear story.", "Another developer can follow the verification steps."]),
  packages: brief("Make project setup repeatable", 2, [
    ["Configure project scripts", "Add commands for development, checks, and a production build to a small project manifest."],
    ["Manage one dependency", "Add and remove a dependency with your chosen package manager. Inspect and explain the manifest and lockfile changes."],
    ["Reproduce the setup", "Clone or copy the tracked files into a clean directory, install from the lockfile, and run the documented scripts."],
  ], "A project manifest, committed lockfile, and reproducible setup guide.", ["A clean install succeeds.", "Documented scripts run successfully.", "The lockfile matches the chosen package manager."]),
  react: brief("Build a React task board", 6, [
    ["Split the interface into components", "Create a TaskForm, TaskList, TaskItem, and FilterBar. Give each component clear props and use stable task IDs as keys."],
    ["Implement shared state", "Add, edit, complete, and delete tasks. Keep one source of truth so the active filter and task count stay consistent."],
    ["Persist and verify the board", "Save and restore tasks. Check adding under a filter, editing a completed task, and reloading with saved data."],
  ], "A working React task board and a short explanation of where state lives.", ["Each action updates the list and counts consistently.", "A reload restores tasks.", "The three documented interaction checks pass."]),
  typescript: brief("Type a task API client", 4, [
    ["Define the data contract", "Create Task and API response types. Use a union for loading, success, and failure states instead of optional fields everywhere."],
    ["Validate external data", "Fetch or mock a task response and validate its shape before using it. Handle missing IDs and invalid status values."],
    ["Remove unsafe assumptions", "Run strict type checks without using any to bypass errors. Document the difference between static types and runtime validation."],
  ], "A typed API client with runtime validation and passing strict checks.", ["Malformed external data produces a useful error.", "Loading, success, and failure are represented explicitly.", "The project passes its TypeScript check."]),
  accessibility: brief("Audit and repair a task form", 3, [
    ["Complete the flow using a keyboard", "Use Tab, Shift+Tab, Enter, and Space to add and edit a task. Record unreachable controls and missing focus indicators."],
    ["Fix labels and feedback", "Add associated labels, meaningful button names, and understandable validation feedback. Check that errors are discoverable."],
    ["Retest with larger text", "Check 200% zoom and the interface's text contrast. Record the fixes and any remaining limitations."],
  ], "An accessibility audit with a before/after checklist and the repaired form.", ["The main flow can be completed without a mouse.", "Controls have useful names and visible focus.", "Validation errors explain how to recover."]),
  node: brief("Build a Node.js task API", 7, [
    ["Implement CRUD routes", "Create routes to list, create, update, and delete tasks. Use JSON responses and generated stable IDs."],
    ["Validate inputs and handle errors", "Reject blank titles and invalid statuses. Return a missing-record response for unknown IDs and a consistent error shape."],
    ["Verify the full lifecycle", "Run a request collection that creates a task, reads it, updates it, deletes it, and confirms it is gone."],
  ], "A runnable Node.js API, request collection, and setup instructions.", ["The create/read/update/delete flow passes.", "Invalid input is rejected without crashing.", "Secrets and environment settings are not committed."]),
  sql: brief("Model and query a task database", 5, [
    ["Create related tables", "Create users and tasks with primary keys, an owner foreign key, and status constraints. Seed two users and ten tasks."],
    ["Write useful queries", "Write queries for tasks by owner, overdue tasks, and completed-task counts. Use a join to include the owner's name."],
    ["Check integrity and rollback", "Attempt an invalid owner reference and a transaction that must roll back. Record the outcomes and explain the constraints."],
  ], "A schema migration, seed data, and five documented SQL queries.", ["Invalid owner references are rejected.", "Each query returns the expected seeded rows.", "The rollback test leaves no partial update."]),
  api: brief("Specify and implement a paginated API", 5, [
    ["Write the endpoint contract", "Specify task list/create/update routes, request fields, response shapes, and status codes in an API document."],
    ["Add predictable pagination", "Implement a task list with a limit and a documented ordering or cursor. Check the first page, a later page, and the empty result."],
    ["Verify success and error cases", "Capture requests for valid creation, invalid input, an unknown task, and an empty list. Match them against the contract."],
  ], "An API contract, working paginated endpoint, and replayable request examples.", ["The documented contract matches the responses.", "Pagination does not repeat records in the tested flow.", "Validation and missing-record errors are distinct."]),
  auth: brief("Protect each user's private tasks", 6, [
    ["Add a supported sign-in flow", "Use a maintained authentication library or service. Set up a session and a sign-out flow; keep secrets in server configuration."],
    ["Enforce ownership on the server", "Give tasks an owner ID. Check the current user's identity and ownership on every protected read and write."],
    ["Test with two accounts", "Create a task as user A. Confirm a signed-out request and user B cannot read, change, or delete it. Record the allowed and denied cases."],
  ], "A protected task flow and an access-control test matrix for two users.", ["Signed-out requests are denied.", "User B cannot access user A's tasks.", "Sign-out removes access to protected actions."]),
  testing: brief("Test a complete task journey", 4, [
    ["Test the smallest important rule", "Write focused tests for title validation and task filtering, including blank input and an empty list."],
    ["Test the API boundary", "Verify creation succeeds, malformed input is rejected, and an unknown task returns the expected error."],
    ["Test the user journey", "Automate adding and completing a task, then reload and verify it persists. Make a deliberate bug and confirm a relevant test fails."],
  ], "A test suite with unit, API, and one complete user-flow check.", ["The relevant tests fail when the behavior is broken.", "The suite passes after restoring the correct behavior.", "The reload check verifies persistence."]),
  docker: brief("Run the API and database in containers", 5, [
    ["Containerize the application", "Write a Dockerfile for your API. Use a supported base image and keep credentials out of the image."],
    ["Connect a database", "Create a Compose configuration for the API and database with service networking and a persistent data volume."],
    ["Verify a clean start and restart", "Start from the documented commands, create a record, restart the services, and confirm the record remains."],
  ], "A Dockerfile, Compose configuration, and tested startup guide.", ["The API reaches the database by its service name.", "A clean startup works from the guide.", "Data survives a normal restart."]),
  cicd: brief("Automate checks on every change", 4, [
    ["Create the check workflow", "Configure CI to install from the lockfile, run the project's checks, and build the production artifact."],
    ["Prove that failures are caught", "Open a practice change with a failing test or type error. Confirm CI fails, then fix it and record the passing run."],
    ["Document release and rollback", "Explain how a checked commit reaches production, where deployment secrets live, and how to restore a previous version."],
  ], "A CI workflow with a recorded failing and passing run, plus release notes.", ["The workflow runs on the intended changes.", "An actual broken change fails the workflow.", "The release guide names a rollback procedure."]),
  deployment: brief("Ship and recover a working application", 5, [
    ["Prepare production configuration", "Document required environment settings, database setup, and build commands. Use placeholders instead of real secrets."],
    ["Deploy and verify the main flow", "Publish the application. Open the public URL and check a direct route reload, assets, API behavior, and a saved record."],
    ["Practise a safe rollback", "On a test deployment, publish a harmless broken change and restore the last working version. Record how you identified and recovered from it."],
  ], "A live demo URL, setup guide, and deployment/recovery log.", ["The published main flow works from a fresh visit.", "Configuration contains no exposed secrets.", "A recovery procedure was actually exercised."]),
  project: brief("Ship a complete learning dashboard", 12, [
    ["Define and build the core flow", "Write a small acceptance checklist: choose a path, add a task, complete it, and see progress. Build the interface for that flow."],
    ["Connect the API and data", "Persist tasks through a backend. Validate input and add loading, empty, and error states. Include ownership checks if you add accounts."],
    ["Test, deploy, and explain", "Verify the complete flow including a reload. Publish a demo and write a README with setup, architecture, and known limitations."],
  ], "A working dashboard with a backend, demo URL, tests, and README.", ["Task changes survive a reload through persistent storage.", "Failure states are understandable.", "Another developer can run the documented setup."]),
  portfolio: brief("Turn your project into a case study", 3, [
    ["Write the project story", "Describe the user problem, your contribution, the architecture, and one decision with its tradeoff. Include repository and demo links."],
    ["Demonstrate the real behavior", "Record a three-minute walkthrough of the main flow, including persistence and one handled error."],
    ["Prepare for questions", "Write answers to five questions about design, debugging, testing, security, and what you would improve next."],
  ], "A project case study, short demo recording, and five interview answers.", ["Links open the actual project.", "The demo shows behavior rather than only screenshots.", "Your contribution and limitations are clearly stated."]),
  python: brief("Build a CSV expense-report tool", 5, [
    ["Read and validate the records", "Create a command-line tool that accepts a CSV with date, category, and amount. Validate headers, missing fields, and invalid amounts."],
    ["Produce useful summaries", "Calculate totals by category and month. Write a cleaned CSV and a report without changing the original input."],
    ["Test the edge cases", "Check empty input, a malformed row, duplicate records, and a missing file. Add help text and reproducible sample input."],
  ], "A Python CLI, sample CSV, generated report, and edge-case tests.", ["Totals match a hand-checked sample.", "Invalid rows are reported clearly.", "The original input file remains intact."]),
  data: brief("Investigate a public dataset", 6, [
    ["Inspect and clean the data", "Choose a small dataset with a stated source. Record column types, missing values, duplicate rows, and your cleaning decisions."],
    ["Answer three questions", "Use filters, grouping, and joins where appropriate to answer three questions. Create a chart that supports each answer."],
    ["Explain the evidence", "Write a short findings report with the source, methods, uncertainty, and at least two limitations. Keep a reproducible notebook or script."],
  ], "A reproducible analysis, three charts, and a findings report.", ["The cleaned data can be reproduced from the source.", "Each chart answers a stated question.", "Conclusions acknowledge missing data and other limits."]),
  statistics: brief("Compare two groups carefully", 5, [
    ["Describe the distributions", "Choose two groups in a dataset. Report sample sizes, mean, median, spread, and a plot that shows outliers."],
    ["Estimate uncertainty", "Calculate an appropriate interval for the difference using a documented method. State its assumptions and sampling limits."],
    ["Write a cautious conclusion", "Explain the observed difference, uncertainty, and possible confounders. Separate an association from a causal claim."],
  ], "An analysis notebook and a comparison report with an uncertainty estimate.", ["Sample sizes and methods are stated.", "The calculation can be reproduced.", "The conclusion does not claim unsupported causation."]),
  ml: brief("Train and evaluate a baseline classifier", 8, [
    ["Prepare a leakage-free split", "Choose a small classification dataset. Define the target and separate training and test data before fitting preprocessing."],
    ["Compare two baselines", "Train a simple baseline and one model. Choose a metric appropriate to class balance and record the same evaluation for both."],
    ["Inspect mistakes", "Show a confusion matrix and five incorrect predictions. Explain likely causes and write a model summary with limitations."],
  ], "A reproducible training notebook, baseline comparison, and error report.", ["Test data is not used to fit preprocessing or tune the model.", "Both models are evaluated on the same held-out data.", "Failure cases are documented."]),
  ai: brief("Build a grounded document assistant", 8, [
    ["Define the answer contract", "Use a small set of documents you may use. Specify an answer format with source references and a clear response when evidence is missing."],
    ["Build a narrow prototype", "Accept a question, retrieve relevant excerpts, and generate an answer grounded in those excerpts. Validate the result before displaying it."],
    ["Evaluate ten questions", "Test answerable, unanswerable, and conflicting questions. Record evidence accuracy, failures, latency, and the limitations of your prototype."],
  ], "A document assistant demo and a ten-question evaluation report.", ["Answers cite the supplied evidence.", "Missing information produces a clear limitation.", "Malformed or failed model responses are handled."]),
  linux: brief("Automate a local backup and health check", 4, [
    ["Inspect the environment", "Record the working directory, file permissions, running processes, and available disk space on a machine you control."],
    ["Write a repeatable script", "Create a script that copies a chosen folder into a dated backup location and checks a local service or process."],
    ["Exercise failures", "Try a missing source folder, an unwritable destination, and a stopped service. Return useful messages and exit statuses."],
  ], "A shell script with usage instructions and a success/failure log.", ["The backup can be restored.", "Missing paths fail with a clear message.", "Repeated runs do not overwrite the only valid backup."]),
  cloud: brief("Design and observe a small cloud service", 5, [
    ["Draw the smallest architecture", "Choose a small service and document compute, storage, networking, and permissions. Explain which parts can be demonstrated locally."],
    ["Configure a test environment", "Use a local emulator or an existing test account. Configure least-privilege access, environment settings, and a health endpoint."],
    ["Observe and estimate", "Capture logs from successful and failing requests. Estimate usage and cost from stated assumptions; do not assume a free tier covers everything."],
  ], "An architecture diagram, test logs, and an assumption-based cost estimate.", ["Permissions are limited to the needed actions.", "Both successful and failing requests are observable.", "The cost estimate names its usage assumptions."]),
  security: brief("Review your app's trust boundaries", 5, [
    ["Create a small threat model", "On your own local app, list sensitive data, entry points, and trust boundaries. Prioritize three plausible risks."],
    ["Verify access and validation", "Test malformed input and a request by another test user against your local API. Confirm server-side checks reject unauthorized actions."],
    ["Fix and retest", "Repair one issue, add a regression check, and record evidence that the check rejects the original failing case."],
  ], "A threat model, one repaired issue, and a regression-check report.", ["Testing stays within your local or explicitly authorized app.", "Sensitive operations check ownership on the server.", "The fixed issue has a repeatable verification case."]),
  design: brief("Prototype a learner's weekly plan", 6, [
    ["Define the learner's task", "Write a short problem statement and map the flow from choosing a goal to seeing three tasks for the week."],
    ["Make an interactive prototype", "Create goal-entry, weekly-plan, task-detail, and empty/error screens. Use realistic sample content and clear navigation."],
    ["Observe and revise", "Ask three people to find and complete the first task in the prototype. Record confusion and revise the flow based on what you observe."],
  ], "An interactive prototype, usability notes, and a before/after revision.", ["The core flow has a clear starting point and outcome.", "Task content names an actual action and deliverable.", "Revisions respond to observed usability problems."]),
  architecture: brief("Design a reliable URL shortener", 6, [
    ["Specify requirements and limits", "Define link creation, redirects, expiry, expected traffic, and abuse constraints. State your workload assumptions."],
    ["Model the system", "Draw client, API, database, and optional cache boundaries. Specify a data model and the link creation and redirect flows."],
    ["Explain failure behavior", "Work through duplicate identifiers, a database outage, an expired link, and a stale cache. Explain the tradeoffs in your design."],
  ], "A system-design document with diagrams, data model, and failure walkthroughs.", ["Assumptions are explicit rather than invented measurements.", "Every main flow has a defined response.", "Failure scenarios include a recovery or limitation."]),
  algorithms: brief("Solve and compare three algorithm problems", 6, [
    ["Use a hash map", "Solve a pair-sum problem. Compare a nested-loop solution with a hash-map solution and test duplicates and no-match input."],
    ["Use binary search", "Implement binary search on a sorted list. Test empty input, one item, boundaries, and a missing target."],
    ["Traverse a graph", "Use breadth-first search to find a shortest path in an unweighted graph. Explain time and space use and handle unreachable nodes."],
  ], "Three tested solutions with a complexity and edge-case explanation.", ["The recorded edge cases pass.", "Complexity claims match the implementation.", "The graph solution handles an unreachable target."]),
};

function webBoard(name: string) {
  return brief(`Build a ${name} task board`, 7, [
    ["Create the interface", `Use ${name}'s native components to build a task form, list, and detail view. Define where the task data and active filter live.`],
    ["Connect the interactions", "Implement add, edit, complete, and delete actions. Show loading, empty, and error states when reading data."],
    ["Verify navigation and saved data", "Save tasks, reload a direct detail route if routing is used, and confirm state stays consistent across the list and detail views."],
  ], `A ${name} task board, setup guide, and three interaction checks.`, ["Task actions update every relevant view.", "A reload restores the saved tasks.", "Empty input and a failed data request are handled."]);
}
function apiProject(name: string) {
  return brief(`Build a ${name} notes API`, 8, [
    ["Implement the notes contract", `Use ${name} to implement list, create, read, update, and delete note routes with consistent JSON responses.`],
    ["Persist and validate notes", "Add a database, a migration, and input validation. Keep configuration outside the source and reject unknown note IDs."],
    ["Verify the lifecycle", "Create a note, update it, restart the application, read it again, delete it, and verify the missing-record response."],
  ], `A ${name} API with persistence, request examples, and setup instructions.`, ["Records survive a restart.", "Invalid input and unknown IDs have distinct responses.", "Another developer can reproduce the lifecycle check."]);
}
function languageProject(name: string) {
  return brief(`Build a ${name} expense tracker`, 6, [
    ["Model and accept input", `Use ${name} to model an expense with an ID, category, date, and amount. Accept records from a file or a small command-line interface.`],
    ["Calculate and persist results", "Add, list, and remove expenses. Save them to a file and calculate category totals without relying on hardcoded examples."],
    ["Check data and error handling", "Test an empty file, invalid amount, unknown ID, and a save/reload cycle. Explain the chosen types and error-handling approach."],
  ], `A runnable ${name} program, sample records, and automated checks.`, ["Totals match a hand-checked fixture.", "Records survive a save/reload cycle.", "Invalid input produces a useful error."]);
}
function mobileProject(name: string) {
  return brief(`Build a ${name} habit tracker`, 8, [
    ["Create the main screens", `Use ${name} to build a habit list, an add/edit screen, and a daily completion view with accessible controls.`],
    ["Persist the habits", "Store habits locally. Support editing, deleting, and marking a habit complete for a selected day, then restart the app."],
    ["Check real device behavior", "Use an emulator or device to check small screens, the on-screen keyboard, navigation back, and a saved-state restart."],
  ], `A ${name} app, screenshots or recording, and a device-check log.`, ["A restart restores habits and completions.", "The keyboard does not hide essential controls.", "Navigation and validation behave predictably."]);
}

for (const name of ["Vue", "Angular", "Next.js"]) assignments[name === "Next.js" ? "nextjs" : name.toLowerCase()] = webBoard(name);
for (const [id, name] of Object.entries({"aspnet-core":"ASP.NET Core", "spring-boot":"Spring Boot", php:"PHP", laravel:"Laravel", django:"Django", "ruby-on-rails":"Ruby on Rails", graphql:"GraphQL"})) {
  assignments[id] = apiProject(name);
}
assignments.graphql = brief("Build a GraphQL reading-list API", 7, [
  ["Define the schema", "Define Book and ReadingEntry types, queries for lists and individual records, and mutations to add and update entries."],
  ["Implement and validate resolvers", "Persist entries, validate mutation input, and return understandable errors for missing records and invalid values."],
  ["Verify query behavior", "Run queries requesting different fields, a paginated list, and a mutation. Check that the returned shape matches the request."],
], "A GraphQL schema, persistent API, and a saved query collection.", ["Queries return the requested fields.", "Mutations validate input.", "Records survive a restart."]);
for (const [id, name] of Object.entries({java:"Java", "c-programming":"C", cplusplus:"C++", rust:"Rust", go:"Go", ruby:"Ruby", scala:"Scala", "r-programming":"R"})) assignments[id] = languageProject(name);
for (const [id, name] of Object.entries({android:"Android", ios:"iOS", flutter:"Flutter", "react-native":"React Native", kotlin:"Kotlin", "swift-and-swift-ui":"SwiftUI"})) assignments[id] = mobileProject(name);

Object.assign(assignments, {
  mongodb: brief("Store and query a product catalog", 5, [
    ["Design the documents", "Model products with IDs, names, categories, prices, and optional attributes. Create sample products and validation rules."],
    ["Implement catalog queries", "Add category filtering, price sorting, and pagination. Compare embedding and referencing for one related-data choice."],
    ["Inspect the query plan", "Explain a common query before and after a suitable index. Record the plan and verify invalid documents are rejected."],
  ], "A catalog dataset, validated queries, and an index investigation.", ["Filtering and pagination return the expected records.", "Invalid records are rejected.", "The index choice is explained using query-plan evidence."]),
  redis: brief("Add a measured cache to a local API", 5, [
    ["Choose and measure one read", "Pick a local endpoint and record its uncached behavior and latency over repeated requests."],
    ["Implement cache lifecycle", "Cache the result with an expiry and a clear key convention. Invalidate or update it when the underlying record changes."],
    ["Test stale and unavailable cache cases", "Change the underlying record and simulate an unavailable cache. Verify correctness and record the tradeoff between freshness and speed."],
  ], "A cached endpoint, invalidation checks, and a before/after report.", ["An update is not hidden behind stale cached data in the tested flow.", "Cache unavailability is handled.", "Measurements state their test conditions."]),
  kubernetes: brief("Deploy a service to a local cluster", 7, [
    ["Describe the workloads", "Create workload and service manifests for a small containerized API. Separate configuration from credentials."],
    ["Roll out and inspect", "Run it in a local cluster, inspect pods and logs, and verify the service through a documented local access path."],
    ["Exercise recovery", "Delete a pod and observe replacement. Try a failing readiness check and practise rolling back a test update."],
  ], "Cluster manifests and a rollout, recovery, and rollback log.", ["The service answers requests in the local test.", "An unhealthy workload is observable.", "The rollback restores the working version."]),
  terraform: brief("Plan and reproduce infrastructure", 6, [
    ["Write a small configuration", "Describe a small local-provider or test-account environment with variables and outputs. State which resources the plan can create."],
    ["Inspect the plan", "Format and validate the configuration, then review the proposed changes. Document state handling and keep secrets out of tracked files."],
    ["Prove repeatability", "In the chosen test environment, apply only understood changes and inspect a second plan. Document cleanup and how to avoid unintended deletion."],
  ], "Infrastructure configuration, reviewed plan output, and a state/cleanup guide.", ["The plan matches the intended resources.", "A second run does not propose unexplained changes.", "State and secret handling are documented."]),
  cloudflare: brief("Build a Worker-backed notes service", 7, [
    ["Create a small HTTP handler", "Implement list and create note requests with JSON responses, validation, and a health endpoint."],
    ["Bind persistent storage", "Connect a supported data binding in local development. Keep runtime configuration separate from source code."],
    ["Verify the deployed boundary", "Deploy to a test environment you control, verify persistence, and test malformed input and an unavailable dependency."],
  ], "A Worker service, storage setup instructions, and a request test log.", ["Valid notes can be saved and loaded.", "Invalid input is rejected.", "The guide identifies the required runtime bindings."]),
  elasticsearch: brief("Build and evaluate a small search index", 6, [
    ["Prepare and index documents", "Create a small product or article dataset. Define field mappings and index the records in a local test environment."],
    ["Implement useful searches", "Add text search, a category filter, and a documented sort. Explain the difference between analyzed text and exact-value fields."],
    ["Evaluate and update results", "Write ten search queries with expected matches, inspect surprising rankings, and verify an updated document becomes searchable."],
  ], "An index setup, query collection, and ten-query relevance report.", ["Filters and sorts return expected records.", "Mappings match the data's purpose.", "Updates are visible according to the documented refresh behavior."]),
  wordpress: brief("Build a content site with an editor workflow", 6, [
    ["Create a local content site", "Set up a local WordPress site with a home page, an article list, and five sample posts in meaningful categories."],
    ["Customize the presentation", "Use a theme or child theme to build a responsive layout. Keep content editable instead of hardcoding every post into templates."],
    ["Verify publishing and recovery", "Check draft/published behavior, navigation, and a mobile layout. Make a backup and document a tested restore in the local environment."],
  ], "A local site demo, editor guide, and backup/restore notes.", ["An editor can change content without editing code.", "Drafts and published posts behave as expected.", "The documented local restore recovers the content."]),
  "design-system": brief("Create a small reusable UI kit", 6, [
    ["Define shared tokens", "Specify colors, spacing, typography, and focus styles with readable examples. Explain how each token is used."],
    ["Build three components", "Create Button, TextField, and Alert components with loading, disabled, error, and success states where appropriate."],
    ["Document and verify usage", "Build a component gallery and use the kit in a small form. Check keyboard operation and consistency across the form and gallery."],
  ], "A token set, three reusable components, and an accessible component gallery.", ["Components use the shared tokens.", "Required states are documented.", "The example form is usable with a keyboard."]),
  "prompt-engineering": brief("Evaluate a structured support-response prompt", 5, [
    ["Define the output", "Specify a response with issue category, suggested action, and an uncertainty field. Write ten representative inputs including ambiguous ones."],
    ["Compare two prompt versions", "Run the same inputs through a baseline and a revised prompt. Keep model settings and evaluation rules consistent."],
    ["Score and document failures", "Check schema validity, factual support, and helpfulness. Record failures and explain when the application should ask for clarification."],
  ], "Two prompt versions, ten test inputs, and a scored comparison.", ["Comparison conditions are stated.", "Malformed outputs are counted as failures.", "The report includes ambiguous and unsupported cases."]),
  "ai-agents": brief("Build a bounded planning assistant", 8, [
    ["Define one allowed tool", "Create a local task-list tool with a narrow input schema. Specify which actions require a human confirmation."],
    ["Implement controlled execution", "Let the assistant propose and execute only allowed tool calls. Validate arguments and set a maximum number of steps."],
    ["Evaluate safe failure", "Test invalid arguments, a failed tool, repeated calls, and an unrelated request. Record how the assistant stops and explains the result."],
  ], "A local assistant prototype, tool contract, and failure-case evaluation.", ["The assistant cannot call undeclared tools.", "Step limits and invalid arguments are enforced.", "Failed actions are reported without claiming success."]),
  "claude-code": brief("Deliver and review an AI-assisted change", 5, [
    ["Write a bounded implementation brief", "Use a small local repository. Specify one feature, its acceptance conditions, and the files or behaviors that should be preserved."],
    ["Review the proposed change", "Use your available coding assistant to implement the feature. Inspect the diff, explain each meaningful change, and correct unsupported assumptions."],
    ["Verify independently", "Run the project's checks and manually exercise the acceptance cases. Document one issue your review found and the final result."],
  ], "A reviewed patch, original brief, and independent verification notes.", ["The feature matches the stated acceptance conditions.", "You can explain the final diff.", "Verification is based on observed behavior."]),
  openclaw: brief("Evaluate an automation workflow in a test setup", 5, [
    ["Inspect the available setup", "Read the documentation for the version you actually have. Record its permissions, supported actions, and one harmless workflow you can run locally."],
    ["Run a bounded experiment", "Use synthetic inputs and no personal credentials. Set an explicit stopping condition and capture the action sequence and outputs."],
    ["Assess control and failure", "Try incomplete input and an unavailable action. Explain how you would prevent accidental actions and where human confirmation belongs."],
  ], "A version-specific workflow report with test inputs and a control checklist.", ["Capabilities are verified against the installed version.", "The experiment uses a test environment and synthetic data.", "Failure and stopping behavior are documented."]),
  seo: brief("Audit and improve a small content site", 5, [
    ["Check discoverability", "Audit five pages for unique titles, useful headings, canonical intent, internal links, and descriptive content."],
    ["Improve the pages", "Fix confusing titles, broken links, and missing descriptions. Review indexability settings and document the intended crawl behavior."],
    ["Verify the changes", "Recheck the five pages, record before/after evidence, and write how you would monitor results without promising rankings."],
  ], "A five-page SEO audit, implemented fixes, and verification evidence.", ["Changes match the page's actual content.", "Important internal links work.", "The report distinguishes changes from unmeasured ranking outcomes."]),
  "data-engineer": brief("Build a repeatable CSV-to-database pipeline", 8, [
    ["Define the source and destination", "Create a small source CSV and database schema. Specify types, record identifiers, and required data-quality rules."],
    ["Implement the pipeline", "Load, validate, transform, and store records. Separate rejected rows and log counts for each stage."],
    ["Check repeat runs and failures", "Run the same batch twice without duplicate records. Test a malformed row and an interrupted run, then document recovery."],
  ], "A pipeline, schema, sample input, and repeat-run/recovery report.", ["A repeated batch does not duplicate records.", "Rejected rows have useful reasons.", "The output can be reproduced from the sample source."]),
  "inference-engineering": brief("Benchmark a model-serving prototype", 8, [
    ["Define a serving contract", "Choose a small model or mocked model service. Specify valid inputs, outputs, error responses, and the environment used."],
    ["Measure a baseline", "Use a fixed input set and record request latency, throughput, and output correctness under stated test conditions."],
    ["Evaluate one optimization", "Try batching, caching, or a supported deployment setting. Compare the same workload and document any correctness or resource tradeoff."],
  ], "A serving prototype and a reproducible baseline/optimization benchmark.", ["Both runs use comparable workloads.", "Output correctness is checked alongside speed.", "Hardware and model settings are documented."]),
  mlops: brief("Version and monitor a model release", 8, [
    ["Record a reproducible training run", "Track dataset version, preprocessing, model parameters, evaluation metrics, and the produced artifact."],
    ["Package a prediction service", "Expose a small prediction endpoint with input validation, artifact version information, and a health check."],
    ["Simulate a bad release", "Compare a second version against acceptance thresholds. Demonstrate selecting the previous working artifact and describe monitoring for drift or failures."],
  ], "Versioned model artifacts, a prediction service, and a release/rollback report.", ["A prediction can be traced to an artifact version.", "Invalid input is handled.", "The release decision uses documented evaluation thresholds."]),
  qa: brief("Create a risk-based task-app test plan", 5, [
    ["Map the important behaviors", "List the create, edit, complete, delete, and reload flows. Prioritize validation, persistence, and access-control failures."],
    ["Execute test cases", "Write reproducible steps, expected results, and observed results for ten cases, including empty data and invalid input."],
    ["Report and retest a defect", "Record one real or deliberately introduced bug with evidence. Verify the fix and add a regression case."],
  ], "A prioritized test plan, ten executed cases, and a defect/retest report.", ["Expected and actual results are recorded separately.", "Failures have reproducible steps.", "The fixed defect has a regression case."]),
  "technical-writer": brief("Write documentation another learner can use", 5, [
    ["Define the audience and outcome", "Pick a small project and identify what a new user needs to accomplish. Outline prerequisites, setup, first use, and troubleshooting."],
    ["Write and exercise the guide", "Write a quick start and a reference page. Follow every step in a clean setup and correct missing assumptions."],
    ["Observe a reader", "Ask someone unfamiliar with the project to follow the guide. Record where they stop and revise the content."],
  ], "A tested quick start, reference page, and reader-feedback notes.", ["The guide names prerequisites.", "Commands and examples were checked in a clean setup.", "The revision addresses a real reader problem."]),
  "game-developer": brief("Build a small playable game loop", 10, [
    ["Define and implement the loop", "Create a game with movement, one objective, collision or interaction rules, and a clear win/lose state."],
    ["Add useful feedback", "Provide score or progress feedback, pause/restart controls, and an understandable introduction to the controls."],
    ["Playtest and fix", "Observe three play sessions. Fix one control or feedback problem and document performance and known limitations."],
  ], "A playable demo, control guide, and playtest revision report.", ["The main loop reaches a win or lose state.", "Restart produces a clean new game.", "The revision responds to observed play behavior."]),
  "server-side-game-developer": brief("Simulate a multiplayer room service", 10, [
    ["Model authoritative room state", "Implement a local room service with join, leave, and player actions. Validate each action against the server's state."],
    ["Synchronize two clients", "Use two local clients to observe the same room. Document message shape, ordering assumptions, and disconnect behavior."],
    ["Test invalid and repeated actions", "Try duplicate messages, an action from a disconnected player, and a reconnect. Confirm the server state remains consistent."],
  ], "A local two-client room demo and a consistency/failure test report.", ["Clients observe the authoritative room state.", "Invalid actions are rejected by the server.", "Disconnect and reconnect behavior is documented."]),
  blockchain: brief("Test a small contract in a local network", 8, [
    ["Specify the state and permissions", "Design a small registry or voting contract. Define allowed actions, state transitions, and expected rejection cases."],
    ["Implement on a local test network", "Use test accounts and synthetic data. Write the contract and a small script or interface to exercise its main flow."],
    ["Test the boundaries", "Check unauthorized actions, repeated submissions, and invalid state transitions. Document assumptions and limitations."],
  ], "A local contract demo, automated tests, and a permissions specification.", ["No real funds or production credentials are used.", "Unauthorized state changes are rejected.", "The tested main flow matches the specification."]),
  "product-manager": brief("Specify a useful learning-planner feature", 6, [
    ["Gather the problem evidence", "Talk to three learners about planning and completing practice. Record observed problems and distinguish them from your proposed solution."],
    ["Write a bounded specification", "Define one target user, a small feature, success criteria, acceptance cases, and what is outside this iteration."],
    ["Prioritize and review", "Rank five possible improvements by impact, effort, and uncertainty. Review a prototype against the acceptance cases and revise the specification."],
  ], "A feature brief, acceptance checklist, and evidence-based priority table.", ["The brief names a concrete user problem.", "Acceptance cases describe observable behavior.", "Priorities include their evidence and assumptions."]),
  "engineering-manager": brief("Plan and review a small team delivery", 6, [
    ["Break the outcome into work", "Choose a small app feature. Define the shared outcome, three work areas, owners, dependencies, and acceptance conditions."],
    ["Plan collaboration and risks", "Set review and integration checkpoints. Record likely blockers, a fallback plan, and how the team will communicate progress."],
    ["Run a delivery review", "Use a sample or real completed change to review quality, handoffs, and outcomes. Write two concrete improvements for the next iteration."],
  ], "A team delivery plan, risk log, and a short retrospective.", ["Every work area has an owner and acceptance conditions.", "Dependencies and checkpoints are explicit.", "The retrospective identifies actionable improvements."]),
  "developer-relations": brief("Create a developer onboarding workshop", 6, [
    ["Build a reproducible demo", "Choose a small API or library example that solves one useful problem. Provide sample data and setup instructions."],
    ["Write the workshop", "Create a twenty-minute walkthrough with a first success, one extension exercise, and troubleshooting for likely errors."],
    ["Observe two participants", "Ask two developers unfamiliar with the demo to follow it. Record time to first success, confusion, and feedback, then revise."],
  ], "A demo repository, workshop guide, and participant-feedback report.", ["Participants can reach the documented first success.", "Examples are runnable.", "The revision addresses observed friction."]),
  "bi-analyst": brief("Build a decision-focused business dashboard", 7, [
    ["Define the business questions", "Use a small sales dataset. Define revenue, order count, and a rate or average with explicit formulas and date handling."],
    ["Build the report", "Clean the data and create a dashboard with time, category, and region views. Add filters and clear labels."],
    ["Validate and explain", "Reconcile totals with source data. Write three findings and two limitations, and show how filters affect the metrics."],
  ], "A business dashboard, metric definitions, and a reconciliation report.", ["Dashboard totals match the hand-checked source sample.", "Metric definitions are explicit.", "Filters produce predictable results."]),
  "network-engineer": brief("Investigate a local network path", 5, [
    ["Map a test network", "Draw the clients, router, name resolution, and service on a network you control. Record addressing and access assumptions."],
    ["Capture allowed diagnostics", "Use permitted local diagnostics to check name resolution, service reachability, and the listening port. Record the observations."],
    ["Diagnose a controlled fault", "In your test setup, stop the service or change a local configuration. Explain how the evidence distinguishes service, naming, and connectivity failures."],
  ], "A network diagram and a controlled-fault investigation report.", ["Diagnostics remain within the chosen test environment.", "Observed results are recorded.", "The diagnosis points to evidence rather than guesses."]),
  "forward-deployed-engineer": brief("Deliver a prototype for a customer workflow", 10, [
    ["Translate the workflow into requirements", "Use a synthetic customer scenario. Define inputs, the user journey, integration assumptions, and three acceptance cases."],
    ["Build a narrow integration", "Implement the main flow using mock or test-system data. Handle missing records, invalid input, and an unavailable dependency."],
    ["Demonstrate and hand off", "Run the acceptance cases, record a demo, and write setup, support, and limitation notes another engineer can follow."],
  ], "A working prototype, acceptance-case results, and a handoff guide.", ["The demo satisfies the stated user workflow.", "Integration failures are understandable.", "The handoff identifies assumptions and limitations."]),
  "code-review": brief("Review and improve a real change", 4, [
    ["Understand the intended behavior", "Choose a small local patch or pull request. Write its purpose and identify the behaviors most likely to break."],
    ["Review with evidence", "Inspect correctness, input handling, access boundaries, and readability. Run relevant checks and write three actionable comments with concrete examples."],
    ["Verify the revision", "Apply or request a focused improvement, rerun the relevant check, and explain what was fixed and what remains uncertain."],
  ], "A review report, actionable comments, and verification of one revision.", ["Comments point to concrete behavior or evidence.", "The review distinguishes defects from preferences.", "The revision is checked against the original concern."]),
  "backend-performance-best-practices": brief("Measure and improve one slow endpoint", 6, [
    ["Establish a reproducible baseline", "Use your local app and fixed sample data. Record response times and database activity for one endpoint under a stated workload."],
    ["Fix the measured bottleneck", "Choose one evidence-backed change, such as removing repeated queries, adding an index, or reducing response size."],
    ["Compare correctness and speed", "Repeat the same workload. Check response correctness, report the before/after results, and explain the tradeoff."],
  ], "A repeatable benchmark, one optimization, and a comparison report.", ["Both measurements use comparable conditions.", "Correctness checks still pass.", "The proposed bottleneck is supported by evidence."]),
  "frontend-performance-best-practices": brief("Improve a measured page-load problem", 5, [
    ["Record the baseline", "Measure a page in your local app using a consistent device/network profile. Identify a large asset, slow interaction, or layout shift."],
    ["Make one focused improvement", "Optimize the identified issue, such as image dimensions, unnecessary work, or a large asset. Keep behavior and accessibility intact."],
    ["Repeat the measurement", "Run comparable measurements before and after. Record variability and check the main interactions still work."],
  ], "A focused frontend improvement with comparable performance evidence.", ["Test conditions are recorded.", "The change addresses an observed issue.", "The main user flow and accessibility checks still pass."]),
});

const aliases: Record<string, string> = {
  nodejs:"node", postgresql:"sql", "git-and-github":"git", "shell-bash":"linux",
  "data-analyst":"data", "python-for-data-analysis":"data", "machine-learning":"ml", "ai-and-data-scientist":"ml",
  "ai-engineer":"ai", "ai-product-builders":"ai", "vibe-coding":"claude-code",
  "product-design":"design", "ux-design":"design", "software-architect":"architecture", "system-design":"architecture", "design-and-architecture":"architecture",
  "computer-science":"algorithms", leetcode:"algorithms", "data-structures-and-algorithms":"algorithms",
  "api-design":"api", "power-bi":"bi-analyst", devops:"cicd", devsecops:"security", "cyber-security":"security",
  aws:"cloud", "aws-best-practices":"cloud", "api-security-best-practices":"security", "ai-red-teaming":"security", "code-review-best-practices":"code-review",
};

export function getAssignment(topic: Topic, item?: CatalogItem): Assignment {
  const assignment = assignments[aliases[topic.id] ?? topic.id];
  if (assignment) return assignment;
  return brief(`Demonstrate ${topic.title}`, 4, [
    ["Define a small outcome", `Turn this exercise into a specific result: ${topic.exercise}`],
    ["Build and explain the result", `Use ${topic.title} in a small ${item?.title ?? "learning"} example. Keep the scope narrow and record the implementation decisions.`],
    ["Verify and document", "Test a successful case, an invalid input, and an empty result. Add setup instructions and a short explanation of the limitations."],
  ], "A reproducible example, verification notes, and setup instructions.", ["The result demonstrates the stated skill.", "The three verification cases are recorded.", "Another learner can follow the setup instructions."]);
}

export function hasCuratedAssignment(id: string) { return Boolean(assignments[aliases[id] ?? id]); }
export function assignmentKey(slug: string, topicId: string) { return `${slug}:${topicId}:assignment-v1`; }

export function suggestedMilestoneTasks(milestone: Milestone): AssignmentTask[] {
  if (milestone.tasks.length) return milestone.tasks;
  if (milestone.category === "skill") {
    return [
      {id:"step-1",title:"Define the working result",description:`Turn this outcome into three observable checks: ${milestone.deliverable} Prepare sample inputs that demonstrate each check.`},
      {id:"step-2",title:"Implement the core behavior",description:`Build a small working example for ${milestone.title}. Use the milestone's skills and produce this result: ${milestone.deliverable}`},
      {id:"step-3",title:"Verify and explain the result",description:"Run the three checks, include an invalid or incomplete input, and document the behavior. Keep the code or analysis, setup instructions, and verification evidence together."},
    ];
  }
  if (milestone.category === "credential") return [
    {id:"step-1",title:"Check the credential requirements",description:`Verify the current provider requirements for ${milestone.title}. Record prerequisites, the assessment format, and whether this credential fits your goal.`},
    {id:"step-2",title:"Practise the assessed skills",description:`Build one practice artifact for the skills ${milestone.skills.join(", ") || "in this milestone"}. Use the provider's objectives to find gaps.`},
    {id:"step-3",title:"Record readiness and evidence",description:`Complete a practice assessment and document the result and remaining gaps. Target outcome: ${milestone.deliverable}`},
  ];
  if (milestone.category === "role") return [
    {id:"step-1",title:"Map role requirements to evidence",description:`Find three relevant ${milestone.title} role descriptions. Compare their requirements with your existing projects and identify two evidence gaps.`},
    {id:"step-2",title:"Prepare a focused application",description:"Write a concise project case study and tailor your profile to the role. Use truthful evidence of your own work and working repository or demo links."},
    {id:"step-3",title:"Practise the role walkthrough",description:`Record a project walkthrough and answer five likely technical questions. Target outcome: ${milestone.deliverable}`},
  ];
  return [
    {id:"step-1",title:"Write the acceptance checklist",description:`For ${milestone.title}, define three observable behaviors and the sample inputs needed to demonstrate them. Use the milestone summary to keep the scope focused.`},
    {id:"step-2",title:"Produce the milestone deliverable",description:`Build this result: ${milestone.deliverable} Use ${milestone.skills.join(", ") || "the milestone's relevant skills"} and document the main decisions.`},
    {id:"step-3",title:"Verify and share the evidence",description:"Check the successful flow, one invalid input, and a failure or empty state. Keep the code, demo, or document together with reproducible verification notes."},
  ];
}
