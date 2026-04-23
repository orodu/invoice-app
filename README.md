<b>Invoice Management Application</b> <br>
A fully functional, responsive invoice management system built as part of the Frontend Wizards Stage 2 Task. This application allows users to manage their billing workflow with ease, featuring a professional UI based on the provided Figma design.<br>
🚀 Live Demo<br>
(https://invoice-app-jade-gamma.vercel.app/)<br>
🛠 Setup Instructions<br>
To run this project locally, follow these steps:
1.	Clone the repository:
2.	git clone [https://github.com/yourusername/invoice-app.git](https://github.com/yourusername/invoice-app.git)
3.	Navigate to the project directory:
4.	cd invoice-app
5.	Install dependencies:
6.	npm install
7.	Start the development server:
8.	npm start
9.	Open the app: Navigate to http://localhost:3000 in your browser.<br>
🏗 Architecture Explanation<br>
This application is built using React and following a modular component-based architecture:
•	State Management: Utilizes React's useState and useEffect for local state handling. LocalStorage is integrated to ensure that invoice data and theme preferences (Light/Dark mode) persist across browser reloads.
•	Routing & Views: A conditional rendering logic manages the transition between the Invoice List Page, Invoice Detail Page, and the Invoice Form Component.
•	Styling: Built with Tailwind CSS to achieve a highly responsive design that adheres to the 320px (Mobile), 768px (Tablet), and 1024px (Desktop) breakpoints specified in the requirements.
•	Data Flow: A centralized data array handles CRUD operations, ensuring that updates to an invoice status (e.g., marking as Paid) reflect immediately across all views.<br>
⚖️ Trade-offs<br>
During development, the following technical trade-offs were made:
•	LocalStorage vs. Backend: For this stage, LocalStorage was chosen over a full-stack Node/Express backend. Trade-off: This provides instant performance and simplified deployment but limits data sharing across different devices/browsers.
•	Single-File Component Structure (Contextual): For the purpose of this specific delivery environment, logic was consolidated into a main App structure. Trade-off: While easier to review in one go, a production-scale app would typically split these into separate files for better maintainability.
•	Native Date Inputs: Used native HTML5 date pickers for the "Invoice Date" field. Trade-off: While consistent with browser defaults and highly accessible, it offers less visual customization compared to a third-party library like react-datepicker.<br>
♿ Accessibility Notes<br>
This app was built with WCAG AA standards in mind:
•	Semantic HTML: Used <main>, <section>, <header>, and <aside> to provide a clear document outline for screen readers.
•	Forms: Every input field is explicitly associated with a <label> element.
•	Interactivity: All buttons are built using the <button> tag to ensure they are keyboard-navigable and focusable.
•	Modals: The delete confirmation modal is designed to trap focus and can be dismissed using the ESC key.
•	Color Contrast: The color palette for both light and dark modes was verified to ensure text remains legible against all backgrounds.<br>
🌟 Improvements Beyond Requirements<br>
To enhance the user experience further, I added the following:
1.	Animated Transitions: Integrated CSS keyframe animations for side-panel form entries and view transitions to give the app a "premium" feel.
2.	Advanced ID Generation: Implemented a unique ID generator that follows the "Two letters + Four numbers" format (e.g., RT2034) commonly seen in professional invoicing software.
3.	Skeleton Loading/Empty States: Added a custom SVG-illustrated empty state to guide users when no invoices match the current filter.
4.	Input Masking: Basic formatting for currency and date strings to ensure consistent data presentation regardless of input method.

