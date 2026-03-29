const QUESTIONS = {
  HR: {
    Easy: [
      "Tell me about yourself.",
      "What are your greatest strengths?",
      "Why do you want to work here?"
    ],
    Medium: [
      "Where do you see yourself in five years?",
      "Describe a time you disagreed with your manager.",
      "How do you handle stress and pressure?"
    ],
    Hard: [
      "What is your greatest professional failure, and what did you learn from it?",
      "Give an example of how you navigated a difficult ethical dilemma at work.",
      "If you were the CEO of this company, what is the first thing you would change?"
    ]
  },
  Technical: {
    Easy: [
      "Explain the difference between let, const, and var in JavaScript.",
      "What is an API?",
      "Describe the basic concept of version control."
    ],
    Medium: [
      "Explain the concept of closures in JavaScript.",
      "How does React's Virtual DOM work?",
      "Describe the differences between REST and GraphQL."
    ],
    Hard: [
      "Can you explain the event loop in Node.js?",
      "Design a system architecture for a highly scalable chat application.",
      "How would you optimize the performance of a Slow React application?"
    ]
  },
  Behavioral: {
    Easy: [
      "Tell me about a time you worked on a team.",
      "Describe a time you had to learn something quickly.",
      "How do you prioritize your daily tasks?"
    ],
    Medium: [
      "Tell me about a time you had to deal with a difficult colleague.",
      "Describe a situation where you had to adapt to a significant change at work.",
      "Give an example of a goal you reached and tell me how you achieved it."
    ],
    Hard: [
      "Tell me about a time you had to persuade someone who was strongly opposed to your idea.",
      "Describe a project that failed because of a mistake you made. How did you handle the aftermath?",
      "Give me an example of a time when you had to manage multiple conflicting priorities from different stakeholders."
    ]
  },
  Leadership: {
    Easy: [
      "What is your leadership style?",
      "How do you motivate a team?",
      "Describe a time you lead a project."
    ],
    Medium: [
      "How do you handle a team member who is underperforming?",
      "Tell me about a time you had to make an unpopular decision.",
      "How do you ensure your team meets its deadlines?"
    ],
    Hard: [
      "Describe a time you successfully led a team through a major crisis.",
      "How do you align your team's goals with the broader company strategy?",
      "Tell me about a time you had to mediate a serious conflict between two senior team members."
    ]
  },
  Situational: {
    Easy: [
      "What would you do if you realized you made a mistake on a report you just submitted?",
      "How would you handle a customer who is angry about a delay?",
      "What would you do if you were given a task you didn't know how to complete?"
    ],
    Medium: [
      "If you were assigned to work with a colleague you dislike, how would you ensure the project succeeds?",
      "Imagine your manager gives you negative feedback that you feel is unjustified. How do you respond?",
      "What would you do if you noticed a colleague taking credit for your work?"
    ],
    Hard: [
      "You are managing a project and key resources are suddenly pulled away. How do you ensure it still launches on time?",
      "If you discovered that a respected senior leader was engaging in unethical behavior, what steps would you take?",
      "You receive conflicting instructions from two different managers. How do you decide what to do?"
    ]
  }
};

export const getQuestions = (category, difficulty) => {
  if (QUESTIONS[category] && QUESTIONS[category][difficulty]) {
    return QUESTIONS[category][difficulty];
  }
  return ["Tell me about yourself.", "What are your greatest strengths?", "Why should we hire you?"];
};
