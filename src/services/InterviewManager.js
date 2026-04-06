const QUESTIONS = {
  HR: {
    Easy: [
      "Tell me about yourself of your educational background and hobbies.",
      "What are your greatest professional strengths?",
      "Why do you want to work for our company?",
      "Where do you see yourself in five years?",
      "What do you consider to be your weaknesses?",
      "Why should we hire you over other candidates?",
      "Can you describe your ideal work environment?",
      "What motivates you to do your best work?"
    ],
    Medium: [
      "Describe a time you disagreed with your manager and how you handled it.",
      "How do you handle stress and tight deadlines?",
      "Tell me about a time you made a mistake and how you recovered from it.",
      "How do you prioritize your work when you have multiple deadlines?",
      "Give me an example of a time you went above and beyond for a customer.",
      "Describe a time when you had to adapt to a significant change at work.",
      "How do you handle constructive criticism from a superior?",
      "Tell me about a time you successfully managed a conflict within your team."
    ],
    Hard: [
      "What is your greatest professional failure, and what did you learn from it?",
      "Give an example of how you navigated a complex ethical dilemma at work.",
      "If you were the CEO of this company, what is the first strategic goal you would pursue?",
      "Tell me about a time you heavily advocated for an unpopular idea.",
      "Describe a situation where a project failed miserably despite your best efforts.",
      "Tell me about a time you had to fire someone or relay extremely negative feedback.",
      "How would you handle a colleague who is constantly undermining your authority?",
      "Describe a time you had to pivot a major project at the last minute due to external factors."
    ]
  },
  Technical: {
    Easy: [
      "Explain the differences between let, const, and var in JavaScript.",
      "What is a RESTful API and how does it work?",
      "Describe the basic concepts underlying version control systems like Git.",
      "What is the difference between SQL and NoSQL databases?",
      "Explain the concept of Object-Oriented Programming (OOP).",
      "What is a deadlock in OS and how do you prevent it?",
      "Can you explain the difference between frontend and backend development?",
      "What are HTTP methods? Provide examples of GET and POST."
    ],
    Medium: [
      "Explain the concept of closures in JavaScript and provide a use case.",
      "How does React's Virtual DOM differ from the real DOM?",
      "Describe the differences and use cases between REST and GraphQL.",
      "Explain the concept of dependency injection in software architecture.",
      "How would you handle state management in a large React application?",
      "Explain what a database index is and how it improves performance.",
      "What is CORS and why is it important in web development?",
      "Can you explain the event loop in Node.js and how it handles asynchronous operations?"
    ],
    Hard: [
      "Design a system architecture for a highly scalable chat application like WhatsApp.",
      "How would you optimize the performance of a slow, legacy React application?",
      "Explain how you would implement a distributed caching mechanism using Redis.",
      "Design a rate limiter for a high-traffic public API.",
      "How do you detect and resolve memory leaks in a Node.js application?",
      "Explain the differences between microservices and monolithic architectures. What are the tradeoffs?",
      "Design a scalable URL shortener system like Bitly.",
      "How would you ensure data consistency in a distributed microservices environment?"
    ]
  },
  Behavioral: {
    Easy: [
      "Tell me about a time you worked successfully on a team.",
      "Describe a time you had to learn a completely new skill quickly.",
      "How do you stay organized when juggling multiple daily tasks?",
      "Tell me about a time you stepped out of your comfort zone.",
      "Describe a time when you received great customer service.",
      "What is your proudest professional achievement?",
      "Tell me about a time you helped a colleague who was struggling.",
      "How do you usually handle receiving difficult feedback?"
    ],
    Medium: [
      "Tell me about a time you had to deal with a difficult or negative colleague.",
      "Describe a situation where you lacked the resources to complete a task. What did you do?",
      "Give an example of a goal you reached and tell me precisely how you achieved it.",
      "Tell me about a time you had to take lead on a project you weren't officially managing.",
      "Describe a time you had to convince your team to use a new tool or process.",
      "Tell me about a time you missed a deadline. How did you communicate this?",
      "Describe a time when your communication skills prevented a problem.",
      "Tell me about a time you had to work with someone whose personality was the exact opposite of yours."
    ],
    Hard: [
      "Tell me about a time you had to persuade someone who was strongly and publicly opposed to your idea.",
      "Describe a serious project failure caused by a mistake you made. How did you handle the stakeholder fallout?",
      "Give me an example of a time when you had to manage multiple conflicting priorities from several different executive stakeholders.",
      "Tell me about a time you had to push back on a manager's request because it wasn't feasible.",
      "Describe a time you realized a project was going to fail and had to pull the plug.",
      "Tell me about a time you successfully navigated office politics to execute a project.",
      "Describe a time you had to bridge a significant cultural or communication gap with an international team.",
      "Tell me about a time you received completely conflicting instructions from two senior managers. How did you resolve it?"
    ]
  },
  Leadership: {
    Easy: [
      "What is your personal leadership style?",
      "How do you generally motivate a team to perform better?",
      "Describe a time you led a small project or initiative.",
      "How do you delegate tasks effectively?",
      "What makes a good manager in your opinion?",
      "Tell me about a time you mentored a junior team member.",
      "How do you celebrate successes within your team?",
      "Describe a time you had to onboard a new team member."
    ],
    Medium: [
      "How do you directly handle a team member who is consistently underperforming?",
      "Tell me about a time you had to make an unpopular decision that affected your team.",
      "How do you ensure your team consistently meets tight project deadlines?",
      "Describe a time you had to build team morale during a difficult period.",
      "How do you handle disagreements between two members of your team?",
      "Tell me about a time you had to step in and take over a failing project.",
      "Describe a time you advocated for your team's needs to upper management.",
      "How do you measure the success and growth of the individuals on your team?"
    ],
    Hard: [
      "Describe a time you successfully led a team through a major corporate crisis or restructuring.",
      "How do you translate and align your team's daily routines with the broader corporate strategy?",
      "Tell me about a time you had to mediate a serious, potentially legally-actionable conflict between two senior team members.",
      "Describe your strategy for leading a team where morale has completely collapsed.",
      "Tell me about a time you actively managed out a toxic high-performer.",
      "How do you foster a culture of innovation while maintaining strict operational standards?",
      "Describe a time you successfully pitched and secured funding for a new department initiative.",
      "Tell me about a time you inherited a team that was hostile to your leadership."
    ]
  },
  Situational: {
    Easy: [
      "What would you do if you realized you made a calculation error on a report you just submitted?",
      "How would you handle a customer who is immediately angry about a shipping delay?",
      "What would you do if you were given a critical task but didn't know how to complete it?",
      "If a coworker asks you to keep a secret about a minor policy violation, what do you do?",
      "What would you do if you noticed a safety hazard in the workplace?",
      "How would you respond if a client asks a question you don't confidently know the answer to?",
      "What would you do if you finished all your assigned work before the day ended?",
      "If the internet went down for an hour in the office, how would you stay productive?"
    ],
    Medium: [
      "If you were assigned to work extensively with a colleague you personally dislike, how would you ensure the project succeeds?",
      "Imagine your manager gives you a scathing performance review that you feel is completely unjustified. How do you respond?",
      "What would you do if you noticed a colleague taking direct credit for your work in a team meeting?",
      "If a client demands a feature that is out of scope and budget, how do you handle the conversation?",
      "You notice your manager is making a decision that will likely harm the project. What do you do?",
      "A key supplier suddenly goes out of business a week before your product launch. What is your immediate action plan?",
      "You are in a meeting where two departments are aggressively blaming each other for a delay. How do you center the conversation?",
      "A team member confides in you that they are experiencing burnout. How do you support them?"
    ],
    Hard: [
      "You are managing a multi-million dollar product launch and key developer resources are suddenly pulled away. How do you ensure it still launches on time?",
      "If you discovered that a highly respected executive leader was engaging in embezzlement, what specific steps would you take?",
      "You receive aggressively conflicting and mutually exclusive instructions from two different C-level executives. How do you decide what to do?",
      "A software bug causes a massive public data leak for your company. As the technical lead, what are your first three actions?",
      "You are asked to lay off 20% of your department. How do you determine who to let go, and how do you deliver the news?",
      "Your company is about to be acquired, and panic is spreading through the office. How do you maintain focus and productivity?",
      "A major client threatens to cancel their contract immediately unless you provide a service your company does not offer. How do you save the account?",
      "You realize that a product feature you pushed for is deeply unpopular with users and losing the company money. How do you proceed?"
    ]
  }
};

export const getQuestions = (category, difficulty) => {
  let questionsPool = [];

  if (QUESTIONS[category] && QUESTIONS[category][difficulty]) {
    questionsPool = [...QUESTIONS[category][difficulty]];
  } else {
    // Fallback if category/difficulty somehow doesn't match
    questionsPool = [
      "Tell me about yourself.", 
      "What are your greatest professional strengths?", 
      "Why should we hire you over other candidates?",
      "Where do you see yourself in five years?",
      "What do you consider to be your greatest weakness?",
      "Describe a challenging work scenario and how you handled it."
    ];
  }

  // Shuffle the questions randomly using the Fisher-Yates algorithm or soft sort
  const shuffled = questionsPool.sort(() => 0.5 - Math.random());
  
  // Return exactly 5 questions (or whatever max is available if fewer than 5)
  return shuffled.slice(0, 5);
};
