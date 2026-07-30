/* -------------------------------------------------------------
   Sharon Karishma M — PM Portfolio Framework Wizard
   Implements the interactive "Test the Framework" step-by-step tool.
   ------------------------------------------------------------- */

(function() {
  // Wizard state manager
  class Wizard {
    constructor() {
      this.currentStep = 0;
      this.answers = {
        problem: '',
        system: '',
        realProblem: '',
        reframe: '',
        design: '',
        execute: ''
      };
      
      this.steps = [
        {
          key: 'problem',
          title: 'Input Your Product/Market Challenge',
          question: 'Describe a current friction point, stagnant metrics, or feature adoption blocker you are facing in your product organization.',
          placeholder: 'e.g., Our user onboarding dropout rate is 45%, or our B2B SaaS platform is struggling with high churn rates in mid-market accounts.',
          example: 'Sharon\'s Example: Hilti faced flat overhead anchoring sales in Chennai, and store associates faced high BOPIS wait times at Walmart.',
          tip: 'Tip: State the symptom exactly as you hear it from customers or sales teams.'
        },
        {
          key: 'system',
          title: 'Step 1: Understand the System',
          question: 'Who are all the stakeholders involved? What are their individual incentives and constraints? Where is the decision actually being made?',
          placeholder: 'e.g., End-users want speed; managers want reporting; IT security wants compliance. The purchase decision is made by the CFO.',
          example: 'Hilti Reference: The design consultant specifies materials, but the installation contractor modifies them for speed, and procurement cuts costs.',
          tip: 'Tools: Use Stakeholder Mapping, Ecosystem Value Chains, and Field Ethnography.'
        },
        {
          key: 'realProblem',
          title: 'Step 2: Identify the Real Problem (Not the Symptom)',
          question: 'What surface symptom are you hearing, and what deeper product, process, or perception issue does it point to?',
          placeholder: 'e.g., Surface: "The UI is too complex." Real: The user onboarding fails to explain the core value metric within the first 60 seconds.',
          example: 'Hilti Reference: Surface: "Sales are low." Real: Design speed bottlenecks and loose specification language made substitution easy.',
          tip: 'Tools: Apply 5 Whys Analysis and direct on-site observation.'
        },
        {
          key: 'reframe',
          title: 'Step 3: Reframe the Opportunity',
          question: 'If you solve the real problem, what becomes possible? Who benefits, and how do you align everyone\'s incentives?',
          placeholder: 'e.g., Instead of "making onboarding shorter," we "lock in value configuration upfront so users achieve immediate outcomes." ',
          example: 'Hilti Reference: Tightening specification compliance and providing speed tools removed substitution risk for contractors.',
          tip: 'Tools: Market Sizing, Segment Analysis, and Value Mapping.'
        },
        {
          key: 'design',
          title: 'Step 4: Design the Solution Systematically',
          question: 'What needs to change? (Product, Process, Positioning, or Pricing) What is your minimum viable intervention?',
          placeholder: 'e.g., Build a 1-click integrations gallery (Product) and create customer-success onboarding playbooks (Process).',
          example: 'Hilti Reference: 7-point retention strategy containing templates, rate cards, and a contractor CRM database.',
          tip: 'Tools: Solution Architecture, Impact Mapping, and Phased Rollouts.'
        },
        {
          key: 'execute',
          title: 'Step 5: Execute with Metrics',
          question: 'What does success look like quantified? How will you track progress, learn, and adjust in phases?',
          placeholder: 'e.g., Cut setup time from 15 mins to 2 mins. Track activation rate weekly and run post-signup user followups.',
          example: 'Cloudrevel Reference: Achieved 85% stakeholder satisfaction and a 40% gain in development handoff efficiency.',
          tip: 'Tools: KPI Dashboards, Phased Implementation, and Feedback Loops.'
        }
      ];
    }

    mount(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;
      this.render();
    }

    render() {
      if (this.currentStep < this.steps.length) {
        this.renderStep();
      } else {
        this.renderResults();
      }
    }

    renderStep() {
      const step = this.steps[this.currentStep];
      const answerVal = this.answers[step.key] || '';
      
      // Calculate progress percentage
      const progressPercent = Math.round((this.currentStep / this.steps.length) * 100);

      this.container.innerHTML = `
        <div class="wizard-box organic-card">
          <div class="wizard-header">
            <h3>Test the PM Framework</h3>
            <div class="wizard-steps-indicator">
              ${this.steps.map((s, idx) => `
                <div class="wizard-dot ${idx === this.currentStep ? 'active' : ''} ${idx < this.currentStep ? 'completed' : ''}"></div>
              `).join('')}
            </div>
          </div>
          
          <div class="wizard-step-body">
            <h4 style="margin-bottom: 8px; color: var(--accent-color);">${step.title}</h4>
            <label class="wizard-input-label">${step.question}</label>
            <textarea id="wizard-input-box" class="wizard-textarea" placeholder="${step.placeholder}">${answerVal}</textarea>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
              <div class="pillar-example" style="font-size:12px;">
                <strong>PM Checklist Tip:</strong> ${step.tip}
              </div>
              <div class="pillar-example" style="font-size:12px; border-left-color: var(--secondary-color);">
                <strong>Reference Case:</strong> ${step.example}
              </div>
            </div>
          </div>

          <div class="wizard-buttons">
            <button id="wiz-prev-btn" class="btn btn-secondary" ${this.currentStep === 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>Previous</button>
            <button id="wiz-demo-btn" class="btn btn-secondary">Autofill Demo</button>
            <button id="wiz-next-btn" class="btn btn-primary">${this.currentStep === this.steps.length - 1 ? 'Generate Report' : 'Next Step'}</button>
          </div>
        </div>
      `;

      // Attach event listeners
      document.getElementById('wiz-prev-btn').addEventListener('click', () => this.prev());
      document.getElementById('wiz-next-btn').addEventListener('click', () => this.next());
      document.getElementById('wiz-demo-btn').addEventListener('click', () => this.fillDemo());

      // Save content on keystroke
      const inputBox = document.getElementById('wizard-input-box');
      inputBox.focus();
    }

    fillDemo() {
      const step = this.steps[this.currentStep];
      const demoAnswers = {
        problem: 'Our mobile commerce checkout churn is high. 30% of users leave the app once they hit the billing info page.',
        system: 'Stakeholders: Mobile customers (demand quick checkouts), Risk managers (require fraud security checks), Engineers (struggle with third-party gateway lag).',
        realProblem: 'Symptom: Payment form is slow. Real problem: The payment form lacks saved credit card profiles and autofill options, causing users to re-enter data on tiny screens.',
        reframe: 'Shift from "optimizing backend payment gateways" to "storing local encrypted tokens to offer a 1-tap checkout option."',
        design: 'MVP Scoping: Introduce Apple Pay / Google Pay integrations (Product) and implement device token caching (Technology).',
        execute: 'Target KPIs: Increase checkout conversion from 70% to 92%. Reduce page load speed by 35%. Measure checkout completion rates weekly.'
      };

      const inputBox = document.getElementById('wizard-input-box');
      inputBox.value = demoAnswers[step.key];
    }

    prev() {
      if (this.currentStep > 0) {
        this.saveAnswer();
        this.currentStep--;
        this.render();
      }
    }

    next() {
      this.saveAnswer();
      const inputVal = this.answers[this.steps[this.currentStep].key];
      
      if (!inputVal || inputVal.trim() === '') {
        alert('Please fill out the entry or click "Autofill Demo" to proceed.');
        return;
      }

      this.currentStep++;
      this.render();
    }

    saveAnswer() {
      const inputBox = document.getElementById('wizard-input-box');
      if (inputBox) {
        const step = this.steps[this.currentStep];
        this.answers[step.key] = inputBox.value;
      }
    }

    renderResults() {
      this.container.innerHTML = `
        <div class="wizard-box organic-card" id="assessment-report">
          <div class="wizard-header">
            <h3>Framework Diagnosis Report</h3>
            <span class="case-domain-tag">Completed</span>
          </div>

          <p class="secondary" style="margin-bottom:24px;">Below is the systematic diagnostic breakdown of your product opportunity, mapping Sharon's 5-step problem solving framework.</p>
          
          <div class="wizard-results-summary">
            <div class="wizard-result-item">
              <h5>The Core Challenge</h5>
              <p>${this.escapeHTML(this.answers.problem)}</p>
            </div>
            <div class="wizard-result-item">
              <h5>Step 1: System Structure & Stakeholders</h5>
              <p>${this.escapeHTML(this.answers.system)}</p>
            </div>
            <div class="wizard-result-item">
              <h5>Step 2: The Root-Cause Problem</h5>
              <p>${this.escapeHTML(this.answers.realProblem)}</p>
            </div>
            <div class="wizard-result-item">
              <h5>Step 3: Reframed Value Proposition</h5>
              <p>${this.escapeHTML(this.answers.reframe)}</p>
            </div>
            <div class="wizard-result-item">
              <h5>Step 4: Systematic Solution Scoping</h5>
              <p>${this.escapeHTML(this.answers.design)}</p>
            </div>
            <div class="wizard-result-item">
              <h5>Step 5: Execution Dashboard & Success KPIs</h5>
              <p>${this.escapeHTML(this.answers.execute)}</p>
            </div>
          </div>

          <div class="wizard-buttons" style="margin-top: 32px;">
            <button id="wiz-reset-btn" class="btn btn-secondary">Restart Assessment</button>
            <button id="wiz-print-btn" class="btn btn-primary">Print / Save Report</button>
          </div>
        </div>
      `;

      // Event listeners
      document.getElementById('wiz-reset-btn').addEventListener('click', () => this.reset());
      document.getElementById('wiz-print-btn').addEventListener('click', () => {
        window.print();
      });
    }

    reset() {
      this.currentStep = 0;
      this.answers = {
        problem: '',
        system: '',
        realProblem: '',
        reframe: '',
        design: '',
        execute: ''
      };
      this.render();
    }

    escapeHTML(str) {
      if (!str) return '';
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  }

  // Register framework wizard globally
  window.FrameworkWizard = {
    mount: function(containerId) {
      const wiz = new Wizard();
      wiz.mount(containerId);
    }
  };
})();
