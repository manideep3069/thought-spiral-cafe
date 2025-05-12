
interface Quote {
  text: string;
  author: string;
}

const quotes: Quote[] = [
  {
    text: "The unexamined life is not worth living.",
    author: "Socrates"
  },
  {
    text: "Man is condemned to be free; because once thrown into the world, he is responsible for everything he does.",
    author: "Jean-Paul Sartre"
  },
  {
    text: "One cannot step twice in the same river.",
    author: "Heraclitus"
  },
  {
    text: "The mind is everything. What you think you become.",
    author: "Buddha"
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle"
  },
  {
    text: "I think therefore I am.",
    author: "René Descartes"
  },
  {
    text: "Life must be understood backward. But it must be lived forward.",
    author: "Søren Kierkegaard"
  },
  {
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Friedrich Nietzsche"
  },
  {
    text: "To be is to be perceived.",
    author: "George Berkeley"
  },
  {
    text: "Happiness is not something ready-made. It comes from your own actions.",
    author: "Dalai Lama"
  },
  {
    text: "Man is the measure of all things.",
    author: "Protagoras"
  },
  {
    text: "The life which is unexamined is not worth living.",
    author: "Plato"
  },
  {
    text: "Things which matter most must never be at the mercy of things which matter least.",
    author: "Johann Wolfgang von Goethe"
  },
  {
    text: "To know, is to know that you know nothing. That is the meaning of true knowledge.",
    author: "Socrates"
  },
  {
    text: "The only true wisdom is in knowing you know nothing.",
    author: "Socrates"
  }
];

export const getQuoteOfTheDay = (): Quote => {
  // Create a date string that changes once per day (year-month-day)
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  
  // Use the date string to generate a consistent index for today
  // This ensures the same quote shows all day, but changes each day
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Get a positive index within the range of our quotes array
  const index = Math.abs(hash) % quotes.length;
  return quotes[index];
};
